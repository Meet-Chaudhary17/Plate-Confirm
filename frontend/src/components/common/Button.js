import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className, type = 'button' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      type={type}
      className={`px-6 py-2 rounded-full font-semibold text-white shadow-neumorphic transition-all duration-300 hover:shadow-neumorphic-inset ${className}`}>
      {children}
    </motion.button>
  );
};

export default Button;
