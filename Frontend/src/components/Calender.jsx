import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEventApi, getCategoriesApi } from "../service/service";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export default function Calendar() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [weekoffset, setWeekoffset] = useState(0);
  const [weekStart, setWeekStart] = useState(null);

  const role = localStorage.getItem("role");


  const [bookedByMe, setBookedByMe] = useState(false);


  const parseLocalDate = (dateStr) => {
    return new Date(dateStr.replace(" GMT", ""));
  };

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };



  const filteredEvents = useMemo(() => {
    if (!bookedByMe) return events;


    return events.filter((e) => e.Is_Booked_By_Me === true);
  }, [events, bookedByMe]);



  const eventMap = useMemo(() => {
    if (!weekStart) return {};

    const map = {};
    const weekStartDate = new Date(weekStart);
    weekStartDate.setHours(0, 0, 0, 0);

    filteredEvents.forEach((event) => {
      const start = parseLocalDate(event.Start_At);
      const end = parseLocalDate(event.End_At);

      const eventDate = new Date(start);
      eventDate.setHours(0, 0, 0, 0);

      const dayIndex = Math.floor((eventDate - weekStartDate) / MS_IN_DAY);

      const hour = start.getHours();

      if (dayIndex >= 0 && dayIndex < 7) {
        map[`${dayIndex}-${hour}`] = {
          ...event,
          start,
          end,
        };
      }
    });

    return map;
  }, [filteredEvents, weekStart]);

  const getEventForCell = (dayIndex, hour) => eventMap[`${dayIndex}-${hour}`];

  /* ---------------- API ---------------- */

  const fetchEvents = async () => {
    try {
      const res = await getEventApi(category, weekoffset);
      if (res.success) {
        setEvents(res.data.events);
        setWeekStart(res.data.weekStart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesApi();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, weekoffset]);

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h2>Events</h2>

        {/* ✅ WEEK NAVIGATION */}
        <div className="week-nav" style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-primary"
            onClick={() => setWeekoffset((p) => p - 1)}
          >
            ⟵ Previous
          </button>

          <button className="btn-primary" onClick={() => setWeekoffset(0)}>
            Current
          </button>

          <button
            className="btn-primary"
            onClick={() => setWeekoffset((p) => p + 1)}
          >
            Next ⟶
          </button>
        </div>
        {/* ✅ USER CONTROLS */}
        <div className="actions">
          {/* USER ONLY */}
          {role !== "Admin" && (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={bookedByMe}
                onChange={(e) => setBookedByMe(e.target.checked)}
              />
              Booked by me
            </label>
          )}

          {/* ✅ CATEGORY DROPDOWN FOR ALL */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.Category_Id} value={cat.Category_Id}>
                {cat.Category_Name}
              </option>
            ))}
          </select>

          {/* ADMIN ONLY */}
          {role === "Admin" && (
            <>
              <button
                className="btn-outline"
                onClick={() => navigate("/categories")}
              >
                View All Category
              </button>

              <button
                className="btn-primary"
                onClick={() => navigate("/event")}
              >
                New Event
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------- CALENDAR GRID ---------------- */}
      <div className="calendar-grid">
        <div className="corner-cell" />

        {DAYS.map((day, index) => {
          const dateObj = weekStart
            ? new Date(new Date(weekStart).getTime() + index * MS_IN_DAY)
            : null;

          const formattedDate = dateObj
            ? dateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "";

          return (
            <div key={day} className="day-header">
              📅 {day} {formattedDate}
            </div>
          );
        })}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="time-cell">{formatHour(hour)}</div>

            {DAYS.map((_, dayIndex) => {
              const event = getEventForCell(dayIndex, hour);

              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="slot"
                  style={{ position: "relative" }}
                >
                  {event && (
                    <div
                      className={`event-card ${
                        event.Is_Booked_By_Me ? "my-event" : ""
                      }`}
                      onClick={() => navigate(`/event/${event.Slot_Id}`)}
                    >
                      <strong>{event.Title}</strong>
                      <br />
                      <small>
                        {event.start.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {event.end.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
