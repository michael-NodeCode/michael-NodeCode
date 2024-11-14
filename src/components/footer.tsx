import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="min-w-full h-min px-24 py-2 flex flex-row justify-between items-center text-center text-gray-400 z-10 bg-black">
      <span className="min-w-max">@2024 NodeCode</span>
      <span className="border-solid border border-gray-300 w-full mx-4 mt-1"></span>
    </div>
  );
};

export default Footer;
