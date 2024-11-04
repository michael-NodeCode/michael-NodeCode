'use client';

import React, { useEffect, useState } from 'react';
import { navLinks } from '../constants';
import Link from 'next/link';
import { BsMenuUp } from 'react-icons/bs';
import { FaWindowClose } from 'react-icons/fa';
import Image from 'next/image';

function Header() {
  const [active, setActive] = useState('');
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 1) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`max-w-full w-full sm:px-16 px-6 py-5 border-0 border-red-500 border-solid flex items-center justify-center fixed z-20 text-secondary ${
        scrolled
          ? 'bg-primary shadow-secondary backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full flex justify-between items-center text-inherit">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => {
            setActive('');
            window.scrollTo(0, 0);
          }}
        >
          <Image
            src={'/images/logo.png'}
            width={72}
            height={72}
            alt="logo"
            className="w-9 h-9 object-contain rounded-lg"
          />
          <p className="text-heading md:text-3xl font-extrabold cursor-pointer">
            NodeCode
          </p>
        </Link>
        <span className="flex flex-row justify-between gap-10 max-lg:gap-6 max-md:gap-6 items-center">
          <ul className="list-none hidden sm:flex flex-row gap-10 max-md:gap-6">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`${
                  active === nav.title ? 'text-inherit' : 'text-secondary'
                } text-[18px] font-medium cursor-pointer`}
                onClick={() => setActive(nav.title)}
              >
                <a href={`${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </span>
        <div className="sm:hidden justify-end items-center">
          {toggle ? (
            <>
              <FaWindowClose
                className={`text-inherit font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px] h-[28px] w-[28px]`}
                onClick={() => setToggle(!toggle)}
              />
            </>
          ) : (
            <>
              <BsMenuUp
                className={`text-inherit font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px] h-[28px] w-[28px]`}
                onClick={() => setToggle(!toggle)}
              />
            </>
          )}
          <div
            className={`${
              !toggle ? 'hidden' : 'flex'
            } p-6 bg-black shadow-primary w-full text-inherit absolute top-16 right-0 min-h-[100vh] my-2 min-w-[140px] z-10 rounded-xl overflow-hidden`}
          >
            <ul className="list-none flex justify-start flex-1 flex-col gap-8 mt-16 items-center">
              {navLinks.map((nav) => (
                <li
                  key={nav.id}
                  className={`font-poppins font-medium cursor-pointer text-heading ${
                    active === nav.title ? '' : 'text-inherit'
                  }`}
                  onClick={() => {
                    setToggle(!toggle);
                    setActive(nav.title);
                  }}
                >
                  <a href={`${nav.id}`}>{nav.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
