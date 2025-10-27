import "./App.css"
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";


function App() {
  return(
	<div>
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home></Home>}></Route>
				<Route path="/register" element={<Register></Register>}></Route>

			</Routes>
		</HashRouter>

	</div>
  )
}

export default App
