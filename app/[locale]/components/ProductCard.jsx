'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiShare2, FiMaximize2 } from 'react-icons/fi';
import { AiOutlineHeart, AiFillHeart, AiOutlineShoppingCart } from 'react-icons/ai';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase';

const ProductCard = ({ imageUrl, productName, price, id }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

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

  const uniqueDeviceId = getOrCreateDeviceId();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!uniqueDeviceId) return;
      const wishlistRef = ref(database, `users/${uniqueDeviceId}/wishlist`);
      const snapshot = await get(wishlistRef);
      if (snapshot.exists()) {
        const wishlist = snapshot.val();
        setIsInWishlist(wishlist.includes(id));
      }
    };
    checkWishlistStatus();
  }, [uniqueDeviceId, id]);


  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    await updateUserProduct('wishlist');
    setIsInWishlist(!isInWishlist);
  };

  const updateUserProduct = async (type) => {
    if (!uniqueDeviceId) return;
    const userRef = ref(database, `users/${uniqueDeviceId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      const initialData = {
        [type]: type === 'cart' ? [{ id, quantity: 1, price }] : [id],
      };
      await set(userRef, initialData);
    } else {
      const userData = snapshot.val();
      let products = userData[type] || [];

      // Ensure products is always an array
      products = Array.isArray(products) ? products : Object.values(products);

      if (type === 'cart') {
        const existingProductIndex = products.findIndex(product => product.id === id);
        if (existingProductIndex > -1) {
          products[existingProductIndex].quantity += 1;
        } else {
          products.push({ id, quantity: 1, price });
        }
      } else {
        if (products.includes(id)) {
          products = products.filter(productId => productId !== id);
        } else {
          products.push(id);
        }
      }

      await update(userRef, { [type]: products });
    }
  };

  const handleCardClick = () => {
    router.push(`/products/${id}`);
  };
  return (
    <div 
      className="flex flex-col items-center cursor-pointer relative"
      style={{width:"auto"}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      <div
        className="relative bg-cover bg-center shadow-lg overflow-hidden"
        style={{width:"38vw",minWidth:"120px", maxWidth:"250px" , aspectRatio:"1/1.3"}}
      >
        <img src={imageUrl} alt="" className='relative' style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div 
          className="absolute bg-white p-2 rounded-full shadow-lg cursor-pointer"
          style={{top:"10px", left:"10px"}}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToWishlist(e);
          }}
        >
          {isInWishlist ? (
            <AiFillHeart className="text-red-600 w-2 h-2 lg:w-5 lg:h-5" />
          ) : (
            <AiOutlineHeart className="text-gray-600 w-3 h-3 lg:w-5 lg:h-5" />
          )}
        </div>
        
        {/* Share and Expand Icons */}
        <div
          className={`absolute right-4 flex flex-col space-y-2 lg:transition-opacity lg:duration-300 ${hovered ? 'lg:opacity-100' : 'lg:opacity-0'} ease-in-out opacity-100 lg:opacity-0`}
          style={{top:"10px", right:"10px"}}>
          <div className="bg-white p-2 rounded-full shadow-lg cursor-pointer">
            <FiShare2 className="text-gray-600 w-2 h-2 lg:w-5 lg:h-5" />
          </div>
          <div className="bg-white p-2 rounded-full shadow-lg cursor-pointer">
            <FiMaximize2 className="text-gray-600 w-2 h-2 lg:w-5 lg:h-5" />
          </div>
        </div>
        <div className='w-full flex justify-center items-center' onClick={handleCardClick}>
          <button 
            className={`absolute bottom-4 bg-white text-gray-800 font-semibold py-1 px-3 sm:py-2 sm:px-4 rounded-md shadow-lg border border-gray-300 flex items-center space-x-1 sm:space-x-2 transition-all duration-300 hover:bg-black hover:text-white group lg:${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-100'} opacity-100 translate-y-0`}
          >
            <AiOutlineShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 group-hover:text-white" />
            <span className='text-xs sm:text-sm'>Select options</span>
          </button>
        </div>
      </div>
      <div className="text-center mt-4">
        <h3 className="text-lg font-medium text-gray-900">{productName}</h3>
        <span className='flex'><p className="text-gray-500 mr-1 line-through">₹{price}</p><p className="text-black">₹{price}</p></span>
      </div>
    </div>
  );
};


export default ProductCard;