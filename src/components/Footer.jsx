import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaLink } from 'react-icons/fa';

const Footer = () => {
  return (  
    <footer className=" bg-black text-white flex-shrink: 0; mt-auto">
      <div className="flex w-full h-2 mb-4 bg-white"></div>
      <div className="border-tp border-yellow-300 text-center text-sm text-white/70"></div>
      <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 w-11/12 max-w-7xl">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Amada Fashion</h1>
        </div>
        <div>
          <h3 className="text-yellow-300 text-xl font-bold mb-3">Contactos</h3>
          <ul className="space-y-2 text-white/90">
            <li>Telefono: +58 412-7048542</li>
            <li>Email: </li>
            <li>Dirección: Av.Táchira, San Cristóbal 5001 Táchira</li>
          </ul>
        </div>
        <div>
          <h3 className="text-yellow-300 text-xl font-bold mb-2">Redes Sociales</h3>
          <div className="flex gap-3">
            {[
              { href: "https://www.facebook.com/p/Amada-Fashion-61560497210241/", icon: FaFacebook, label: "Facebook" },
              { href: "https://www.instagram.com/amadafashionsc/", icon: FaInstagram, label: "Instagram" },
              { href: "https://linktr.ee/amadafashionsc", icon: FaLink, label: "LinkedIn" }
            ].map((social, index) => (
              <a 
                key={index}
                href={social.href} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-2xl hover:text-gray-400 transition-colors"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-yellow-300 text-xl font-bold mb-2">Servicios</h3>
          <ul className="space-y-2">
            {['Web Development', 'App Development', 'SEO Optimization'].map((service, index) => (
              <li key={index}>
                <a href="#" className="hover:underline text-white/90 transition-colors">
                  {service}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>
      
      {/* Copyright */}
      <div className="mt-6 pt-4 border-t border-yellow-300 text-center text-sm text-white/70">
        <p>© {new Date().getFullYear()} Amada Fashion SC. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;