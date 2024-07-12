'use client'
import React, { useState } from 'react';
import NavLinks from '@/app/ui/nav/side_navbar/sidenav-links';
import { footerLinks } from '@/app/constants/navigation';

export default function InformationMenu () {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative hidden md:block">
      <button
        onClick={toggleMenu}
        className="bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl focus:outline-none shadow-md shadow-black"
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute bottom-12 right-0 p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg w-48 z-10">
         <NavLinks navItems={footerLinks}/>
        </div>
      )}
    </div>
  );
};