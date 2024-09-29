import Navbar from './components/Navbar';
import "./globals.css";
import Footer from './components/Footer';
import TranslationsProvider from './components/TranslationsProvider';
import initTranslations from '../i18n';

const i18nNamespaces = ['bar'];

export const metadata = {
  title: "Sort Led",
  description: "Light your space",
};

export default async function RootLayout({ params: { locale }, children }) {
    const { t, resources } = await initTranslations(locale, i18nNamespaces);
    
  return (
    <html lang="en">
      <body>
        <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
        <Navbar />
        {children}
        <Footer />
        </TranslationsProvider>
      </body>

    </html>
  );
}
