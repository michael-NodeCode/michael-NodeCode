'use client';
import React from 'react';

// components
import Header from '@components/header';
import Sidebar from './components/Sidebar';

function App() {

  return (
    <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-white">
      <Header />
      <Sidebar />
      <div className="bg-white min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-1 text-white">
        <div className="border-2 border-solid border-primary w-full p-4 pt-0 rounded-lg text-body">
          {/* We will create editor here!
          * The editor will allow user to input what ever user wants to input 
          * the edtior should we able to convert all the inpiut to JSON output
          */}
        </div>
      </div>
    </div>
  );
}

export default App;
