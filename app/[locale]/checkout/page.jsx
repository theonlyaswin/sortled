'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set } from 'firebase/database';
import { doc, getDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { database, db as firestore } from '../firebase';
import Link from 'next/link';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    postalCode: '',
    state: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

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
            ...(value || {}),
          }));

          const fetchedItems = await Promise.all(
            cartArray.map(async (item) => {
              if (!item.id) {
                console.error('Item without id:', item);
                return null;
              }
              const productRef = doc(firestore, 'products', item.id);
              const productSnap = await getDoc(productRef);

              if (productSnap.exists()) {
                return {
                  ...item,
                  ...productSnap.data(),
                };
              }
              console.error('Product not found:', item.id);
              return null;
            })
          );

          const filteredItems = fetchedItems.filter(item => item !== null);
          setCartItems(filteredItems);

          const total = filteredItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
          setTotalAmount(total);
        } else {
          setCartItems([]);
          setTotalAmount(0);
        }
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [getOrCreateDeviceId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const uniqueDeviceId = getOrCreateDeviceId();
      if (!uniqueDeviceId) {
        throw new Error('No device ID found');
      }

      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        orderDate: new Date().toISOString(),
        status: 'pending',
        userId: uniqueDeviceId,
      };

       const message = `Hi, an order for Kai's Lifestyle Studios\n` +
                    `Order ID: ${orderData.id}\n` +
                    `Name: ${formData.name}\n` +
                    `Total Amount: ${orderData.totalAmount}`;

    // Encode the message to be URL-safe
    const encodedMessage = encodeURIComponent(message);

      // Add the order to Firestore under the 'orders' collection
      // Create a reference to the document in the 'orders' collection with the uniqueDeviceId as the document ID
      const orderDocRef = doc(firestore, 'orders', uniqueDeviceId);

      // Set the document in Firestore
      await setDoc(orderDocRef, orderData);

      // Clear the cart in Realtime Database
      const cartRef = ref(database, `users/${uniqueDeviceId}/cart`);
      await set(cartRef, null);

      const whatsappUrl = `https://wa.me/+919074430171?text=${encodedMessage}`;

    // Open WhatsApp link in a new tab
      window.open(whatsappUrl, '_blank');
      router.push('/orders');
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <p className="text-blue-800 text-xl">Loading...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <p className="text-red-600 text-xl">Error: {error}</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-700">Name</label>
            <input type="text" id="name" name="name" required
              className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange} />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-blue-700">Address</label>
            <input type="text" id="address" name="address" required
              className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-blue-700">Postal Code</label>
              <input type="text" id="postalCode" name="postalCode" required
                className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={handleInputChange} />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-blue-700">State</label>
              <input type="text" id="state" name="state" required
                className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={handleInputChange} />
            </div>
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-blue-700">Phone Number</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" required
              className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange} />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.realid} className="flex justify-between items-center mb-2">
                <span>{item.name || 'Unnamed Product'}</span>
                <span>₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-blue-200 pt-4 mt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Link href="/cart">
              <button type="button" className="bg-gray-200 text-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300">
                Back to Cart
              </button>
            </Link>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
