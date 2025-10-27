import Header from "../components/Header"
import { NavLink } from "react-router"
import "./Register.css"
function Register(){
	return(
		<div>
		<Header></Header>
		<div className="title-register">
		<h1>Register here!</h1>

		</div>
		<div className="content-register">
		
		<input type="text" placeholder="UserName:" />
		<input type="text" placeholder="Email:" />
		<input type="text" placeholder="Password:" />

		<button className="register-button">Register</button>
		<NavLink className="new-user" to={"/"}>Already a member? Log in</NavLink>
			<button className="guest">Continue as a guest</button>
		</div>
		</div>
	)
}
export default Register