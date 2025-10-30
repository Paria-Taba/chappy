import Header from "../components/Header"
import { NavLink } from "react-router"
import "./Register.css"
import { useState } from "react"
function Register(){
	const[userName,setUserName]=useState("")
	const[password,setPassword]=useState("")
	interface User{
		userName:string,
		password:string

	}

	async function registerUser () {
		const newUser:User={
			userName,
			password


		}
  const res = await fetch("http://localhost:4000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  });
  const data = await res.json();
  console.log(data);
  setUserName("")
  setPassword("")
};
	return(
		<div>
		<Header></Header>
		<div className="title-register">
		<h1>Register here!</h1>

		</div>
		<div className="content-register">
		
		<input type="text" placeholder="UserName:" value={userName} onChange={(e)=>setUserName(e.target.value)}/>
		<input type="text" placeholder="Password:" value={password} onChange={(e)=>setPassword(e.target.value)}/>

		<button className="register-button" onClick={registerUser}>Register</button>
		<NavLink className="new-user" to={"/"}>Already a member? Log in</NavLink>
			<button className="guest">Continue as a guest</button>
		</div>
		</div>
	)
}
export default Register