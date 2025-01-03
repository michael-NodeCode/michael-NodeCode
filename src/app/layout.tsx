import type { Metadata } from 'next';
import localFont from 'next/font/local';
import StoreProvider from './StoreProvider';
import '@styles/globals.css';
import Header from '@components/header';
import Sidebar from '@components/Sidebar';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'NodeCode',
  description: 'NodeCode',
  icons: {
    icon: '/favicons/favicon.ico',
    apple: '/favicons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <StoreProvider>
          <div className="max-w-[100vw] h-screen overflow-hidden overflow-y-auto justify-start items-center relative bg-white">
            <Header />
            <Sidebar />
            <div className="bg-black min-h-screen w-full flex px-[4.8rem] max-sm:px-0 pb-0 py-[4.8rem] pr-0 text-white">
              <div className="border-2 border-solid border-white w-full p-4 pt-0 rounded-lg text-body">
                {children}
              </div>
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
