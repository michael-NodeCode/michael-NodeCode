/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { useAppSelector } from '@redux/hooks';

const NewEditor = dynamic(() => import('./blocknote-editor/new-editor'), {
  ssr: false,
});

const App: React.FC = () => {
  const currentDate = useAppSelector((state) => state.date.currentDate);
  const title = useAppSelector((state) => state.title.title);

  return (
    <React.Fragment>
      <NewEditor currentDate={currentDate} title={title} />
    </React.Fragment>
  );
};

export default App;
