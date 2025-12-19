from db.mssql import get_connection
from utils.response import success, error
from utils.format_db_response import format_db_response


def get_all_categories():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Category_Id, Category_Name
            FROM Categories
            WHERE Is_Active = 1
        """)

        data = format_db_response(cursor=cursor)

        return success("Categories fetched successfully", data)
    except Exception as e:
        return error(str(e))
    finally:
        cursor.close()
        conn.close()


def get_category_by_id(category_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Category_Id, Category_Name, Is_Active
            FROM Categories
            WHERE Category_Id = ? AND Is_Active = 1
        """, str(category_id))

        data = format_db_response(cursor=cursor)

        if not data:
            return error("Category not found", 404)

        return success("Category fetched successfully", data)
    except Exception as e:
        return error(str(e))
    finally:
        cursor.close()
        conn.close()


def create_category(data):
    try:
        if not data or not data.get("categoryName"):
            return error("Category name is required", 400)

        conn = get_connection()
        cursor = conn.cursor()

        # Duplicate check
        cursor.execute("""
            SELECT COUNT(*) FROM Categories
            WHERE Category_Name = ?
        """, data["categoryName"])

        if cursor.fetchone()[0]:
            return error("Category already exists", 409)

        cursor.execute("""
        INSERT INTO
            Categories (Category_Name)
        OUTPUT
            INSERTED.Category_Id
        VALUES (?)
    """, data["categoryName"])

        created_data = format_db_response(cursor=cursor)

        print(created_data)

        conn.commit()

        return success("Category created successfully", {
            "Category_Id": created_data[0].get('Category_Id'),
            "Category_Name": data["categoryName"]
        }, 201)
    except Exception as e:
        return error(str(e))
    finally:
        cursor.close()
        conn.close()


def update_category(category_id, data):
    try:
        if not data or not data.get("categoryName"):
            return error("Category name is required", 400)

        conn = get_connection()
        cursor = conn.cursor()

        # Duplicate check
        cursor.execute("""
            SELECT COUNT(*) FROM Categories
            WHERE Category_Name = ?
        """, data["categoryName"])

        if cursor.fetchone()[0]:
            return error("Category already exists", 409)

        cursor.execute("""
            UPDATE Categories
            SET Category_Name = ?
            WHERE Category_Id = ? AND Is_Active = 1
        """, data["categoryName"], str(category_id))

        if cursor.rowcount == 0:
            return error("Category not found", 404)

        conn.commit()

        return success("Category updated successfully")
    except Exception as e:
        return error(str(e))
    finally:
        cursor.close()
        conn.close()


def delete_category(category_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE Categories
            SET Is_Active = 0
            WHERE Category_Id = ? AND Is_Active = 1
        """, str(category_id))

        if cursor.rowcount == 0:
            return error("Category not found", 404)

        conn.commit()

        return success("Category deleted successfully")
    except Exception as e:
        return error(str(e))
    finally:
        cursor.close()
        conn.close()
