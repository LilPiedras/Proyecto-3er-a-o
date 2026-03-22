import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white py-4 px-6 shadow-lg border-b-4 border-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Academia Amada Fashion</h1>
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link to="/" className="hover:text-yellow-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-400 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-400 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}