import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion'; // For content animation

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64 flex flex-col flex-1">
        <Navbar setSidebarOpen={setSidebarOpen} /> {/* Pass setSidebarOpen to Navbar for mobile toggle */}
        
        <main className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Framer Motion for page content transitions */}
            <motion.div
              key={location.pathname} // Ensure key changes for AnimatePresence to work
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Outlet /> {/* Child routes will render here */}
            </motion.div>
          </div>
        </main>
        
        {/* Optional Footer can go here */}
        {/* <footer className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                © {new Date().getFullYear()} FinTrack Pro. All rights reserved.
            </div>
        </footer> */}
      </div>
    </div>
  );
};

export default MainLayout;