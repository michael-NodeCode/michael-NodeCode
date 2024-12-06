'use client';
import React, { useEffect } from 'react';
import logging from '@utils/logger';
import { useAppDispatch, useAppSelector } from '@utils/hooks';
import { setTitle } from '@utils/titleSlice';

// Components
import { Footer, Header } from '@components/index';
import Sidebar from '@components/sidebar';

export default function Home() {
  const dispatch = useAppDispatch();
  const currentDate = useAppSelector((state) => state.date.currentDate);

  useEffect(() => {
    logging.info(`Date updated to: ${currentDate}`);
  }, [currentDate]);
  return (
    <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-black">
      <Header />
      <Sidebar />
      <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
        <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
          <h1 className="text-2xl font-bold">
            Welcome to the dashboard for: {currentDate}
          </h1>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => dispatch(setTitle('Hello Title'))}
          >
            Set Title to Hello Title
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
