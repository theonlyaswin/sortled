'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set } from 'firebase/database';
import { doc, setDoc } from 'firebase/firestore';
import { database, db as firestore } from '../firebase';

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

        // Combine the details with the cart data
        const itemsWithDetails = cartArray.map((item) => ({
          ...item,
          name: item.name || 'Unnamed Product',
          watts: item.watt || 'N/A',
        }));

        setCartItems(itemsWithDetails);

        // Calculate total amount using price from cart data
        const total = itemsWithDetails.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
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

    // Generate a unique order ID
    const orderId = 'order-' + Math.random().toString(36).substr(2, 9);

    const orderData = {
      ...formData,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        watts: item.watts,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      orderDate: new Date().toISOString(),
      status: 'pending',
      userId: uniqueDeviceId,
      orderId,  // Add the generated order ID here
    };

    localStorage.setItem('order-data',JSON.stringify(orderData));

    const orderDocRef = doc(firestore, 'orders', orderId);

    await setDoc(orderDocRef, orderData);
    const cartRef = ref(database, `users/${uniqueDeviceId}/cart`);
    await set(cartRef, null);

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
            <input type="number" id="phoneNumber" name="phoneNumber" required
              className="mt-1 block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange} />
          </div>
          
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Cart Summary</h2>
          <ul role="list" className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.realid} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Watts: {item.watts}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">x{item.quantity}</span>
                  <span className="text-sm text-blue-700">₹{item.price}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-xl font-bold text-blue-800">Total Amount</h3>
            <p className="text-xl text-blue-900">₹{totalAmount}</p>
          </div>

          <div className="mt-8">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
