'use client'
import React from 'react';
import { useTranslation } from 'react-i18next';

const Banner = () => {
    const { t } = useTranslation();

  return (
    <div className="relative w-full h-[90vh] bg-[url('/banner-image.jpeg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className={`text-blue-500 text-4xl md:text-5xl font-extrabold mb-4 ${t('txt-align')}`}>
          {t('welcome')}
        </h1>
        <p className={`text-white text-[13px] md:text-xl mb-6 max-w-6xl ${t('txt-align')}`}>
          {t('welcome2')}
        </p>
        <button className={`bg-blue-500 text-white text-[14px] py-[6px] px-[14px] rounded-full hover:bg-white hover:text-blue-600 transition duration-300 ${t('txt-align')}`}>
          {t('purchase')}
        </button>
      </div>
    </div>
  );
};

export default Banner;