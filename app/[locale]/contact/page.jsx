import ContactUs from '../components/ContactUs';
import TranslationsProvider from '../components/TranslationsProvider';
import initTranslations from '../../i18n';

const i18nNamespaces = ['contact'];

export default async function Page({ params: { locale } }) {
  
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  
  return (
      <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <ContactUs />
      </TranslationsProvider>
  );
}