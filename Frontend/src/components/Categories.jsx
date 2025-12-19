import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategoriesApi } from "../service/service";

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategoriesApi();

      if (res.success) {
        setCategories(res.data);
      } else {
        setError(res.message || "Failed to fetch categories");
      }
    } catch (err) {
      setError("Unauthorized or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categories-wrapper">
      {/* Header */}
      <div className="categories-header">
        <h2>Categories</h2>
        <button className="btn-primary" onClick={() => navigate("/category")}>
          New Category
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {categories.map((cat) => (
        <div className="category-row" key={cat.Category_Id}>
          <input type="text" value={cat.Category_Name} disabled />
          <button
            className="btn-outline"
            onClick={() => navigate(`/category/${cat.Category_Id}`)}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
