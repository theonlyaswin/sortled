
import { Suspense } from 'react';
import AllProducts from './AllProducts';

const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllProducts />
    </Suspense>
  );
};

export default ProductsPage;
