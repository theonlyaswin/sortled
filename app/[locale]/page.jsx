import Hero from "./components/Hero";
import Banner from "./components/Banner";
import OurProducts from "./components/OurProducts";
import CompanyHighlights from "./components/CompanyHighlights";
import CategoryCarousel from "./components/CategoryCarousel";
import TranslationsProvider from "./components/TranslationsProvider";
import initTranslations from "../i18n";
import Blog from "./components/Blog";

const i18nNamespaces = ["home"];

export default async function Home({ params: { locale } }) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow mt-[40px] lg:mt-[64px] md:mt-[80px]">
          <Hero />
        </main>
        <CategoryCarousel />
        <section>
          <Banner />
        </section>
        <OurProducts />
        <div className="flex flex-col md:flex-row justify-evenly items-center p-4 md:p-8 mt-12 md:mt-28 gap-6 overflow-hidden">
          <img src="./sidebanner1.png" alt="banner1" className="object-cover" />
          <img src="./sidebanner2.png" alt="banner2" className="object-cover" />
        </div>
        <CompanyHighlights />
        <div className="blog-layout overflow-x-auto" style={{ display:"flex", gap:"8px", margin:"10px 20px", marginBottom:"50px"}}>
          <Blog/>
        </div>
      </div>
    </TranslationsProvider>
  );
}
