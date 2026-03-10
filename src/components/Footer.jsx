import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    // 🔑 CLAVE: w-full + shrink-0 + mt-auto (backup)
    <footer className="w-full bg-black text-white py-6 shrink-0 mt-auto">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 w-11/12 max-w-7xl">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">GeeksForGeeks</h1>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3">Contacts</h3>
          <ul className="space-y-2 text-white/90">
            <li>Phone: +1 234 567 890</li>
            <li>Email: info@example.com</li>
            <li>Address: 123 Main Street, City</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Social Media</h3>
          <div className="flex gap-3">
            {[
              { href: "https://facebook.com", icon: FaFacebook, label: "Facebook" },
              { href: "https://twitter.com", icon: FaTwitter, label: "Twitter" },
              { href: "https://instagram.com", icon: FaInstagram, label: "Instagram" },
              { href: "https://linkedin.com", icon: FaLinkedin, label: "LinkedIn" }
            ].map((social, index) => (
              <a 
                key={index}
                href={social.href} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-2xl hover:text-gray-300 transition-colors"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Services</h3>
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
        <p>© {new Date().getFullYear()} GeeksForGeeks. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;