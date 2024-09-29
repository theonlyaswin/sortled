
import { Suspense } from 'react';
import AllProducts from './AllProducts';
import TranslationsProvider from '../components/TranslationsProvider';
import initTranslations from '../../i18n';


const i18nNamespaces = ['products'];
export default async function ProductsPage({ params: { locale } }) {
  
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
    
        <Suspense fallback={<div>Loading...</div>}>
          <AllProducts />
        </Suspense>

    </TranslationsProvider>

  );
};