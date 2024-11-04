import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="min-w-full p-6 flex flex-row justify-between items-center text-center text-gray-400 z-10 bg-primary">
      <span className="min-w-max">@2024 NodeCode</span>
      <span className="border-solid border border-gray-300 w-full mx-4 mt-1"></span>
    </div>
  );
};

export default Footer;
