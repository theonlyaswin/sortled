'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const branches = [
    { name: 'Downtown Branch', place: 'New York City', contact: '+1 (212) 555-1234' },
    { name: 'Uptown Branch', place: 'Los Angeles', contact: '+1 (310) 555-5678' },
    { name: 'Suburb Branch', place: 'Chicago', contact: '+1 (312) 555-9012' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Form submitted:', { email, message });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 my-28 ">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-center text-blue-600 mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t("contact_us")}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className={`text-2xl font-semibold text-gray-800 mb-4 ${t("txt-align")}`}>{t("our_branches")}</h2>
            {branches.map((branch, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md mb-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-2">{branch.name}</h3>
                <p className="flex items-center text-gray-600 mb-1"><FaStore className="mr-2" /> {branch.place}</p>
                <p className="flex items-center text-gray-600"><FaPhone className="mr-2" /> {branch.contact}</p>
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className={`text-2xl font-semibold text-gray-800 mb-4 ${t("txt-align")}`}>{t("get_in_touch")}</h2>
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`mb-4 ${t("txt-align")}`}>
                <label htmlFor="email" className={`block text-gray-700 font-semibold mb-2 ${t("txt-align")}`}>{t("email")}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">{t("msg")}</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows="4"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {t("send")}
              </button>
            </motion.form>
          </div>
        </div>

        <motion.div 
          className="bg-blue-600 text-white p-8 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-4">{t("newsletter")}</h2>
          <form className="flex flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-3 py-2 mb-2 sm:mb-0 sm:mr-2 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-md hover:bg-blue-100 transition duration-300"
            >
              {t("sub")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUs;