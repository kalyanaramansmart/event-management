import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../service/service"; // adjust path

export default function Signup() {
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // basic validation
    if (!emailId || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: emailId,
        password: password,
      };

      const res = await signupApi(payload);

      if (res.success) {
        alert(res.message);
        navigate("/"); // go to login
      } else {
        setError(res.message || "Signup failed");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="signup-card">
        <h2 className="title">Signup</h2>

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
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="login-text">
          Already have an account?
          <span
            className="login-link"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
