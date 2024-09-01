'use client'

import Image from 'next/image';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { BsAward, BsShieldCheck, BsLightbulb } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className={`bg-blue-600 text-white ${t('txt-align')}`}>
      <div className="container mx-auto py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src="/logo.png" alt="Sort LED Logo" width={100} height={50} />
            <p className="mt-4">{t('sublogo')}</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="hover:text-blue-300"><FaFacebook size={24} /></a>
              <a href="#" className="hover:text-blue-300"><FaTwitter size={24} /></a>
              <a href="#" className="hover:text-blue-300"><FaInstagram size={24} /></a>
              <a href="#" className="hover:text-blue-300"><FaLinkedin size={24} /></a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t('quicklinks')}</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:underline">{t('home')}</a></li>
              <li><a href="/products" className="hover:underline">{t("pro")}</a></li>
              <li><a href="/about" className="hover:underline">{t("about")}</a></li>
              <li><a href="/contact" className="hover:underline">{t("c_us")}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t("c_us")}</h3>
            <p className="flex items-center mb-2"><MdLocationOn className="mr-2" /> 123 LED Street, Light City</p>
            <p className="flex items-center mb-2"><MdEmail className="mr-2" /> info@sortled.com</p>
            <p className="flex items-center mb-2"><MdPhone className="mr-2" /> 00 000 000 000</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">{t("certifications")}</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <BsAward className="mr-2 text-yellow-300" size={24} />
                <span>{t("pro-safety")}</span>
              </div>
              <div className="flex items-center">
                <BsShieldCheck className="mr-2 text-green-300" size={24} />
                <span>{t("energy")}</span>
              </div>
              <div className="flex items-center">
                <BsLightbulb className="mr-2 text-orange-300" size={24} />
                <span>{t("led")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-700 lg:py-4 md:py-4 pb-16 pt-2">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Azora Ads. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;