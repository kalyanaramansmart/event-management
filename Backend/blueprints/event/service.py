from db.mssql import get_connection
from utils.format_db_response import format_db_response
from utils.response import success, error
from datetime import datetime, timedelta
from flask import g, request


def get_all_event():
    conn = None
    cursor = None

    try:
        week_offset = int(request.args.get("weekOffset", 0))
        category_id = request.args.get("category")

        today = datetime.today()

        start_of_week = today - timedelta(days=(today.weekday() + 1) % 7)
        start_of_week += timedelta(weeks=week_offset)
        end_of_week = start_of_week + timedelta(days=7)

        query = """
            SELECT
                Slot_Id,
                Title,
                Start_At,
                End_At,
                Category_Id,
                Booked_By,
                Is_Active
            FROM Time_Slots
            WHERE
                Is_Active = 1
                AND Start_At >= ?
                AND Start_At < ?
        """

        params = [start_of_week, end_of_week]

        if category_id:
            query += " AND Category_Id = ?"
            params.append(category_id)

        query += " ORDER BY Start_At ASC"

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)

        events = format_db_response(cursor)

        for event in events:
            event["Is_Booked"] = event["Booked_By"] is not None
            event["Is_Booked_By_Me"] = (
                event["Booked_By"] == g.user["id"]
                if event["Booked_By"]
                else False
            )

        return success(
            "Events fetched successfully",
            {
                "weekStart": start_of_week.date(),
                "weekEnd": (end_of_week - timedelta(days=1)).date(),
                "events": events
            }
        )

    except ValueError:
        return error("Invalid query parameters", 400)

    except Exception as e:
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_event_by_id(event_id):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                Slot_Id,
                Title,
                Start_At,
                End_At,
                Category_Id,
                Booked_By,
                Is_Active
            FROM Time_Slots
            WHERE Slot_Id = ?
        """, event_id)

        event = format_db_response(cursor)

        if not event:
            return error("Event not found", 404)

        event = event[0]

        event["Is_Booked"] = event["Booked_By"] is not None
        event["Is_Booked_By_Me"] = (
            event["Booked_By"] == g.user["id"]
            if event["Booked_By"]
            else False
        )

        return success("Event fetched successfully", event)

    except Exception as e:
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def create_event(data):
    conn = None
    cursor = None
    try:
        required_fields = ["title", "date", "startAt", "endAt", "category"]

        if not data or not all(data.get(f) for f in required_fields):
            return error("Required fields are missing", 400)

        start_dt = datetime.strptime(
            f"{data['date']} {data['startAt']}",
            "%Y-%m-%d %H:%M"
        )

        end_dt = datetime.strptime(
            f"{data['date']} {data['endAt']}",
            "%Y-%m-%d %H:%M"
        )

        if end_dt <= start_dt:
            return error("End time must be after start time", 400)

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 1
            FROM Time_Slots
            WHERE
                Is_Active = 1
                AND Start_At < ?
                AND End_At > ?
        """, end_dt, start_dt)

        if cursor.fetchone():
            return error(
                "Another event is already scheduled during this time",
                409
            )

        cursor.execute("""
            INSERT INTO Time_Slots
                (Title, Start_At, End_At, Category_Id, Booked_By, Is_Active)
            OUTPUT INSERTED.Slot_Id
            VALUES (?, ?, ?, ?, ?, ?)
        """, data["title"], start_dt, end_dt, data["category"], None, 1)

        created = format_db_response(cursor)
        conn.commit()

        return success(
            "Event created successfully",
            {
                "Slot_Id": created[0]["Slot_Id"],
                "Title": data["title"],
                "Start_At": start_dt,
                "End_At": end_dt
            },
            201
        )

    except ValueError:
        return error("Invalid date or time format", 400)

    except Exception as e:
        if conn:
            conn.rollback()
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def update_event(event_id, data):
    conn = None
    cursor = None

    try:
        required_fields = ["title", "date", "startAt", "endAt", "category"]

        if not data or not all(data.get(f) for f in required_fields):
            return error("Required fields are missing", 400)

        start_dt = datetime.strptime(
            f"{data['date']} {data['startAt']}",
            "%Y-%m-%d %H:%M"
        )

        end_dt = datetime.strptime(
            f"{data['date']} {data['endAt']}",
            "%Y-%m-%d %H:%M"
        )

        if end_dt <= start_dt:
            return error("End time must be after start time", 400)

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT 1 FROM Time_Slots WHERE Slot_Id = ? AND Is_Active = 1",
            event_id
        )

        if not cursor.fetchone():
            return error("Event not found", 404)

        cursor.execute("""
            SELECT 1
            FROM Time_Slots
            WHERE
                Is_Active = 1
                AND Start_At < ?
                AND End_At > ?
                AND Slot_Id <> ?
        """, end_dt, start_dt, event_id)

        if cursor.fetchone():
            return error(
                "Another event is already scheduled during this time",
                409
            )

        cursor.execute("""
            UPDATE Time_Slots
            SET
                Title = ?,
                Start_At = ?,
                End_At = ?,
                Category_Id = ?
            WHERE Slot_Id = ?
        """, data["title"], start_dt, end_dt, data["category"], event_id)

        conn.commit()

        return success(
            "Event updated successfully",
            {
                "Slot_Id": str(event_id),
                "Title": data["title"],
                "Start_At": start_dt,
                "End_At": end_dt
            }
        )

    except ValueError:
        return error("Invalid date or time format", 400)

    except Exception as e:
        if conn:
            conn.rollback()
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def delete_event(event_id):
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Is_Active
            FROM Time_Slots
            WHERE Slot_Id = ?
        """, event_id)

        row = cursor.fetchone()
        if not row:
            return error("Event not found", 404)

        if row[0] == 0:
            return error("Event already deleted", 400)

        cursor.execute("""
            UPDATE Time_Slots
            SET Is_Active = 0
            WHERE Slot_Id = ?
        """, event_id)

        conn.commit()

        return success("Event deleted successfully")

    except Exception as e:
        if conn:
            conn.rollback()
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def update_slot(event_id):
    conn = None
    cursor = None
    user_id = g.user["id"]

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Booked_By, Is_Active
            FROM Time_Slots
            WHERE Slot_Id = ?
        """, event_id)

        row = cursor.fetchone()

        if not row:
            return error("Event not found", 404)

        booked_by, is_active = row

        if not is_active:
            return error("Event is inactive", 400)

        if booked_by is None:
            cursor.execute("""
                UPDATE Time_Slots
                SET Booked_By = ?
                WHERE Slot_Id = ?
            """, user_id, event_id)

            conn.commit()
            return success("Event booked successfully")

        if booked_by == user_id:
            cursor.execute("""
                UPDATE Time_Slots
                SET Booked_By = NULL
                WHERE Slot_Id = ?
            """, event_id)

            conn.commit()
            return success("Event unbooked successfully")

        return error("Event already booked by another user", 409)

    except Exception as e:
        if conn:
            conn.rollback()
        return error(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
