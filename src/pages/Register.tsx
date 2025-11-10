import  { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import Header from "../components/Header";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function registerUser() {
    setSuccessMessage("");
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Username and password are required.");
      return;
    }

    const newUser = { username, password };

    try {
      const res = await fetch("http://localhost:4000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed.");
        return;
      }

      setSuccessMessage("Registration successful! Redirecting to login...");
    
      setUsername("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Try again.");
    }
  }

  return (
    <div>
      <Header />
      <div className="title-register">
        <h1>Register here!</h1>
      </div>

      <div className="content-register">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="register-button" onClick={registerUser}>
          Register
        </button>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <NavLink className="new-user" to={"/"}>
          Already a member? Log in
        </NavLink>
        
         <NavLink to={"/guest"} className="guest">Continue as a guest</NavLink>
      </div>
    </div>
  );
}

export default Register;