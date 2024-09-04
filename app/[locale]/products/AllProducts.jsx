'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter, useSearchParams } from 'next/navigation';

// Main Component
const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastVisible, setLastVisible] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  const filterOptions = [
    { id: 'new', label: 'New Arrivals' },
    { id: 'featured', label: 'Featured' },
    { id: 'sale', label: 'On Sale' },
    { id: 'trending', label: 'Trending' },
    { id: 'all', label: 'All' },
  ];

  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    if (isFetching) return;

    setIsFetching(true);

    try {
      const productQuery = query(
        collection(db, 'products'),
        orderBy('name'),
        limit(12),
        isInitialLoad ? null : startAfter(lastVisible)
      );

      const querySnapshot = await getDocs(productQuery);
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out duplicates
      const newProducts = isInitialLoad
        ? fetchedProducts
        : fetchedProducts.filter(product => !products.some(p => p.id === product.id));

      setProducts(prevProducts => [...prevProducts, ...newProducts]);
      setFilteredProducts(prevFiltered => [...prevFiltered, ...newProducts]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    } catch (error) {
      console.error('Error fetching products: ', error);
    } finally {
      setIsFetching(false);
    }
  }, [lastVisible, isFetching, products]);

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (scrollTop / scrollHeight > 0.95 && !isFetching) {
        fetchProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, isFetching]);

  return (
    <div className="flex justify-center items-center flex-col p-8 my-28 w-full">
      <div className="flex justify-center items-center flex-col">
        <h2 className="heading-bold text-5xl mb-2 text-center">All Products</h2>
      </div>
      <div className="w-full max-w-3xl mt-10 mb-8">
        <div className="flex flex-wrap justify-center border-b border-gray-200">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveFilter(option.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out
                ${activeFilter === option.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
                focus:outline-none focus:text-blue-600 focus:border-blue-500`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-12 p-4">
      {filteredProducts.map(product => (
        <ProductCard
          id={product.id}
        />
      ))}
    </div>
  );
};

export default AllProducts;
