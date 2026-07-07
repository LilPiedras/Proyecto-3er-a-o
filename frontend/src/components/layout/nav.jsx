import { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import { CiMenuFries } from "react-icons/ci";
import { Link } from "react-scroll";

const Nav = () => {
  const [scrolling, setScrolling] = useState(false);
  const [toggle,setoggle] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`header ${
          scrolling ? "bg-black" : "bg-transparent"
        } fixed w-full top-0 z-30 text-white p-5 flex md:justify-around justify-between items-center transition-all duration-500 ease-in-out`}
      >
  
        <img src={Logo} alt="Logo" className="w-20 cursor-pointer"/>

        <ul className="hidden md:flex gap-8 text-[18px]">
          <li className="cursor-pointer">
            <Link 
      activeClass="active" 
      to="Home" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000} 
    >
      Home
    </Link>
          </li>
          <li className="cursor-pointer">
            <Link 
      activeClass="active" 
      to="Program" 
      spy={true} 
      smooth={true} 
      offset={-60} 
      duration={1000} 
    >
      Program
    </Link>
          </li>
          <li className="cursor-pointer">
            <Link 
      activeClass="active" 
      to="About" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000} 
    >
      About
    </Link>
          </li>
          <li className="cursor-pointer">
            <Link 
      activeClass="active" 
      to="Testimonials" 
      spy={true} 
      smooth={true} 
      offset={-60} 
      duration={1000} 
    >
      Testimonials
    </Link>
          </li>
          <li className="cursor-pointer">
            <Link 
      activeClass="active" 
      to="Contact Us" 
      spy={true} 
      smooth={true} 
      offset={-60} 
      duration={1000} 
    >
      Contact Us
    </Link>
          </li>
        </ul>

        <div className="icon-div md:hidden z-50">
          <CiMenuFries
            className="text-2xl text-white " onClick={()=>setoggle(!toggle)}
          />
        </div>
        <div className={`main-size-bar fixed top-0 ${toggle ? "right-0 duration-300 ease-in-out transition-all" : "-right-full duration-300 ease-in-out transition-all" } w-full h-full z-30 bg-black/45 flex justify-end`}
        onClick={()=>setoggle(!toggle)}>
          <div className="child-div bg-blue-800 w-56">
            <ul className="flex flex-col justify-center items-center h-full">
              <li className="text-2xl font-Jost text-white">
                <Link 
      activeClass="active" 
      to="Home" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000}
      onClick={()=>setoggle(!toggle)} 
    >
      Home
    </Link>
              </li>
              <li className="text-2xl font-Jost mb-5 text-white">
                <Link 
      activeClass="active" 
      to="Program" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000} 
      onClick={()=>setoggle(!toggle)}
    >
      Program
    </Link>
              </li>
              <li className="text-2xl font-Jost mb-5 text-white">
                <Link 
      activeClass="active" 
      to="About" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000} 
      onClick={()=>setoggle(!toggle)}
    >
      About
    </Link>
              </li>
              <li className="text-2xl font-Jost mb-5 text-white">
                <Link 
      activeClass="active" 
      to="Testimonials" 
      spy={true} 
      smooth={true} 
      offset={50} 
      duration={1000}
      onClick={()=>setoggle(!toggle)}
    >
      Testimonials
    </Link>
              </li>
              <li className="text-2xl font-Jost mb-5 text-white">
                <Link 
      activeClass="active" 
      to="Contact Us" 
      spy={true} 
      smooth={true} 
      duration={1000} 
      onClick={()=>setoggle(!toggle)}
    >
      Contact Us
    </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;