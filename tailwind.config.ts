import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xxs: '350px',
        xs: '400px',
        sm: '480px',
        md: '768px',
        mmd: '820px',
        mlg: '964px',
        lg: '1024px',
        llg: '1100px',
        xl: '1280px',
        xxl: '1340px',
        xlg: '1800px',
      },
      backgroundColor: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'white': 'var(--white-color)',
        'black': 'var(--black-color)',
      },
      textColor: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'white': 'var(--white-color)',
        'black': 'var(--black-color)',
      },
      borderColor: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'white': 'var(--white-color)',
        'black': 'var(--black-color)',
      },
      boxShadow: {
        'primary': 'var(--primary-shadow-color)',
        'secondary': 'var(--secondary-shadow-color)',
        'white': 'var(--white-shadow-color)',
        'black': 'var(--black-shadow-color)',
      },
      fontSize: {
        'body': 'var(--body-font-size)',
        'heading': 'var(--secondary-size)',
        'text': 'var(--primary-font-size)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '4rem',
        '5xl': '5rem',
      },
      textUnderlineOffset: {
        16: '16px',
        32: '32px',
      }
    },
  },
  plugins: [typography],
};

export default config;
