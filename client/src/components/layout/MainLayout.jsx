// client/src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // <<--- IMPORT useLocation
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation(); // <<--- GET location USING THE HOOK

  return (
    <div className='min-h-screen bg-background-light dark:bg-background-dark'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className='lg:pl-64 flex flex-col flex-1'>
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className='flex-1 py-6'>
          <div className='px-4 sm:px-6 lg:px-8'>
            <motion.div
              key={location.pathname} // Now uses the 'location' from the hook
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Optional Footer */}
      </div>
    </div>
  );
};

export default MainLayout;
