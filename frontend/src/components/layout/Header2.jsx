import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import Logo from "../../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";

const Header = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-500 bg-black`}>
      <div className="p-5 flex justify-between md:justify-around items-center text-white">

        <img src={Logo} alt="Logo" className="w-20 cursor-pointer" />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-[18px]">
          <li><RouterLink to="/" className="cursor-pointer hover:text-yellow-400">Home</RouterLink></li>
          <li><RouterLink to="/program" className="cursor-pointer hover:text-yellow-400 transition">Program</RouterLink></li>
          <li><RouterLink to="/about" className="cursor-pointer hover:text-yellow-400">About</RouterLink></li>
          <li><RouterLink to="/testimonials" className="cursor-pointer hover:text-yellow-400">Testimonials</RouterLink></li>
          <li><RouterLink to="/contact" className="cursor-pointer hover:text-yellow-400">Contact</RouterLink></li>
          <li><RouterLink to="/login" className="cursor-pointer hover:text-yellow-400">Login</RouterLink></li>
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden z-50">
          <CiMenuFries 
            className="text-3xl cursor-pointer" 
            onClick={() => setToggle(!toggle)} 
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {toggle && (
        <div className="fixed inset-0 bg-black/90 z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl">
            <RouterLink to="/" onClick={() => setToggle(false)}>Home</RouterLink>
            <RouterLink to="/login" onClick={() => setToggle(false)}>Login</RouterLink>
            <RouterLink to="/registro" onClick={() => setToggle(false)}>Registro</RouterLink>
            <RouterLink to="/about" onClick={() => setToggle(false)}>About</RouterLink>
            <RouterLink to="/contact" onClick={() => setToggle(false)}>Contact</RouterLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;