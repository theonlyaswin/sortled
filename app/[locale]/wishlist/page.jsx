'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { ref, get, remove, update } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { db as firestore, database } from '../firebase';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getOrCreateDeviceId = useCallback(() => {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        localStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const uniqueDeviceId = getOrCreateDeviceId();
        if (!uniqueDeviceId) {
          throw new Error('No device ID found');
        }

        const wishlistRef = ref(database, `users/${uniqueDeviceId}/wishlist`);
        const snapshot = await get(wishlistRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const wishlistArray = Object.entries(data).map(([key, value]) => ({
            realid: key,  // Store the realid
            ...value      // Spread the rest of the data directly
          }));

          const fetchedItems = await Promise.all(
            wishlistArray.map(async (item) => {
              if (!item.id) {
                console.error("Missing 'id' in item:", item);
                return null;  // Skip if 'id' is missing
              }
              const productRef = doc(firestore, 'products', item.id);
              const productSnap = await getDoc(productRef);

              let image = '/default.jpg';
              if (productSnap.exists()) {
                const productData = productSnap.data();
                image = productData.images ? productData.images[0] : image;
              } else {
                console.error("No product data found for ID:", item.id);
              }

              return {
                id: item.id,
                realid: item.realid,  // Include realid
                name: item.name,
                price: item.price,
                watt: item.watt,
                image
              };
            })
          );

          const filteredItems = fetchedItems.filter(item => item !== null);
          setWishlistItems(filteredItems);
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        console.error("Error fetching wishlist items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [getOrCreateDeviceId]);

  const handleRemoveItem = async (realid) => {
    const uniqueDeviceId = getOrCreateDeviceId();
    if (!uniqueDeviceId) return;

    try {
      const wishlistRef = ref(database, `users/${uniqueDeviceId}/wishlist/${realid}`);
      await remove(wishlistRef);

      setWishlistItems(prevItems => prevItems.filter(item => item.realid !== realid));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleAddToCart = async (id) => {
    const uniqueDeviceId = getOrCreateDeviceId();
    if (!uniqueDeviceId) return;

    try {
      const itemToAdd = wishlistItems.find(item => item.id === id);
      const cartRef = ref(database, `users/${uniqueDeviceId}/cart/${id}`);

      await update(cartRef, {
        quantity: 1,  // Set initial quantity or use any preferred logic
        ...itemToAdd,
      });

      // Optionally, remove the item from wishlist after adding to cart
      await remove(ref(database, `users/${uniqueDeviceId}/wishlist/${itemToAdd.realid}`));
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-center my-28">Loading wishlist items...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center my-28">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 my-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Your Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="flex justify-center items-center flex-col">
            <p className="text-center text-gray-500">Your wishlist is empty.</p>
            <img src="/Empty2.svg" alt="shopping bag" className="lg:w-1/3 w-3/3" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Watt</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Add to Cart</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Delete</th>
                </tr>
              </thead>
              <tbody>
                {wishlistItems.map(item => (
                  <tr key={item.realid} className="border-t flex flex-col lg:table-row">
                    <td className="py-4 px-6 flex items-center justify-center lg:justify-start">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md mr-4" />
                      <span className="text-center lg:text-left">{item.name}</span>
                    </td>
                    <td className="py-4 px-6 text-center">{item.watt}</td>
                    <td className="py-4 px-6 text-center">{`₹${item.price}`}</td>
                    <td className="py-4 px-6 text-center flex justify-center lg:justify-center">
                      <button
                        className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center mr-2"
                        onClick={() => handleAddToCart(item.id)}
                      >
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors flex items-center"
                        onClick={() => handleRemoveItem(item.realid)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
