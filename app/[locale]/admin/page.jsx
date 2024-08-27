// pages/admin.js
'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLogin from '../components/AdminLogin';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiShoppingBag, FiTrash2, FiSave, FiEye } from 'react-icons/fi';
import { db, storage } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: [],
    specifications: {
      watts: '',
      voltage: '',
      size: '',
      otherDetails: ''
    },
    tags: [],
    reviews: []
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast.error("Failed to fetch products. Please try again.");
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders: ", error);
      toast.error("Failed to fetch orders. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setNewProduct(prev => ({ ...prev, images: [...prev.images, ...files] }));
    } else if (name.startsWith('spec_')) {
      const specName = name.split('_')[1];
      setNewProduct(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [specName]: value }
      }));
    } else if (name === 'tags') {
      setNewProduct(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()) }));
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const imageUrls = await Promise.all(
        newProduct.images.map(async (image) => {
          const imageRef = ref(storage, `product-images/${image.name}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        })
      );
      
      await addDoc(collection(db, "products"), {
        ...newProduct,
        images: imageUrls
      });
      
      setNewProduct({
        name: '',
        category: '',
        price: '',
        description: '',
        images: [],
        specifications: {
          watts: '',
          voltage: '',
          size: '',
          otherDetails: ''
        },
        tags: [],
        reviews: []
      });
      fetchProducts();
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error("Failed to add product. Please try again.");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setActiveTab('edit');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, "products", editingProduct.id);
      let updatedProduct = { ...newProduct };

      if (newProduct.images.some(image => image instanceof File)) {
        const imageUrls = await Promise.all(
          newProduct.images.map(async (image) => {
            if (image instanceof File) {
              const imageRef = ref(storage, `product-images/${image.name}`);
              await uploadBytes(imageRef, image);
              return getDownloadURL(imageRef);
            }
            return image;
          })
        );
        updatedProduct.images = imageUrls;
      }

      await updateDoc(productRef, updatedProduct);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        category: '',
        price: '',
        description: '',
        images: [],
        specifications: {
          watts: '',
          voltage: '',
          size: '',
          otherDetails: ''
        },
        tags: [],
        reviews: []
      });
      fetchProducts();
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product: ", error);
      toast.error("Failed to update product. Please try again.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      fetchOrders();
      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status: ", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-12">Admin Dashboard</h1>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiPlus className="inline-block mr-2" /> Add Product
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'edit' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiEdit className="inline-block mr-2" /> Edit Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiShoppingBag className="inline-block mr-2" /> Orders
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'add' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-semibold">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-gray-700 font-semibold">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select category</option>
                      <option value="Office">Office</option>
                      <option value="Home">Home</option>
                      <option value="Hospital">Hospital</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="price" className="block text-gray-700 font-semibold">Price ( in ₹ )</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      placeholder="Enter product price"
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-semibold">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={newProduct.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      required
                      rows="4"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="images" className="block text-gray-700 font-semibold">Images</label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Specifications</label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="spec_watts" className="block text-gray-700">Watts</label>
                        <input
                          type="text"
                          id="spec_watts"
                          name="spec_watts"
                          value={newProduct.specifications.watts}
                          onChange={handleInputChange}
                          placeholder="Enter watts"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="spec_voltage" className="block text-gray-700">Voltage</label>
                        <input
                          type="text"
                          id="spec_voltage"
                          name="spec_voltage"
                          value={newProduct.specifications.voltage}
                          onChange={handleInputChange}
                          placeholder="Enter voltage"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="spec_size" className="block text-gray-700">Size</label>
                        <input
                          type="text"
                          id="spec_size"
                          name="spec_size"
                          value={newProduct.specifications.size}
                          onChange={handleInputChange}
                          placeholder="Enter size"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="spec_otherDetails" className="block text-gray-700">Other Details</label>
                        <input
                          type="text"
                          id="spec_otherDetails"
                          name="spec_otherDetails"
                          value={newProduct.specifications.otherDetails}
                          onChange={handleInputChange}
                          placeholder="Enter other details"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="tags" className="block text-gray-700 font-semibold">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={newProduct.tags.join(', ')}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FiSave className="inline-block mr-2" /> Save Product
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Edit Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white shadow rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-2">Category: {product.category}</p>
                      <p className="text-gray-600 mb-2">Price: ₹{product.price}</p>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          <FiEdit className="inline-block mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          <FiTrash2 className="inline-block mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Orders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white shadow rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-2">Order ID: {order.id}</h3>
                      <p className="text-gray-600 mb-2">Customer: {order.customerName}</p>
                      <p className="text-gray-600 mb-2">Total: ₹{order.totalAmount}</p>
                      <p className="text-gray-600 mb-2">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="text-gray-600 mb-2">
                        Status: 
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-white ${
                          order.status === 'pending' ? 'bg-yellow-500' :
                          order.status === 'on the way' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}>
                          {order.status}
                        </span>
                      </p>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          <FiEye className="inline-block mr-1" /> View Details
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="on the way">On the Way</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
            <p><strong>Address:</strong> {selectedOrder.address}</p>
            <p><strong>Total:</strong> ${selectedOrder.totalAmount}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <h4 className="font-bold mt-4 mb-2">Items:</h4>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li key={index}>
                  {item.name} - Quantity: {item.quantity} - Price: ${item.price}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;