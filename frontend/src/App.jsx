import { Routes, Route } from "react-router-dom"
import Footers from "./components/layout/Footer"
import Header2 from "./components/layout/Header2"
import AppRoutes from "./routes/AppRoutes";
import BotonArrow from "./components/common/ComponentArrow";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header2 />
      <AppRoutes />
      <Footers />
      <BotonArrow />
    </div>
  )
}

export default App