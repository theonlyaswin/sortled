import ProductPage from '../SingleProduct';
import TranslationsProvider from '../../components/TranslationsProvider';
import initTranslations from '@/app/i18n';

const i18nNamespaces = ['product'];

export default async function ProductsPage({ params: { locale, slug } }) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  
  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <ProductPage id={slug} />
    </TranslationsProvider>
  );
}