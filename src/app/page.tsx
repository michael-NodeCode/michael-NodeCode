'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Components
import { Footer, Header } from '@components/index';
import Sidebar from '@components/sidebar';

// BlockNode Editors
const MainEditor = dynamic(() => import('@sections/maineditor'), {
  ssr: false,
});

export default function Home() {
  const nodeHeading = '2024';
  const nodeSubHeading = 'November 15';

  return (
    <div className="max-w-[100vw] h-screen overflow-hidden justify-start items-center relative bg-primary">
      <Header heading={nodeHeading} subHeading={nodeSubHeading} />
      <Sidebar />
      <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
        <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
          <MainEditor heading={nodeHeading} subHeading={nodeSubHeading}  />
        </div>
      </div>
      <Footer />
    </div>
  );
}
