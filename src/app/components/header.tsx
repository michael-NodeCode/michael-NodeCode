'use client';
import React, { useEffect, useState } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { FaCircle } from 'react-icons/fa6';
import Image from 'next/image';
import { navLinks } from '@constants/index';
import { invoke } from '@tauri-apps/api/core';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { incrementDate, decrementDate, resetDate } from '@redux/dateSlice';
import { resetTitle } from '@redux/titleSlice';

function Header() {
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState('');
  const [showSidebarIcons, setShowSidebarIcons] = useState(false);

  const dispatch = useAppDispatch();
  const title = useAppSelector((state) => state.title.title);
  const currentDate = useAppSelector((state) => state.date.currentDate);

  const [color, setColor] = useState('text-green-400');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function greet() {
    try {
      await invoke('greet').then(() => {
        setColor('text-green-400');
      });
    } catch (error) {
      console.error(error);
      setColor('text-red-400');
    }
  }
  useEffect(() => {
    // greet();
  });

  return (
    <nav
      className={`max-w-full w-full sm:px-16 px-6 py-0 border-0 border-red-500 border-solid flex items-center justify-center fixed z-20 text-secondary bg-secondary transition-all duration-300 ease-in-out `}
    >
      <div className="w-full flex justify-between items-center text-inherit min-h-[72px]">
        <span className="flex items-center">
          <Image
            src={'/images/logo.png'}
            width={72}
            height={72}
            alt="Node logo"
            className="w-9 h-9 object-contain rounded-lg"
            onClick={() => {
              setShowSidebarIcons(!showSidebarIcons);
              dispatch(resetTitle());
              dispatch(resetDate());
            }}
          />
          <div className="flex flex-row justify-start items-center text-left text-primary -ml-2">
            {!title && (
              <MdKeyboardArrowLeft
                className="text-7xl leading-none -mr-4"
                onClick={() => dispatch(decrementDate())}
              />
            )}
            <span
              className={`flex flex-col justify-start items-start ${
                title ? 'ml-6' : ''
              }`}
            >
              <p className="font-extrabold text-2xl leading-none">
                {title || currentDate}
              </p>
            </span>
            {!title && (
              <MdKeyboardArrowRight
                className="text-7xl leading-none -ml-4"
                onClick={() => dispatch(incrementDate())}
              />
            )}
          </div>
        </span>
        <span className="flex flex-row items-center">
          <Image
            src={'/images/profile.png'}
            width={72}
            height={72}
            alt="logo"
            className="w-9 h-9 object-contain rounded-lg"
            onClick={() => {
              setToggle(!toggle);
            }}
          />
        </span>
        <div
          className={`${
            !toggle ? 'hidden' : 'flex'
          } p-6 bg-black shadow-primary w-full text-inherit absolute top-16 right-0 min-h-[100vh] my-2 min-w-[140px] z-10 overflow-hidden`}
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
            <li className="flex flex-row justify-center items-center text-center space-x-2 font-poppins font-medium cursor-pointer text-heading">
              <span>Connection</span>{' '}
              <FaCircle className={`${color} text-xl mt-2`} />
            </li>
          </ul>
        </div>
        <div
          className={`${
            !showSidebarIcons ? 'hidden' : 'flex'
          } p-6 bg-secondary shadow-primary text-inherit absolute top-16 left-0 h-max my-2 w-max z-10 overflow-hidden sm:hidden`}
        >
          <span className="flex flex-col justify-start items-center text-center space-y-6">
            <Image
              src={'/images/calendar.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
            <Image
              src={'/images/library.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
          </span>
        </div>
      </div>
    </nav>
  );
}

export default Header;
