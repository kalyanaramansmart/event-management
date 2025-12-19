import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEventApi,
  updateEventApi,
  deleteEventApi,
  bookUnbookEventApi,
  getEventByIdApi,
  getCategoriesApi,
} from "../service/service";

export default function Event() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem("role");

  const isEdit = Boolean(id);
  const isAdmin = role === "Admin";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState("");



  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategoriesApi();
    if (res.success) setCategories(res.data);
  };



  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEventByIdApi(id);

      if (res.success) {
        const e = res.data;
        setEventData(e);
        setTitle(e.Title);

        console.log(e, "This is the event data");

        const startDateObj = new Date(e.Start_At.replace(" GMT", ""));
        setDate(startDateObj.toISOString().split("T")[0]);


        const startHour = String(startDateObj.getHours()).padStart(2, "0");
        setStartAt(`${startHour}:00`);

        const endHour = Number(startHour) + 1;
        setEndAt(`${String(endHour).padStart(2, "0")}:00`);

        setCategory(e.Category_Id);
      }
    } catch {
      setError("Failed to load event");
    }
  };


  const handleStartTimeChange = (e) => {
    const start = e.target.value;
    setStartAt(start);

    const [hour] = start.split(":").map(Number);
    const endHour = hour + 1;
    setEndAt(`${String(endHour).padStart(2, "0")}:00`);
  };



  const handleSave = async () => {
    setError("");

    if (!title || !date || !startAt || !endAt || !category) {
      setError("All fields required");
      return;
    }

    const payload = { title, date, startAt, endAt, category };

    try {
      const res = isEdit
        ? await updateEventApi(id, payload)
        : await createEventApi(payload);

      if (!res.success) {
        setError(res.message);
        return;
      }

      navigate("/calander");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };



  const handleDelete = async () => {
    await deleteEventApi(id);
    navigate("/calander");
  };



  const handleBookUnbook = async () => {
    await bookUnbookEventApi(id);
    fetchEvent();

    navigate("/calander");
  };



  return (
    <div className="modal-overlay">
      <div className="event-modal">
        <h3>{isEdit ? "Event Details" : "Create Event"}</h3>

        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label>Event Title</label>
          <input
            type="text"
            value={title}
            readOnly={!isAdmin}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            readOnly={!isAdmin}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="time-row">
          <div className="form-group">
            <label>Start</label>
            <input
              type="time"
              value={startAt}
              step="3600"
              readOnly={!isAdmin}
              onChange={handleStartTimeChange}
            />
          </div>

          <div className="form-group">
            <label>End</label>
            <input type="time" value={endAt} readOnly />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            disabled={!isAdmin}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.Category_Id} value={cat.Category_Id}>
                {cat.Category_Name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => navigate("/calander")}>
            Cancel
          </button>

          {isAdmin && (
            <>
              <button className="btn-primary" onClick={handleSave}>
                {isEdit ? "Update" : "Create"}
              </button>

              {isEdit && (
                <button className="btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </>
          )}

          {role === "User" && eventData && (
            <>
              {!eventData.Is_Booked && (
                <button className="btn-primary" onClick={handleBookUnbook}>
                  Book
                </button>
              )}

              {eventData.Is_Booked_By_Me && (
                <button className="btn-primary" onClick={handleBookUnbook}>
                  Unbook
                </button>
              )}

              {eventData.Is_Booked && !eventData.Is_Booked_By_Me && (
                <button className="btn-cancel" disabled>
                  Already Booked
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
