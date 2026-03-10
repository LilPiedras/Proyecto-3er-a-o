import Fromc from "./components/From"
import Footers from "./components/Footer"

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <div className="flex flex-1 w-full overflow-hidden">
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <Fromc />
        </div>
        <div className="hidden relative lg:flex lg:w-1/2 items-center justify-center bg-linear-to-tr from-gold-light via-gold-dark to-black-rich overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-60 h-60 bg-[url('/img/Logo.png')] bg-cover rounded-full animate-bounce duration-10 shadow-xl"  />  
            <div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <Footers />
      
    </div>
  )
}

export default App