'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@redux/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Fragment>
      <Provider store={store}>{children}</Provider>
    </React.Fragment>
  );
}
