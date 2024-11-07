'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// tauri functions
import { invoke } from '@tauri-apps/api/core';

// Components
import { Footer, Header } from '@components/index';

// BlockNode Editors
const MainEditor = dynamic(() => import('@sections/maineditor'), {
  ssr: false,
});

export default function Home() {
  const [greetMsg, setGreetMsg] = useState('');
  const [color, setColor] = useState('text-green-400');
  async function greet() {
    try {
      setGreetMsg(await invoke('greet'));
    } catch (error) {
      console.error(error);
      setColor('text-red-400');
      setGreetMsg(
        'Oops! Backend seems to be down, or Database is not connected'
      );
    }
  }
  return (
    <div className="max-w-[100vw] min-h-screen overflow-hidden justify-start items-center relative">
      <Header />
      <div className="min-h-screen bg-primary flex flex-col justify-center items-center">
        <span className="text-heading text-secondary">NodeCode FE live!</span>{' '}
        <br />
        <form
          className="flex flex-col my-4 w-full justify-center items-center"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <span className={`text-body w-full text-center mb-4 ${color}`}>
            {greetMsg}
          </span>
          <button
            type="submit"
            className="w-max p-2 text-black bg-yellow-500 rounded-lg hover:bg-yellow-400 transition"
          >
            Check Connection
          </button>
        </form>
      </div>
      <MainEditor />
      <Footer />
    </div>
  );
}
