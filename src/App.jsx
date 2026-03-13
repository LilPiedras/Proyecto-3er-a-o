import { Routes, Route } from "react-router-dom"
import Fromc from "./components/From"
import Fromt from "./components/Fromr"
import Footers from "./components/Footer"

function App() {
  return (
    <>
      <Routes>

        <Route path="/" element={
          <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
              <Fromc />
            </div>
            <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-yellow-200 via-yellow-500 to-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full animate-bounce shadow-xl" />
              </div>
            </div>
          </div>
        } />

        <Route path="/registro" element={
          <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-black">
              <Fromt />
            </div>
            <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-yellow-200 via-yellow-500 to-black overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full animate-bounce shadow-xl" />
              </div>
            </div>
          </div>
        } />
      </Routes>
      <Footers />
    </>
  )
}

export default App