import Hero from './components/Hero';
import CircleImageLabel from './components/CircleImageLabel';
import Banner from './components/Banner';
import OurProducts from './components/OurProducts';
import CompanyHighlights from './components/CompanyHighlights';
import Link from 'next/link';
import TranslationsProvider from './components/TranslationsProvider';
import initTranslations from '../i18n';

const i18nNamespaces = ['home'];


export default async function Home({ params: { locale } }) {


  const { t, resources } = await initTranslations(locale, i18nNamespaces);


  const circle_images = [
    { src: "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg", alt: 'Bedroom', label: 'Bedroom' , url : "/bedlamps" },
    { src: "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg", alt: 'Office', label: 'Office' , url : "/officelamps" },
    { src: "https://images.pexels.com/photos/3201921/pexels-photo-3201921.jpeg", alt: 'Lounge', label: 'Lounge', url: "/loungelamps" },
    { src: "https://images.pexels.com/photos/3393435/pexels-photo-3393435.jpeg", alt: 'Chandelier', label: 'Chandelier' , url : "/chandeliers" },
    { src: "https://images.pexels.com/photos/6431888/pexels-photo-6431888.jpeg", alt: 'Table Lamp', label: 'Table Lamp' , url : "/tablelamps" },
  ];

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow mt-[64px] md:mt-[80px]">
        <Hero />
      </main>
      <section className="my-12 md:my-12 relative">
  <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">{t('categories')}</h1>
  <div className="px-4 md:px-8 flex justify-start md:justify-center overflow-x-auto whitespace-nowrap gap-4 md:gap-8 relative scrollbar-hide">
    {circle_images.map((category, index) => (
      <Link href={category.url} key={index}>
        <CircleImageLabel
          src={category.src}
          alt={category.alt}
          label={category.label}
        />
      </Link>
    ))}
  </div>
</section>
      <section>
        <Banner />
      </section>
      <OurProducts />
      <div className="flex flex-col md:flex-row justify-evenly items-center p-4 md:p-8 mt-12 md:mt-28 gap-6 overflow-hidden">
        <img src="./sidebanner1.png" alt="banner1" className="object-cover"/>
        <img src="./sidebanner2.png" alt="banner2" className="object-cover"/>
      </div>
      <CompanyHighlights />
    </div>
    </TranslationsProvider>
  );
};
