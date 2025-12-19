import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getCategoryByIdApi,
} from "../service/service";

export default function Category() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await getCategoryByIdApi(id);

      console.log("API RESPONSE:", res);

      if (res.success && res.data.length > 0) {
        setCategoryName(res.data[0].Category_Name);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreate = async () => {
    if (!categoryName) return setError("Category name required");

    try {
      setLoading(true);
      const res = await createCategoryApi({
        categoryName,
      });

      if (res.success) {
        navigate("/categories");
      }
    } catch {
      setError("Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!categoryName) return setError("Category name required");

    try {
      setLoading(true);
      const res = await updateCategoryApi(id, {
        categoryName,
      });

      if (res.success) {
        navigate("/categories");
      }
    } catch {
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure?")) return;

    try {
      setLoading(true);
      const res = await deleteCategoryApi(id);

      if (res.success) {
        navigate("/categories");
      }
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="category-modal">
        <h3>{isEditMode ? "Update / Delete Category" : "Create Category"}</h3>

        <div className="form-group">
          <label>Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions center">
          <button
            className="btn-outline"
            onClick={() => navigate("/categories")}
          >
            Cancel
          </button>

          {!isEditMode && (
            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              Create
            </button>
          )}

          {isEditMode && (
            <>
              <button
                className="btn-primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                Update
              </button>

              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
