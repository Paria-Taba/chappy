import Header from "../components/Header";
import "./Home.css";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";

function Home() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  async function loginUser() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Invalid username or password");
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);
	  console.log("token", data.token)
      setSuccess(true);

      // Optional redirect after short delay
      setTimeout(() => navigate("/channels"), 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <Header />
      <div className="title-home">
        <h1>Welcome to Chappy</h1>
      </div>

      <div className="content-home">
        <input
          type="text"
          placeholder="UserName:"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password:"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="LogIn-button"
          onClick={loginUser}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

	{error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Login successful!</p>}

        

        <NavLink className="new-user" to={"/register"}>
          New user? Create account
        </NavLink>
        <button className="guest">Continue as a guest</button>
      </div>
    </div>
  );
}

export default Home;
