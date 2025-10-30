import Header from "../components/Header"
import "./Home.css"
import { NavLink } from "react-router"
function Home(){
	

	return(
		<div>
		<Header></Header>
		<div className="title-home">
		<h1>Welcome to Chappy</h1>
		
		</div>
		<div className="content-home">
		
		<input type="text" placeholder="UserName:" />
		
		<input type="text" placeholder="Password:" />
		<button className="LogIn-button">Log in</button>
		<NavLink className="new-user" to={"/register"}>New user? Create account</NavLink>
			<button className="guest">Continue as a guest</button>
		</div>
		</div>
	)
}
export default Home