import React, { useContext, useState, Fragment } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import FinTrackLogo from '../../assets/images/fintrack-logo.png'; // You'll need a logo image

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const { actualTheme, setTheme } = useContext(ThemeContext); // Use `setTheme` to allow 'system'
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    if (actualTheme === 'dark') {
      setTheme('light'); // Manually set to light
    } else {
      setTheme('dark'); // Manually set to dark
    }
  };

  const navigation = [
    // You can add quick nav items here if needed, but sidebar will be primary
    // { name: 'Dashboard', href: '/dashboard' },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <Disclosure as="nav" className="bg-card-light dark:bg-card-dark shadow-md sticky top-0 z-40">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {/* Mobile menu button for sidebar */}
                <button
                  type="button"
                  className="lg:hidden -ml-2 mr-2 p-2 inline-flex items-center justify-center rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-light dark:focus:ring-primary-dark"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </button>
                {/* Logo - visible on larger screens or when sidebar is hidden */}
                <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                  <img
                    className="block h-8 w-auto lg:hidden" // Show smaller logo on mobile if sidebar is primary nav
                    src={FinTrackLogo} // Replace with your logo
                    alt="FinTrack Pro"
                  />
                  <img
                    className="hidden h-8 w-auto lg:block"
                    src={FinTrackLogo} // Replace with your logo
                    alt="FinTrack Pro"
                  />
                  <span className="hidden sm:block ml-2 text-xl font-semibold text-text-light dark:text-text-dark">
                    FinTrack Pro
                  </span>
                </Link>
              </div>

              <div className="flex items-center">
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? 'bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                            : 'text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-text-light dark:hover:text-text-dark',
                          'px-3 py-2 rounded-md text-sm font-medium transition-colors'
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="ml-3 p-1.5 rounded-full text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-text-light dark:hover:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                  aria-label={actualTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {actualTheme === 'dark' ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-4">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-card-light dark:bg-card-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 dark:focus:ring-offset-background-dark">
                      <span className="sr-only">Open user menu</span>
                      {/* Placeholder icon, replace with user avatar if available */}
                      <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400 dark:text-gray-500" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-card-light dark:bg-card-dark py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-3">
                        <p className="text-sm text-text-light dark:text-text-dark">Signed in as</p>
                        <p className="truncate text-sm font-medium text-text-light dark:text-text-dark">
                          {user?.name || 'User'}
                        </p>
                         <p className="truncate text-xs text-text-muted-light dark:text-text-muted-dark">
                          {user?.email}
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={classNames(
                              active ? 'bg-gray-100 dark:bg-gray-700' : '',
                              'block px-4 py-2 text-sm text-text-light dark:text-text-dark w-full text-left'
                            )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                       {/* Add more items like Settings if needed */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100 dark:bg-gray-700' : '',
                              'flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          {/* Mobile menu panel (not used if sidebar is primary mobile nav) */}
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;