'use client'

import { FaAward, FaTruck, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const HighlightItem = ({ Icon, title, description, align }) => (
  <motion.div 
    className={`flex flex-col items-center ${align} p-4`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <Icon className="text-5xl text-blue-600 mb-2" />
    <h3 className="font-bold mt-2">{title}</h3>
    <p className="text-sm mt-1">{description}</p>
  </motion.div>
);

const CompanyHighlights = () => {

  const { t } = useTranslation();

  const highlights = [
    {
      Icon: FaAward,
      title: t('happy'),
      description: t('happy2'),
      align: t('txt-align')
    },
    {
      Icon: FaTruck,
      title: t('ship'),
      description: t('ship2'),
      align: t('txt-align')
    },
    {
      Icon: FaHeadset,
      title: t('support'),
      description: t('support2')
    },
    {
      Icon: FaShieldAlt,
      title: t('trust'),
      description: t('trust2'),
      align: t('txt-align')
    }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <HighlightItem key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyHighlights;
