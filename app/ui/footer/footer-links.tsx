import React from 'react';
import Link from 'next/link';
import { footerLinks } from '@/app/constants/navigation';

const filteredFooterLinks = footerLinks.filter(footerLink => !['Support', 'Pricing'].includes(footerLink.name))

const FooterLinks = () => {
  return (
      <div className="flex flex-row items-center text-center  justify-between px-8 gap-4">
        {filteredFooterLinks.map((footerItem, index) => {
            return (
              <Link
                key={index.toString()}
                href={footerItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                {footerItem.name}
              </Link>
            )})}
      </div>
  );
};

export default FooterLinks