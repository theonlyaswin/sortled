'use client'

import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const hospitalProducts = fetchedProducts.filter(product => product.category === 'Office');
        setProducts(hospitalProducts);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex justify-center items-center flex-col p-8 my-28 w-full">
      <div className="flex justify-center items-center flex-col">
        <h2 className="heading-bold text-5xl mb-8">Office Lamps</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 p-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            imageUrl={product.images[0]} // Assumes images is an array
            productName={product.name}
            price={product.price}
            id={product.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
