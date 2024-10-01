import Hero from "./components/Hero";
import Banner from "./components/Banner";
import OurProducts from "./components/OurProducts";
import CompanyHighlights from "./components/CompanyHighlights";
import CategoryCarousel from "./components/CategoryCarousel";
import TranslationsProvider from "./components/TranslationsProvider";
import initTranslations from "../i18n";
import Blog from "./components/Blog";
import TextAlignment from "./components/TextAlignment"; // Client Component for dynamic alignment

export default async function Home({ params: { locale } }) {
  const { resources } = await initTranslations(locale, ["home"]);
  return (
    <TranslationsProvider
      namespaces={["home"]}
      locale={locale}
      resources={resources}
    >
      {/* Pass the locale to the client-side component for dynamic alignment */}
      <TextAlignment locale={locale}>
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
            <img src="./sidebanner1.jpg" alt="banner1" className="object-cover" />
            <img src="./sidebanner2.jpg" alt="banner2" className="object-cover" />
          </div>
          <CompanyHighlights />
          <div className="blog-layout" style={{margin: "10px 20px", marginBottom: "50px" }}>
            <Blog />
          </div>
        </div>
      </TextAlignment>
    </TranslationsProvider>
  );
}
