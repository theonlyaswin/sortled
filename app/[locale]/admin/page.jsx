'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLogin from '../components/AdminLogin';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiShoppingBag, FiTrash2, FiSave, FiEye, FiImage, FiUpload } from 'react-icons/fi';
import { db, storage } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
    const [headerImages, setHeaderImages] = useState([]);
  const [newHeaderImages, setNewHeaderImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    images: [],
    colorVariants: [],
    wattOptions: [],
    specifications: {
      voltage: '',
      size: '',
      otherDetails: ''
    },
    tags: [],
    reviews: []
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', image: null });
  const [editingCategory, setEditingCategory] = useState(null);


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
  } else if (name === 'colorVariants') {
    setNewProduct(prev => ({ ...prev, colorVariants: value.split(',').map(color => color.trim()) }));
  } else if (name === 'wattOptions') {
    setNewProduct(prev => ({ 
      ...prev, 
      wattOptions: value.split(',').map(option => {
        const [watts, price] = option.split(':');
        return { 
          watts: watts.trim(), 
          price: price ? price.trim() : '' 
        };
      })
    }));
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
        description: '',
        images: [],
        colorVariants: [],
        wattOptions: [],
        specifications: {
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
        description: '',
        images: [],
        colorVariants: [],
        wattOptions: [],
        specifications: {
          voltage: '',
          size: '',
          otherDetails: ''
        },
        tags: [],
        reviews: []
      });
      fetchProducts();
      setActiveTab('edit');
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const imageRef = ref(storage, `category-images/${newCategory.image.name}`);
      await uploadBytes(imageRef, newCategory.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "categories"), {
        name: newCategory.name,
        description: newCategory.description,
        image: imageUrl
      });

      setNewCategory({ name: '', description: '', image: null });
      fetchCategories();
      toast.success("Category added successfully!");
    } catch (error) {
      console.error("Error adding category: ", error);
      toast.error("Failed to add category. Please try again.");
    }
  };

const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      image: category.image
    });
};

const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryRef = doc(db, "categories", editingCategory.id);
      let updatedCategory = { ...newCategory };

      if (newCategory.image instanceof File) {
        const imageRef = ref(storage, `category-images/${newCategory.image.name}`);
        await uploadBytes(imageRef, newCategory.image);
        updatedCategory.image = await getDownloadURL(imageRef);
      }

      await updateDoc(categoryRef, updatedCategory);
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', image: null });
      fetchCategories();
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category: ", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category: ", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const fetchedCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast.error("Failed to fetch categories. Please try again.");
    }
  };


  const fetchHeaderImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "headerimg"));
      const fetchedImages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHeaderImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching header images: ", error);
      toast.error("Failed to fetch header images. Please try again.");
    }
  };

  const handleHeaderImageUpload = async (e) => {
    e.preventDefault();
    if (newHeaderImages.length === 0) return;

    try {
      for (let i = 0; i < newHeaderImages.length; i++) {
        const image = newHeaderImages[i];
        const imageRef = ref(storage, `header-images/${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);

        await addDoc(collection(db, "headerimg"), { url: imageUrl });
      }
      
      setNewHeaderImages([]);
      fetchHeaderImages();
      toast.success("Header images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading header images: ", error);
      toast.error("Failed to upload header images. Please try again.");
    }
  };

  const handleDeleteHeaderImage = async (id, url) => {
    try {
      await deleteDoc(doc(db, "headerimg", id));
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      fetchHeaderImages();
      toast.success("Header image deleted successfully!");
    } catch (error) {
      console.error("Error deleting header image: ", error);
      toast.error("Failed to delete header image. Please try again.");
    }
  };



  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchCategories();
      fetchHeaderImages();
    }
  }, [isAuthenticated]);

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
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'categories' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiImage className="inline-block mr-2" /> Categories
            </button>
            <button
              onClick={() => setActiveTab('header-images')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'header-images' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FiUpload className="inline-block mr-2" /> Header Images
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
                  
                  {/* New fields */}
                  <div className="mb-4">
                    <label htmlFor="colorVariants" className="block text-gray-700 font-semibold">Color Variants</label>
                    <input
                      type="text"
                      id="colorVariants"
                      name="colorVariants"
                      value={newProduct.colorVariants.join(', ')}
                      onChange={handleInputChange}
                      placeholder="Enter color variants separated by commas"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="wattOptions" className="block text-gray-700 font-semibold">Watt Options and Prices</label>
                    <input
                      type="text"
                      id="wattOptions"
                      name="wattOptions"
                      value={newProduct.wattOptions.map(option => `${option.watts}:${option.price}`).join(', ')}
                      onChange={handleInputChange}
                      placeholder="Enter watt:price pairs separated by commas (e.g., 60:1000, 100:1500)"
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
                {editingProduct ? (
                  <form onSubmit={handleUpdateProduct} className="space-y-4">
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
                  
                  {/* New fields */}
                  <div className="mb-4">
                    <label htmlFor="colorVariants" className="block text-gray-700 font-semibold">Color Variants</label>
                    <input
                      type="text"
                      id="colorVariants"
                      name="colorVariants"
                      value={newProduct.colorVariants.join(', ')}
                      onChange={handleInputChange}
                      placeholder="Enter color variants separated by commas"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="wattOptions" className="block text-gray-700 font-semibold">Watt Options and Prices</label>
                    <input
                      type="text"
                      id="wattOptions"
                      name="wattOptions"
                      value={newProduct.wattOptions.map(option => `${option.watts}:${option.price}`).join(', ')}
                      onChange={handleInputChange}
                      placeholder="Enter watt:price pairs separated by commas (e.g., 60:1000, 100:1500)"
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
                      <FiSave className="inline-block mr-2" /> Update Product
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white shadow rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-2">Category: {product.category}</p>
                        <p className="text-gray-600 mb-2">
                          Price: {product.wattOptions.map(option => `${option.watts}W: ₹${option.price}`).join(', ')}
                        </p>
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
                )}
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

            {activeTab === 'categories' && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
      <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4 mb-8">
        <div className="mb-4">
          <label htmlFor="categoryName" className="block text-gray-700 font-semibold">Category Name</label>
          <input
            type="text"
            id="categoryName"
            name="name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            placeholder="Enter category name"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="categoryDescription" className="block text-gray-700 font-semibold">Category Description</label>
          <textarea
            id="categoryDescription"
            name="description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            placeholder="Enter category description"
            required
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="categoryImage" className="block text-gray-700 font-semibold">Category Image</label>
          <input
            type="file"
            id="categoryImage"
            name="image"
            onChange={(e) => setNewCategory({...newCategory, image: e.target.files[0]})}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingCategory ? <><FiSave className="inline-block mr-2" /> Update Category</> : <><FiPlus className="inline-block mr-2" /> Add Category</>}
        </button>
        {editingCategory && (
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', description: '', image: null });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow rounded-lg p-4">
            <img src={category.image} alt={category.name} className="w-full h-40 object-cover rounded mb-4" />
            <h3 className="font-bold text-lg mb-2">{category.name}</h3>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditCategory(category)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                <FiEdit className="inline-block mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
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

            {activeTab === 'header-images' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Manage Header Images</h2>
                <form onSubmit={handleHeaderImageUpload} className="space-y-4 mb-8">
                  <div className="mb-4">
                    <label htmlFor="headerImages" className="block text-gray-700 font-semibold">Upload Header Images</label>
                    <input
                      type="file"
                      id="headerImages"
                      onChange={(e) => setNewHeaderImages(Array.from(e.target.files))}
                      accept="image/*"
                      multiple
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FiUpload className="inline-block mr-2" /> Upload Images
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {headerImages.map((image) => (
                    <div key={image.id} className="bg-white shadow rounded-lg p-4">
                      <img src={image.url} alt="Header" className="w-full h-40 object-cover rounded mb-4" />
                      <button
                        onClick={() => handleDeleteHeaderImage(image.id, image.url)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FiTrash2 className="inline-block mr-1" /> Delete
                      </button>
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