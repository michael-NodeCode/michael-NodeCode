'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { navLinks } from '@constants/index';

function Sidebar() {
  const [toggle, setToggle] = useState(false);
  const [active, setActive] = useState('');

  return (
    <aside
      className={`h-screen w-max px-4 pb-4 pt-20 bg-secondary fixed top-0 left-0 z-10 text-secondary flex flex-col justify-start items-center transition-all duration-300 ease-in-out max-xs:hidden max-sm:hidden`}
    >
      <div className="flex flex-col justify-between items-center text-inherit h-full w-full">
        <div className="flex flex-col items-center w-full">
          <span className="flex flex-col justify-start items-center text-center space-y-6">
            <Image
              src={'/images/logo.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
            <Image
              src={'/images/logo.png'}
              width={72}
              height={72}
              alt="Toggle Menu"
              className="w-10 h-10 object-contain rounded-lg cursor-pointer"
            />
          </span>
        </div>
        <Image
          src={'/images/logo.png'}
          width={72}
          height={72}
          alt="Toggle Menu"
          className="w-10 h-10 object-contain rounded-lg cursor-pointer mb-6"
          onClick={() => setToggle(!toggle)}
        />
        <div
          className={`${
            !toggle ? 'hidden' : 'flex'
          } flex-col gap-8 w-full text-inherit transition-all duration-300 ease-in-out`}
        >
          <ul className="list-none flex flex-col items-center w-full">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-heading ${
                  active === nav.title ? 'text-primary' : 'text-inherit'
                }`}
                onClick={() => {
                  setActive(nav.title);
                  setToggle(!toggle);
                }}
              >
                <a href={`${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
