// pages/my-orders.js
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db as firestore } from '../firebase';
import { FiEye } from 'react-icons/fi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const uniqueDeviceId = localStorage.getItem('deviceId');
        if (!uniqueDeviceId) {
          throw new Error('No device ID found');
        }

        // Reference to the specific document in the 'orders' collection using uniqueDeviceId
        const orderDocRef = doc(firestore, 'orders', uniqueDeviceId);

        // Fetch the document data
        const orderDoc = await getDoc(orderDocRef);

        if (orderDoc.exists()) {
          setOrders([{ id: orderDoc.id, ...orderDoc.data() }]);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-blue-800 text-xl">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-red-600 text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 my-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-800">Order #{order.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    order.status === 'on the way' ? 'bg-blue-200 text-blue-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">Total: ${order.totalAmount.toFixed(2)}</p>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                >
                  <FiEye className="inline-block mr-2" /> View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Order Details</h3>
            <p className="mb-2"><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p className="mb-2"><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
            <p className="mb-2"><strong>Status:</strong> {selectedOrder.status}</p>
            <p className="mb-2"><strong>Address:</strong> {selectedOrder.address}</p>
            <p className="mb-4"><strong>Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
            
            <h4 className="font-bold text-lg mb-2">Items:</h4>
            <ul className="mb-6">
              {selectedOrder.items.map((item, index) => (
                <li key={index} className="mb-2">
                  <span className="font-medium">{item.name}</span> - Quantity: {item.quantity} - Price: ${item.price}
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
