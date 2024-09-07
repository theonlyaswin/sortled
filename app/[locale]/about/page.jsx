import CompanyHighlights from '../components/CompanyHighlights';
import TranslationsProvider from '../components/TranslationsProvider';
import initTranslations from '../../i18n';

const i18nNamespaces = ['about'];
export default async function About({ params: { locale } }) {
  
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
    <div className="flex justify-center items-center flex-col p-8 my-28 w-full">
      <div className="flex justify-center items-center flex-col animate-fade-in-slide">
        <h3 className="text-2xl md:text-3xl lg:text-4xl">{t("our_history")}</h3>
        <h2 className="heading-bold text-5xl md:text-6xl lg:text-7xl mb-8 mt-2 text-blue-600 animate-fade-in-slide">{t("logo-txt")}</h2>
        <p className="lg:w-2/3 w-full text-center">
          {t("our_history2")}
        </p>
      </div>
      <div className="flex justify-center items-center my-12 w-full animate-fade-in-slide">
        <hr className="w-1/3 border border-1 mx-4" style={{ borderColor: "#EFC33F" }} />
        <img src="/chair.png" alt="image-alt" className="w-16 md:w-20 lg:w-24 object-cover" />
        <hr className="w-1/3 border border-1 mx-4" style={{ borderColor: "#EFC33F" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-12 w-full lg:w-2/3">
        <div className="p-4 md:col-span-2 lg:col-span-3 h-64 animate-fade-in-slide">
          <img src="https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg" alt="image-alt-1" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="p-4 rounded-lg h-64 animate-fade-in-slide">
          <img src="https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg" alt="image-alt-2" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="p-4 rounded-lg h-64 animate-fade-in-slide">
          <img src="https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg" alt="image-alt-3" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="p-4 rounded-lg col-span-1 md:col-span-2 lg:col-span-3 h-64 animate-fade-in-slide">
          <img src="https://images.pexels.com/photos/3773571/pexels-photo-3773571.png" alt="image-alt-4" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
      <CompanyHighlights />
      <div className="flex justify-center items-center flex-col mb-28 animate-fade-in-slide">
        <h3 className="text-2xl md:text-3xl lg:text-4xl mb-8 heading-bold text-blue-600">{t("our_vision")}</h3>
        <p className="lg:w-2/3 w-full text-center">
          {t("our_vision2")}
        </p>
      </div>
      <div className="flex justify-center items-center flex-col animate-fade-in-slide">
        <h3 className="text-2xl md:text-3xl lg:text-4xl mb-8 heading-bold text-blue-600">{t("our_mission")}</h3>
        <p className="lg:w-2/3 w-full text-center">
          {t("our_mission2")}
        </p>
      </div>
    </div>
    </TranslationsProvider>
  );
};

