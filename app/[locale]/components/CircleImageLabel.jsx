'use client'

import { motion } from 'framer-motion';

const handleClick = (_label) =>{
  window.location.href='products?search=' + _label
}
const CircleImageLabel = ({ src, alt, label }) => {
  return (
    <motion.div 
      className="flex flex-col items-center w-28"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className='flex justify-center items-center flex-col gap-2' onClick={()=> handleClick(label)}>
        <div className="relative border-[3.2px] hover:border-dashed border-blue-500 w-28 h-28 rounded-full overflow-hidden group cursor-pointer">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>
        <p className=" text-center text-lg" style={{color:"#555555", fontSize:"14px"}}>{label}</p>
      </div>
          
    </motion.div>
  );
};

export default CircleImageLabel;
