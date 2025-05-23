import React, { Fragment, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  ArrowsRightLeftIcon, // For Transactions
  TrophyIcon, // For Goals
  BanknotesIcon, // For Budget
  UserCircleIcon as UserProfileIcon, // For Profile
  XMarkIcon,
  ChartPieIcon, // For Analytics/Dashboard
} from '@heroicons/react/24/outline';
import FinTrackLogo from '../../assets/images/fintrack-logo.png'; // Re-use logo
import { ThemeContext } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartPieIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Budgets', href: '/budget', icon: BanknotesIcon },
  { name: 'Goals', href: '/goals', icon: TrophyIcon },
  { name: 'Profile', href: '/profile', icon: UserProfileIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { actualTheme } = useContext(ThemeContext); // To adjust logo for dark theme if needed

  const sidebarContent = (
    <>
      <div className="flex h-16 flex-shrink-0 items-center px-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 lg:border-none">
        <Link to="/dashboard" className="flex items-center w-full">
          <img
            className="h-8 w-auto"
            src={FinTrackLogo}
            alt="FinTrack Pro"
          />
          <span className="ml-3 text-xl font-semibold text-text-light dark:text-text-dark">
            FinTrack Pro
          </span>
        </Link>
      </div>
      <nav className="mt-5 flex flex-1 flex-col gap-y-7 px-6">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={() => {
                        if (sidebarOpen && typeof setSidebarOpen === 'function') {
                            setSidebarOpen(false); // Close sidebar on mobile after click
                        }
                    }}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                          : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                      )
                    }
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          {/* Optional: Add more sections to sidebar if needed */}
        </ul>
      </nav>
    </>
  );


  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card-light dark:bg-card-dark pb-4 ring-1 ring-white/10 dark:ring-transparent">
                  {sidebarContent}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark pb-4">
            {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;