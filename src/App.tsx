import "./App.css"
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Channel from "./pages/Channel";


function App() {
  return(
	<div>
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home></Home>}></Route>
				<Route path="/register" element={<Register></Register>}></Route>
				<Route path="/channel" element={<Channel></Channel>}></Route>

			</Routes>
		</HashRouter>

	</div>
  )
}

export default App
