import "./App.css"
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Channel from "./pages/Channel";
import GuestPage from "./pages/guest";
import DMPage from "./pages/dmPage";
import ChannelChat from "./pages/channelChat";



function App() {
  return(
	<div>
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home></Home>}></Route>
				<Route path="/register" element={<Register></Register>}></Route>
				<Route path="/channel" element={<Channel></Channel>}></Route>
				<Route path="/guest" element={<GuestPage></GuestPage>}></Route>
				<Route path="/dm/:userName" element={<DMPage />} />
				<Route path="/channels/:channelId" element={<ChannelChat />} />

        

			</Routes>
		</HashRouter>

	</div>
  )
}

export default App
