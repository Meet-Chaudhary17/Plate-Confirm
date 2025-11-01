import React from 'react';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          }
        }}
      />
      {children}
    </div>
  );
};

export default Layout;
