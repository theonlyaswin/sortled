'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiMinus,
  FiPlus,
  FiShare2,
  FiCheckCircle,
} from 'react-icons/fi';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase';
import { useTranslation } from 'react-i18next';

const ProductPage = ({ id }) => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const { t } = useTranslation();

  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [uniqueDeviceId, setUniqueDeviceId] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(t('description'));
  const [showPopup, setShowPopup] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedWatts, setSelectedWatts] = useState(null);
  const [price, setPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [oldPrice, setOldPrice] = useState(null);



  function getOrCreateDeviceId() {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    }
    return null;
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    setUniqueDeviceId(deviceId);

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();
          setProduct(productData);
          setMainImage(productData.images[0]);
          setAdditionalImages(productData.images.slice(1));
          setSelectedColor(productData.colorVariants[0] || '');

          const initialWattsOption = productData.wattOptions.find(option => option.price && option.watts);
          setSelectedWatts(initialWattsOption?.watts || null);
          setPrice(initialWattsOption?.price || productData.price);
          setOldPrice(initialWattsOption?.oldprice || null); // Set the initial old price
        
          fetchRelatedProducts(productData.category);
        } else {
          router.push('/not-found');
        }
      } catch (error) {
        console.error('Error fetching product: ', error);
        router.push('/not-found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!uniqueDeviceId || !id || selectedWatts === null) return;
      const wishlistRef = ref(database, `users/${uniqueDeviceId}/wishlist`);
      const snapshot = await get(wishlistRef);
      if (snapshot.exists()) {
        const wishlist = snapshot.val();
        setIsInWishlist(wishlist.some(item => item.id === id && item.watt === selectedWatts));
      } else {
        setIsInWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [uniqueDeviceId, id, selectedWatts]);

  const fetchRelatedProducts = async (category) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category)
      );

      const querySnapshot = await getDocs(q);
      const relatedProducts = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== id) {
          relatedProducts.push({ id: doc.id, ...doc.data() });
        }
      });

      setRelatedProducts(relatedProducts);
    } catch (error) {
      console.error('Error fetching related products: ', error);
    }
  };

const updateUserProduct = async (type) => {
  if (!uniqueDeviceId || !product || id) return;
  const userRef = ref(database, `users/${uniqueDeviceId}`);
  const snapshot = await get(userRef);

  const productData = {
    id: id,
    name: product.name,
    watt: selectedWatts,
    price: price,
  };

  if (!snapshot.exists()) {
    const initialData = {
      [type]: type === 'cart' 
        ? [{ ...productData, quantity: Math.min(quantity, 100), price }] 
        : [productData],
    };
    await set(userRef, initialData);
  } else {
    const userData = snapshot.val();
    let products = userData[type] || [];

    products = Array.isArray(products) ? products : Object.values(products);

    // Filter out any invalid entries
    products = products.filter(item => item && typeof item === 'object' && item.id);

    if (type === 'cart') {
      const existingProductIndex = products.findIndex(
        (item) => item.id === id && item.watt === selectedWatts
      );

      if (existingProductIndex > -1) {
        const newQuantity = Math.min(products[existingProductIndex].quantity + quantity, 100);
        products[existingProductIndex].quantity = newQuantity;
      } else {
        products.push({ ...productData, quantity: Math.min(quantity, 100), price });
      }
    } else {
      const existingProductIndex = products.findIndex(
        (item) => item.id === id && item.watt === selectedWatts
      );

      if (existingProductIndex > -1) {
        products.splice(existingProductIndex, 1);
      } else {
        products.push(productData);
      }
    }

    await update(userRef, { [type]: products });
  }

  // Update local state after modifying the database
  if (type === 'wishlist') {
    setIsInWishlist(!isInWishlist);
  }
};

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.min(Math.max(1, Number(prevQuantity) + Number(change)), 100000));
  };

  const handleAddToCart = async () => {
    await updateUserProduct('cart');
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleAddToWishlist = async () => {
    if (!product || !id) return;
    await updateUserProduct('wishlist');
    setIsInWishlist(!isInWishlist);
  };

  const handleImageClick = (clickedImage, index) => {
    const newMainImage = clickedImage;
    const newAdditionalImages = [...additionalImages];
    newAdditionalImages[index] = mainImage;
    setMainImage(newMainImage);
    setAdditionalImages(newAdditionalImages);
  };

  const handleWattChange = (watt, newPrice, newOldPrice) => {
    setSelectedWatts(watt);
    setPrice(newPrice);
    setOldPrice(newOldPrice); // Update the old price when the watt option changes
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found.</div>;
  }

  const handleShare = async (_title, _text, _shareUrl, _imageUrl) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: _title,
          text: _text,
          url: _shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      console.error('Web Share API is not supported in your browser.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-28 mt-12 lg:w-2/3 w-full">

      <div className={currentLocale == "ar"?"flex flex-col md:space-x-8 md:flex-row-reverse":"flex flex-col md:space-x-8 md:flex-row"}>
        {/* Product Image */}
        <div className="md:w-1/2 mb-8 md:mb-0">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          {/* Additional Product Images */}
          <div className="flex mt-4 space-x-4">
            {additionalImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Product Image ${index + 1}`}
                className="w-20 h-20 rounded-lg shadow-lg cursor-pointer"
                onClick={() => handleImageClick(img, index)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2" style={{marginRight: (currentLocale == 'ar')?"30px":"0"}}>
          <h1 className="text-3xl font-bold mb-4" style={{textAlign: (currentLocale == 'ar')?"right":"left"}}>{(currentLocale == 'en')?product.name:product.namea}</h1>
          {oldPrice && (
            <p className="text-gray-500 line-through mb-4" style={{textAlign: (currentLocale == 'ar')?"right":"left"}}>
              AED : {oldPrice}
            </p>
          )}
          <p className="text-2xl font-semibold mb-2 text-green-500" style={{fontSize:"30px",textAlign: (currentLocale == 'ar')?"right":"left"}}>
            AED : {price}
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2" style={{textAlign: (currentLocale == 'ar')?"right":"left"}}>{t('color')}</h3>
            <div className="flex space-x-4" style={{justifyContent: (currentLocale == 'ar')?"flex-end":"flex-start"}}>
              {product.colorVariants.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {product.wattOptions?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{textAlign: (currentLocale == 'ar')?"right":"left"}}>Watts</h3>
              <div className="flex space-x-4" style={{justifyContent: (currentLocale == 'ar')?"flex-end":"flex-start"}}>
                {product.wattOptions.map((option) => (
                  <button
                    key={option.watts}
                    className={`px-4 py-2 border-2 rounded ${
                      selectedWatts === option.watts
                        ? 'border-blue-500 text-blue-500'
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => handleWattChange(option.watts, option.price, option.oldprice)} // Pass oldPrice
                  >
                    {option.watts}W
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center mb-6 space-x-4" style={{gap:"10px", flexDirection:(currentLocale == 'ar')?"row-reverse":"row"}}>
            <div className="flex items-center">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="bg-gray-200 p-2 rounded-l"
              >
                <FiMinus />
              </button>
              <input type='text' className="bg-gray-100 px-4 py-2" value={quantity} onInput={(e) => setQuantity(e.target.value)} style={{width:"100px"}}/>
              <button
                onClick={() => handleQuantityChange(1)}
                className="bg-gray-200 p-2 rounded-r"
              >
                <FiPlus />
              </button>
               {quantity >= 10001 && (
                <span className="text-red-500 text-sm">Max quantity reached</span>
               )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center justify-center"
            >
              <FiShoppingCart className="mr-2" /> {t('addtocart')}
            </button>
          </div>
          <div className="flex items-center mb-6 space-x-4" style={{justifyContent:(currentLocale == 'ar')?"flex-end":"flex-start",}}>
            <button 
              onClick={handleAddToWishlist}
              className="border border-gray-300 rounded-full px-3 py-2 flex items-center justify-center"
            >
              {isInWishlist ? (
                <FiHeart className='mr-1 text-red-500' fill="currentColor" />
              ) : (
                <FiHeart className='mr-1' />
              )}
              {isInWishlist ? 'Remove from wishlist' : `${t('wishlist')}`}
            </button>
            <button className="border border-gray-300 rounded-full px-3 py-2 flex items-center justify-center"  onClick={() => handleShare("Sort Led",`Check out this out! ${product.name}` ,`${window.location.href}`, mainImage)}>
              {t('share')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="flex flex-wrap border-b" style={{flexDirection:(currentLocale == 'ar')?"row-reverse":"row"}}>
          {[t('description'), t('specification'), t('materials')].map(
            (tab) => (
              <button
                key={tab}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>
        <div className="mt-4" style={{width:"100%", maxWidth:"500px"}}>
          {activeTab === t('description') && <p>{(currentLocale == 'en')?product.description:product.descriptiona}</p>}
          {activeTab === t('specification') && (
            <table className="w-full border-collapse">
              <tbody>
                {
                  Object.entries(product.specifications || {})
                  .filter(([key]) => key !== 'otherDetailsa')
                  .map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 font-semibold">{key}</td>
                      <td className="py-2">{currentLocale === 'ar' && key == 'otherDetails' ? product.specifications.otherDetailsa : value}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
          {activeTab === t('materials') && <p>{product.materials}</p>}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4" style={{textAlign:(currentLocale == 'ar')?"right":"left"}}>{t('relatedproduct')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:gap-24 gap-8">
          {relatedProducts.map((relatedProduct, index) => (
            <ProductCard
              key={index}
              imageUrl={relatedProduct.images[0]} 
              productName={relatedProduct.name}
              price={relatedProduct.price}
              id={relatedProduct.id}
            />
          ))}
        </div>
      </div>

      {/* Added to Cart Popup */}
      {showPopup && (
        <div className="fixed top-4 right-4 bg-gray-100 text-black p-4 rounded-lg shadow-lg z-50 animate-slide-in lg:w-1/5 w-2/3 flex items-center space-x-3">
          <FiCheckCircle className="text-green-500 w-6 h-6" />
          <div>
            <h2 className="text-green-500 mb-2">Successfully Added to Cart</h2>
            <p>{product.name}</p>
            {quantity >= 10001 && (
              <p className="text-sm text-red-500 mt-1">Maximum quantity (10000) reached for this item.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;