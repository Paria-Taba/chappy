import Header from "../components/Header"
import "../pages/channel.css"

function Channel(){
	return(
		<div >
			<div>
			<Header></Header>	</div>
			<div className="chat-page">
				<div className="channel">
					<h1>CHANNELS</h1>
				</div>
				<div className="DM">
					<h1>DIRECT MESSAGES</h1>
				</div>

			</div>
		</div>
	)
}
export default Channel