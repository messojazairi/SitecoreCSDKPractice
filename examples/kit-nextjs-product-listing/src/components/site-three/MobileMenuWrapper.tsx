'use client';

import { useToggleWithClickOutside } from '@/hooks/useToggleWithClickOutside';
import { ReactNode } from 'react';

interface MobileMenuWrapperProps {
  children: ReactNode;
}

export const MobileMenuWrapper = ({ children }: MobileMenuWrapperProps) => {
  const { isVisible: isMobileMenuVisible, setIsVisible: setIsMobileMenuVisible } =
    useToggleWithClickOutside<HTMLDivElement>(false);

  return (
    <>
      <div
        className={`${
          isMobileMenuVisible
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } lg:!opacity-100 lg:!pointer-events-auto
          fixed lg:static top-14 left-0 right-0
          flex flex-col lg:flex-row items-center justify-center
          h-[calc(100vh-3.5rem)] lg:h-auto p-4 lg:p-0
          overflow-auto bg-background transition-all duration-300 ease-in-out`}
      >
        {children}
      </div>

      {/* Mobile Menu Toggle Button */}
      <li
        className="lg:hidden flex justify-center items-center p-4 cursor-pointer"
        onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
      >
        <span className="relative w-5 h-4">
          <span
            className={`absolute left-0 top-0 w-full h-0.5 bg-current origin-top-right transition-transform duration-300 ease-in-out ${
              isMobileMenuVisible ? '-rotate-47' : ''
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${
              isMobileMenuVisible ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`absolute left-0 bottom-0 w-full h-0.5 bg-current origin-bottom-right transition-transform duration-300 ease-in-out ${
              isMobileMenuVisible ? 'rotate-47' : ''
            }`}
          />
        </span>
      </li>
    </>
  );
};
