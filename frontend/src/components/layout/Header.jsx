import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-black text-yellow-500 p-4 shadow-md sticky top-0 z-50 border-b border-white">
      <div className="container mx-auto flex justify-between items-center">
        
        <h1 className="text-xl font-bold">Academia Amada Fashion</h1>

        <div className="flex items-center gap-4">
          <div className="group/dropdown relative">
            
            <label htmlFor="menu-check" className="flex items-center gap-1 cursor-pointer hover:text-white transition">
              <span>Menu</span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-has-checked/dropdown:rotate-90" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </label>
            
            <input type="checkbox" id="menu-check" className="hidden peer" />
            
            <ul className="absolute top-full left-0 mt-2 bg-black border border-yellow-500/30 rounded-lg min-w-140px opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity duration-200 z-50">
              <li><Link to="/" className="block px-4 py-2 hover:bg-yellow-500/20">Home</Link></li>
              <li><Link to="/login" className="block px-4 py-2 hover:bg-yellow-500/20">Login</Link></li>
              <li><Link to="/registro" className="block px-4 py-2 hover:bg-yellow-500/20">Register</Link></li>
            </ul>
          </div>

          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
          
        </div>
      </div>
    </header>
  );
}