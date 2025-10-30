import Header from "../components/Header";
import { NavLink } from "react-router";
import "./Register.css";
import { useState } from "react";

function Register() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  interface User {
    userName: string;
    password: string;
  }

  async function registerUser() {
    setSuccessMessage("");
    setErrorMessage("");

    const newUser: User = {
      userName,
      password,
    };

    try {
      const res = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed");
        return;
      }

      console.log(data);
      setSuccessMessage("Registration successful! You can now log in."); 
      setPassword("");
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

        <button className="register-button" onClick={registerUser}>
          Register
        </button>

       
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <NavLink className="new-user" to={"/"}>
          Already a member? Log in
        </NavLink>
        <button className="guest">Continue as a guest</button>
      </div>
    </div>
  );
}

export default Register;
