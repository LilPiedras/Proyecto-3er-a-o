import Gift1 from "../assets/foto1.jpg"

const Contact = () => {
  return (
    <>
      <div className="main-contact min-h-screen bg-white py-10 " id="Contact Us">
        <h1 className="text-center text-2xl font-bold mb-10">Contact Page</h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-4">
          {/* Imagen */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img src={Gift1} alt="" className="w-96 rounded-2xl" />
          </div>
          
          {/* Formulario */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-2">Got A Problem</h2>
            <h3 className="text-xl mb-6">
              We are <span className="text-blue-600">Happy</span> to <span className="text-blue-600">Help</span> You
            </h3>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Enter your Name"
                  className="w-full p-4 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                
                {/* Email Input */}
                <input 
                  type="email" 
                  placeholder="Enter your Email"
                  className="w-full p-4 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              {/* Country y Phone Inputs */}
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Country"
                  className="w-full p-4 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
                
                <input 
                  type="text" 
                  placeholder="Phone"
                  className="w-full p-4 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              {/* Textarea */}
              <textarea 
                name="" 
                id="" 
                rows={5} 
                placeholder="Type Here..."
                className="w-full p-4 rounded-md font-Jost focus:border-[1.34px] focus:border-blue-500 border-[1.33px] border-black"
              ></textarea>
              
              {/* Button */}
              <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact;