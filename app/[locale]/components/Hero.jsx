'use client'

import React, { useState, useEffect, useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Hero = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const carouselRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      const headerImgCollection = collection(db, 'headerimg');
      const snapshot = await getDocs(headerImgCollection);
      const fetchedImages = snapshot.docs.map(doc => doc.data().url);
      setImages(fetchedImages);
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentImage + 1) % images.length;
      setCurrentImage(nextIndex);
      carouselRef.current.scrollTo({
        left: nextIndex * carouselRef.current.clientWidth,
        behavior: 'smooth',
      });
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [currentImage, images]);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const diff = touchStartRef.current - touchEndRef.current;
    const threshold = 50; // Minimum swipe distance to trigger change

    if (diff > threshold) {
      // Swiped left
      const nextIndex = (currentImage + 1) % images.length;
      setCurrentImage(nextIndex);
      carouselRef.current.scrollTo({
        left: nextIndex * carouselRef.current.clientWidth,
        behavior: 'smooth',
      });
    } else if (diff < -threshold) {
      // Swiped right
      const prevIndex = (currentImage - 1 + images.length) % images.length;
      setCurrentImage(prevIndex);
      carouselRef.current.scrollTo({
        left: prevIndex * carouselRef.current.clientWidth,
        behavior: 'smooth',
      });
    }

    // Reset swipe references
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  return (
    <div className="container mx-auto lg:px-28 px-4 py-12 flex flex-col md:flex-row items-center">
      {/* Left side - Text content */}
      <div className="md:w-1/2 mb-8 md:mb-0 pr-8 animate-slide-in">
        <h1 className={`text-5xl font-medium mb-4 ${t('txt-align')}`}>
          {t('header1')}<br />
          <span className="text-blue-500 font-extrabold">SORT LED</span>
        </h1>
        <p className={`text-xl mb-6 text-gray-600 ${t('txt-align')}`}>
          {t('header3')}
        </p>
      </div>

      {/* Right side - Image carousel */}
      <div className="md:w-1/2 relative">
        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-hidden snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', transition: 'scroll 0.5s ease' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Lamp showcase ${index + 1}`}
              className="w-full h-96 object-cover snap-center rounded-lg"
            />
          ))}
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImage ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => {
                setCurrentImage(index);
                carouselRef.current.scrollTo({
                  left: index * carouselRef.current.clientWidth,
                  behavior: 'smooth',
                });
              }}
            />
          ))}
        </div>

        {/* Browse Store button */}
        <div className="absolute -bottom-12 right-0">
          <Link href="/products">
            <button className={`flex items-center text-gray-700 hover:text-blue-500 transition duration-300 ${t('txt-align')}`}>
              {t('browse')}
              <FiArrowRight className="ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;