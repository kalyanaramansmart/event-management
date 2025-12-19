import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../service/service"; // adjust path

export default function Login() {
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailId || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: emailId,
        password: password,
      };

      const res = await loginApi(payload);

      if (res.success) {
        const { token, role, id } = res.data;

        // store auth data
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", id);

        navigate("/calander");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        <h2 className="title">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Signup
          </span>
        </p>
      </div>
    </div>
  );
}
