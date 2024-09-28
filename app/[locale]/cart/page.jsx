'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { ref, get, remove, update } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { db as firestore, database } from '../firebase';
import Link from 'next/link';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
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
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const uniqueDeviceId = getOrCreateDeviceId();
        if (!uniqueDeviceId) {
          throw new Error('No device ID found');
        }

        const cartRef = ref(database, `users/${uniqueDeviceId}/cart`);
        const snapshot = await get(cartRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const cartArray = Object.entries(data).map(([key, value]) => ({
            realid: key,
            id: value.id,
            quantity: value.quantity,
            price: value.price, // Fetch price from Realtime Database
            watt: value.watt,  // Fetch watts from Realtime Database
          }));

          const fetchedItems = await Promise.all(
            cartArray.map(async (item) => {
              try {
                const productRef = doc(firestore, 'products', item.id);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                  const productData = productSnap.data();
                  return {
                    id: item.id,
                    quantity: item.quantity,
                    realid: item.realid,
                    watt: item.watt,  // Keep watts from Realtime Database
                    price: item.price,  // Keep price from Realtime Database
                    // Merge product data but exclude price to ensure it's not overridden
                    ...productData,
                    price: item.price, // Ensure we only use the price from the Realtime Database
                  };
                }
                return null;
              } catch (err) {
                console.error('Error fetching product:', item.id, err);
                return null;
              }
            })
          );

          const filteredItems = fetchedItems.filter(item => item !== null);
          setCartItems(filteredItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [getOrCreateDeviceId]);

  const handleQuantityChange = async (realid, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity < 1) return;

    const uniqueDeviceId = getOrCreateDeviceId();
    if (!uniqueDeviceId) return;

    try {
      const cartRef = ref(database, `users/${uniqueDeviceId}/cart/${realid}`);
      await update(cartRef, { quantity: newQuantity });
      setCartItems(prevItems => prevItems.map(item => 
        item.realid === realid ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (id) => {
    if (!id) return;

    const uniqueDeviceId = getOrCreateDeviceId();
    if (!uniqueDeviceId) return;

    try {
      const cartRef = ref(database, `users/${uniqueDeviceId}/cart/${id}`);
      await remove(cartRef);

      setCartItems(prevItems => prevItems.filter(item => item && item.realid !== id));
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-center my-28">Loading cart items...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center my-28">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 my-28">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div className="flex justify-center items-center flex-col">
            <p className="text-center text-gray-500">Your cart is empty. Start Shopping</p>
            <img src="/shoppingbag.svg" alt="shopping bag" className='lg:w-1/3 w-3/3'/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Watts</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="py-3 px-6 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => {
                  if (!item) return null;
                  return (
                    <tr key={item.realid} className="border-t">
                      <td className="py-4 px-6 flex items-center">
                        <img 
                          src={item.images && Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg'} 
                          alt={item.name || 'Product'} 
                          className="w-12 h-12 rounded-md mr-4" 
                        />
                        <span>{item.name || 'Unnamed Product'}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
              <input
                type="number"
                value={item.quantity || 1}
                min="1"
                max="100"
                className="w-16 text-center border rounded-md"
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value, 10);
                  if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= 100) {
                    handleQuantityChange(item.realid, newQuantity);
                  }
                }}
              />
            </td>
                      <td className="py-4 px-6 text-center">{`AED : ${item.price || 0}`}</td>
                      <td className="py-4 px-6 text-center">{`${item.watt || 0} W`}</td>
                      <td className="py-4 px-6 text-center">{`AED : ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => handleRemoveItem(item.realid)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Link href="/checkout">
              <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center">
                <FaShoppingCart className="mr-2" /> Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
