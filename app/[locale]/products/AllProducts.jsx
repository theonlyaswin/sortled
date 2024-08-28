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

    const filterOptions = [
    { id: 'new', label: 'New Arrivals' },
    { id: 'featured', label: 'Featured' },
    { id: 'sale', label: 'On Sale' },
    { id: 'trending', label: 'Trending' },
    { id: 'all', label: 'All' },
  ];

  
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-12 p-4">
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
