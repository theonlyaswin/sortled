'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path matches your structure
import CircleImageLabel from './CircleImageLabel';

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryCollection = collection(db, 'categories');
        const snapshot = await getDocs(categoryCollection);
        const categoryData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="my-12 md:my-12 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600">Categories</h1>
      <div className="px-4 md:px-8 flex justify-start md:justify-center overflow-x-auto whitespace-nowrap gap-4 md:gap-8 relative scrollbar-hide">
        {categories.map((category) => (
            <CircleImageLabel
              src={category.image}
              alt={category.name}
              label={category.name}
            />
        ))}
      </div>
    </section>
  );
};

export default CategoryCarousel;
