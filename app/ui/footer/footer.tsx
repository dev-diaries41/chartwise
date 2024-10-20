
'use client'
import React from 'react';
import FooterLinks from './footer-links';
import InformationMenu from '@/app/ui/common/info-menu';
import { usePathname, useSearchParams } from 'next/navigation';
import { shouldHide } from '@/app/lib/helpers';
import { footerLinks, navLinks } from '@/app/constants/navigation';
import Link from 'next/link';
import Logo from '../logo';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDivide, faGripVertical, faMinus } from '@fortawesome/free-solid-svg-icons';


export default function Footer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const pathsToHide = ['/dashboard', '/login', '/register'];
  const onLandingPage = pathname === '/'
  const onDashboard = pathname === '/dashboard';
  const hide = (shouldHide(pathname, pathsToHide) || (callbackUrl && new URL(callbackUrl).pathname === '/dashboard'))

  return (
    <footer className={`flex flex-col justify-center mt-auto text-sm ${onLandingPage? 'bg-gray-900' : ''}`}>
     {!hide&& (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 mx-auto max-w-7xl justify-between items-end p-4 gap-8">
        <div className='flex flex-col items-start gap-2 order-2'>
          <div className='flex flex-row items-center justify-center gap-2'>
            {/* <Link href={'/'} className='z-50'>
              <Logo src={'/chartwise-icon.png'}/>
            </Link>
            <div className="mx-2 h-7 w-px bg-gray-700"></div>             */}
            <Link href="https://www.instagram.com/signsafemusic" target="_blank" rel="noopener noreferrer">
              <Image
                src="/x-logo.svg"
                alt="X (Twitter)"
                width={24}
                height={24}
                className='dark:invert'
              />
            </Link>
            <Link href="https://www.instagram.com/signsafemusic" target="_blank" rel="noopener noreferrer">
              <Image
                src="/telegram-logo.svg"
                alt="Telegram"
                width={24}
                height={24}
                className=''
              />
            </Link>
          </div>
          <p className="opacity-80">
            Copyright © {new Date().getFullYear()} FPF Labs. All rights reserved.
          </p>
        </div>
        <FooterLinks links={footerLinks}/>
      </div>
    )}
      {onDashboard && <div className='fixed bottom-4 right-4'>
        <InformationMenu/>
      </div>
      }
    </footer>
  );
};
