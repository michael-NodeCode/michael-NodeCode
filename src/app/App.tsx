'use client';

import React, { useEffect } from 'react';

// utils
import logging from '@utils/logger';

// redux
import { useAppDispatch, useAppSelector } from '@redux/hooks';

// components
import Header from '@components/header';
import Sidebar from './components/Sidebar';
import EditorContainer from './components/EditorContainer';
import { EditorProvider } from './components/EditorProvider';

function App() {
  const dispatch = useAppDispatch();
  const currentDate = useAppSelector((state) => state.date.currentDate);

  useEffect(() => {
    logging.info(
      `Date updated to: ${currentDate}, from the store with dispatch as: ${dispatch}`
    );
  }, [currentDate, dispatch]);
  return (
    <EditorProvider>
      <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-white">
        <Header />
        <Sidebar />
        <div className="bg-white min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-1 text-white">
          <div className="border-2 border-solid border-primary w-full p-4 pt-0 rounded-lg text-body">
            <EditorContainer />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;
