'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiClipboard, FiMoreHorizontal, FiSearch, FiShoppingCart, FiX } from 'react-icons/fi';
import { LuQuote } from "react-icons/lu";
import { AiOutlineHeart } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import i18nConfig from '@/i18nConfig';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase'; 


const Navbar = () => {

  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const currentPathname = usePathname();

  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [localeData, setLocalData] = useState("");
 
  const newLocale = currentLocale === 'en' ? 'ar' : 'en';
  
  useEffect(() => {
    if (currentLocale == "en") {
      setLocalData('AR')
    }else{
      setLocalData('EN')
    }
  }, [])
  
  const toggleLanguage = () => {

    // Set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // Redirect to the new locale path
    if (currentLocale == "en") {
      setLocalData('AR')
    }else{
      setLocalData('EN')
    }
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery.trim()}`);
    } else {
      // Optionally handle empty search query
    }

    setIsSearchOpen(false);
  };

    function getOrCreateDeviceId() {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }
    return null;
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  useEffect(() => {
    const uniqueDeviceId = getOrCreateDeviceId();
    if (!uniqueDeviceId) return;

    const cartRef = ref(database, `users/${uniqueDeviceId}/cart`);

    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        const cartItems = snapshot.val();
        const itemCount = Object.values(cartItems).reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(itemCount);
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);





  return (
    <>
      <nav className="bg-white shadow-md text-black fixed top-0 left-0 right-0 z-50 h-20">
        <div className="container mx-auto lg:px-28 md:px-4 px-4 lg:py-0 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="w-1/4 flex items-center">
            <Link href="/">
              <img src="/logo.jpg" alt="logo" className='w-16 h-16 object-contain' />
            </Link>
          </div>

          {/* Spacer for centering logo */}
          <div className="w-1/4"></div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleLanguage} className="hover:text-gray-600">
              <h4 id='locale-text'>{localeData}</h4>
            </button>
            <button onClick={toggleSearch} className="hover:text-gray-600">
              <FiSearch size={20} />
            </button>
            <Link href="/wishlist" className="hover:text-gray-600">
              <AiOutlineHeart size={20} />
            </Link>
            <Link href="/cart" className="hover:text-gray-600">
              <FiShoppingCart size={20} />
            </Link>
            {cartCount > 0 && (
          <div className="-top-2 -right-2 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {cartCount}
            </div>
        )}
          </div>
        </div>

        {/* Bottom line - only visible on desktop */}
        <div className="hidden space-x-6 py-4 bg-blue-500 text-white" style={{display:( window.innerWidth < 1000)?"none":"flex", flexDirection:(localeData == "EN"?"row-reverse":"row"), gap:"30px", justifyContent:"center"}}>
          <Link href="/" className="hover:text-black">{t('home')}</Link>
          <Link href="/products" className="hover:text-black">{t('allpro')}</Link>
          <Link href="/orders" className="hover:text-black">{t('orders')}</Link>
          <Link href="/about" className="hover:text-black">{t('about')}</Link>
          <Link href="/contact" className="hover:text-black">{t('c_us')}</Link>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('search')}</h2>
              <button onClick={toggleSearch} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter product name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                {t('search')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom navigation for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-50">
          <div className="flex justify-around py-2">
            <Link href="/" className="flex flex-col items-center text-black hover:text-gray-600">
              <FiHome size={18} />
              <span>{t("home")}</span>
            </Link>
            <Link href="/orders" className="flex flex-col items-center text-black hover:text-gray-600">
              <FiClipboard size={18} />
              <span>{t("orders")}</span>
            </Link>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-center text-black hover:text-gray-600"
            >
              <FiMoreHorizontal size={18} />
              <span>{t("more")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 transition-transform duration-300 transform translate-y-0">
            <div className="flex flex-col space-y-4">
              <Link href="/products" className="text-black hover:text-gray-600" onClick={() => setIsDrawerOpen(false)}>{t("pro")}</Link>
              <Link href="/wishlist" className="text-black hover:text-gray-600" onClick={() => setIsDrawerOpen(false)}>{t("wish")}</Link>
              <Link href="/about" className="text-black hover:text-gray-600" onClick={() => setIsDrawerOpen(false)}>{t("about")}</Link>
              <Link href="/contact" className="text-black hover:text-gray-600" onClick={() => setIsDrawerOpen(false)}>{t("contact")}</Link>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="mt-4 w-full bg-gray-200 text-black py-2 rounded-md hover:bg-gray-300"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {/* Spacer for mobile to prevent content from being hidden behind the bottom nav */}
      {isMobile && <div className="h-16"></div>}
      
      {/* Spacer to prevent content from being hidden behind the navbar on desktop */}
      {!isMobile && <div className="h-20"></div>}
    </>
  );
};

export default Navbar;
