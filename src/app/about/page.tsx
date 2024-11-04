'use client';
import Header from '@components/header';
import Footer from '@components/footer';
import React from 'react';

export default function About() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <div className="max-w-[100vw] min-h-screen overflow-hidden justify-start items-center relative">
      <Header />
      <div className="min-h-screen bg-primary flex justify-center items-center text-heading text-secondary">
        NodeCode | About WIP!
      </div>
      <Footer />
    </div>
  );
}
