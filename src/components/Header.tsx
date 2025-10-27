import "./Header.css"
import Logo from "../assets/images/chappy-logo.png"
function Header(){
	return(
		<div className="header">
			<img src={Logo} alt="Logo" />
		</div>
	)
}
export default Header