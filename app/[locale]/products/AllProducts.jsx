'use client';

import { useState, useEffect, Suspense } from 'react';
import ProductCard from '../components/ProductCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter, useSearchParams } from 'next/navigation';

// Main Component
const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex justify-center items-center flex-col p-8 my-28 w-full">
      <div className="flex justify-center items-center flex-col">
        <h2 className="heading-bold text-5xl mb-2 text-center">All Products</h2>
      </div>
      <div className="flex justify-evenly items-center w-full lg:w-1/3 my-10 subheading-bold text-xl font-bold flex-wrap gap-3">
        {/* Your filter buttons */}
        <p
          onClick={() => setActiveFilter('new')}
          className={`hover:text-blue-600 cursor-pointer ${activeFilter === 'new' ? 'text-blue-600' : ''}`}
        >
          New Arrivals
        </p>
        <p
          onClick={() => setActiveFilter('featured')}
          className={`hover:text-blue-600 cursor-pointer ${activeFilter === 'featured' ? 'text-blue-600' : ''}`}
        >
          Featured
        </p>
        <p
          onClick={() => setActiveFilter('sale')}
          className={`hover:text-blue-600 cursor-pointer ${activeFilter === 'sale' ? 'text-blue-600' : ''}`}
        >
          On Sale
        </p>
        <p
          onClick={() => setActiveFilter('trending')}
          className={`hover:text-blue-600 cursor-pointer ${activeFilter === 'trending' ? 'text-blue-600' : ''}`}
        >
          Trending
        </p>
        <p
          onClick={() => setActiveFilter('all')}
          className={`hover:text-blue-600 cursor-pointer ${activeFilter === 'all' ? 'text-blue-600' : ''}`}
        >
          All
        </p>
      </div>

      {/* Add Suspense for FilteredProducts */}
      <Suspense>
        <FilteredProducts
          products={products}
          filteredProducts={filteredProducts}
          setFilteredProducts={setFilteredProducts}
          activeFilter={activeFilter}
          router={router}
        />
      </Suspense>
    </div>
  );
};

// FilteredProducts Component


const FilteredProducts = ({
  products,
  filteredProducts,
  setFilteredProducts,
  activeFilter,
  router
}) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchQuery = searchParams.get('search')?.trim().toLowerCase();

    if (searchQuery && products.length > 0) {
      const matchingProducts = products.filter(
        product =>
          product.name?.toLowerCase().includes(searchQuery) ||
          product.category?.toLowerCase().includes(searchQuery)
      );

      if (matchingProducts.length > 0) {
        setFilteredProducts(matchingProducts);
      } else {
        router.push('/not-found');
      }
    }
  }, [products, searchParams]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.tags.includes(activeFilter)));
    }
  }, [activeFilter, products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 p-4">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          imageUrl={product.images[0]} // Assumes images is an array
          productName={product.name}
          price={product.price}
          id={product.id}
        />
      ))}
    </div>
  );
};


export default AllProducts;
