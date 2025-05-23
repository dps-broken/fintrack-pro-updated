// client/src/pages/ProfilePage.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import userService from '../services/user.service.js';
import categoryService from '../services/category.service.js';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BellIcon,
  PaintBrushIcon, // <<<<------ CORRECTED ICON IMPORT
  TagIcon,
  TrashIcon,
  PlusCircleIcon, // Added for "Add Category" button
} from '@heroicons/react/24/outline';
import CustomCategoryList from '../components/categories/CustomCategoryList';
import AddEditCategoryModal from '../components/categories/AddEditCategoryModal';

const ProfilePage = () => {
  const { user, updateUserContext, logout } = useContext(AuthContext);
  const { theme, setTheme: setThemeContext } = useContext(ThemeContext); // Removed actualTheme if not directly used
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const [customCategories, setCustomCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);


  // --- Profile Form ---
  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: async (values) => {
      setIsLoadingProfile(true);
      try {
        const updatedUser = await userService.updateProfile(values);
        updateUserContext(updatedUser);
        toast.success('Profile updated successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to update profile.');
      } finally {
        setIsLoadingProfile(false);
      }
    },
  });

  // --- Password Form ---
  const passwordFormik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().required('New password is required').min(6, 'Must be at least 6 characters'),
      confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm new password'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsLoadingPassword(true);
      try {
        await userService.updatePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success('Password changed successfully!');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to change password.');
      } finally {
        setIsLoadingPassword(false);
      }
    },
  });

  // --- Settings Form (Theme & Notifications) ---
  const settingsFormik = useFormik({
    initialValues: {
      themePreference: user?.themePreference || theme,
      dailyReport: user?.emailPreferences?.dailyReport ?? true,
      monthlyReport: user?.emailPreferences?.monthlyReport ?? true,
      budgetAlerts: user?.emailPreferences?.budgetAlerts ?? true,
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoadingSettings(true);
      try {
        const themeUpdatePromise = userService.updateThemePreference(values.themePreference);
        const emailPrefsUpdatePromise = userService.updateEmailPreferences({
          dailyReport: values.dailyReport,
          monthlyReport: values.monthlyReport,
          budgetAlerts: values.budgetAlerts,
        });

        const [themeResponse, emailPrefsResponse] = await Promise.all([themeUpdatePromise, emailPrefsUpdatePromise]);
        
        if (theme !== values.themePreference) {
            setThemeContext(values.themePreference);
        }
        updateUserContext({
            themePreference: themeResponse.themePreference,
            emailPreferences: emailPrefsResponse.emailPreferences
        });

        toast.success('Settings updated successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to update settings.');
      } finally {
        setIsLoadingSettings(false);
      }
    },
  });

  const themeOptions = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' },
  ];


  // --- Category Management ---
  const fetchCustomCategories = useCallback(async () => {
    if (!user?._id) return; // Don't fetch if user is not loaded yet
    try {
        const allCategories = await categoryService.getCategories();
        setCustomCategories(allCategories.filter(cat => !cat.isPredefined && cat.user === user._id));
    } catch (error) {
        toast.error("Failed to load custom categories.");
    }
  }, [user?._id]); // Depend on user._id

  useEffect(() => {
    fetchCustomCategories();
  }, [fetchCustomCategories]);

  const handleCategoryModalOpen = (category = null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySaved = () => {
    fetchCustomCategories(); // Re-fetch categories after save
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this custom category? This cannot be undone.")) {
        try {
            await categoryService.deleteCategory(categoryId);
            toast.success("Category deleted successfully.");
            fetchCustomCategories(); // Re-fetch
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to delete category. It might be in use.");
        }
    }
  };

  // --- Delete Account ---
  const handleDeleteAccount = async () => {
      if(window.confirm("ARE YOU ABSOLUTELY SURE? This action cannot be undone and will permanently delete your account and all associated data.")) {
          if(window.confirm("SECOND CONFIRMATION: This is your last chance. Are you sure you want to delete your account?")) {
              setIsLoadingDelete(true);
              try {
                  await userService.deleteAccount();
                  toast.success("Account deleted successfully. You will be logged out.");
                  logout(); 
              } catch (error) {
                  toast.error(error.response?.data?.message || error.message || "Failed to delete account.");
              } finally {
                  setIsLoadingDelete(false);
              }
          }
      }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-text-light dark:text-text-dark">
        Profile & Settings
      </h1>

      {/* Profile Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader title="Personal Information" />
          <CardBody>
            <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
              <Input
                id="profile-name" name="name" label="Full Name" type="text"
                leftIcon={<UserCircleIcon />}
                {...profileFormik.getFieldProps('name')}
                error={profileFormik.touched.name && profileFormik.errors.name}
                touched={profileFormik.touched.name}
                disabled={isLoadingProfile}
              />
              <Input
                id="profile-email" name="email" label="Email Address" type="email"
                leftIcon={<EnvelopeIcon />}
                {...profileFormik.getFieldProps('email')}
                error={profileFormik.touched.email && profileFormik.errors.email}
                touched={profileFormik.touched.email}
                disabled={isLoadingProfile}
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isLoadingProfile} disabled={isLoadingProfile || !profileFormik.dirty}>
                  Save Profile
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader title="Change Password" />
          <CardBody>
            <form onSubmit={passwordFormik.handleSubmit} className="space-y-6">
              <Input
                id="currentPassword" name="currentPassword" label="Current Password" type="password"
                leftIcon={<LockClosedIcon />}
                {...passwordFormik.getFieldProps('currentPassword')}
                error={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                touched={passwordFormik.touched.currentPassword}
                disabled={isLoadingPassword}
              />
              <Input
                id="newPassword" name="newPassword" label="New Password" type="password"
                leftIcon={<LockClosedIcon />}
                {...passwordFormik.getFieldProps('newPassword')}
                error={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                touched={passwordFormik.touched.newPassword}
                disabled={isLoadingPassword}
              />
              <Input
                id="confirmNewPassword" name="confirmNewPassword" label="Confirm New Password" type="password"
                leftIcon={<LockClosedIcon />}
                {...passwordFormik.getFieldProps('confirmNewPassword')}
                error={passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword}
                touched={passwordFormik.touched.confirmNewPassword}
                disabled={isLoadingPassword}
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isLoadingPassword} disabled={isLoadingPassword || !passwordFormik.dirty}>
                  Change Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      {/* App Settings (Theme & Notifications) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader title="Application Settings" />
          <CardBody>
            <form onSubmit={settingsFormik.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="themePreference" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                  <PaintBrushIcon className="inline h-5 w-5 mr-2 align-text-bottom" /> {/* <<<<------ CORRECTED ICON USAGE */}
                  Theme Preference
                </label>
                <Select
                    id="themePreference"
                    name="themePreference"
                    options={themeOptions}
                    value={themeOptions.find(opt => opt.value === settingsFormik.values.themePreference)}
                    onChange={option => settingsFormik.setFieldValue('themePreference', option.value)}
                    onBlur={() => settingsFormik.setFieldTouched('themePreference', true)}
                    isDisabled={isLoadingSettings}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    <BellIcon className="inline h-5 w-5 mr-2 align-text-bottom" /> Email Notifications
                </h3>
                <div className="space-y-3">
                    {['dailyReport', 'monthlyReport', 'budgetAlerts'].map(prefKey => (
                        <div key={prefKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                            <span className="text-sm text-text-light dark:text-text-dark">
                                {prefKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                            <label htmlFor={prefKey} className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id={prefKey}
                                    name={prefKey}
                                    className="sr-only peer"
                                    checked={settingsFormik.values[prefKey]}
                                    onChange={settingsFormik.handleChange}
                                    disabled={isLoadingSettings}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light dark:peer-focus:ring-primary-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                            </label>
                        </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isLoadingSettings} disabled={isLoadingSettings || !settingsFormik.dirty}>
                  Save Settings
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      {/* Custom Category Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
            <CardHeader title="Manage Custom Categories">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryModalOpen()}
                    leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                    disabled={isLoadingSettings} // Disable if settings are being saved
                >
                    Add Category
                </Button>
            </CardHeader>
            <CardBody>
                <CustomCategoryList
                    categories={customCategories}
                    onEdit={handleCategoryModalOpen}
                    onDelete={handleDeleteCategory}
                />
                {customCategories.length === 0 && (
                    <p className="text-sm text-center text-text-muted-light dark:text-text-muted-dark py-4">
                        You haven't added any custom categories yet.
                    </p>
                )}
            </CardBody>
        </Card>
      </motion.div>

      {/* Danger Zone - Delete Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-red-500 dark:border-red-600">
            <CardHeader title="Danger Zone" className="bg-red-50 dark:bg-red-900/30 border-b-red-200 dark:border-b-red-700" />
            <CardBody>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div>
                        <h4 className="text-md font-semibold text-text-light dark:text-text-dark">Delete Your Account</h4>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">
                            Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        isLoading={isLoadingDelete}
                        className="mt-4 sm:mt-0 sm:ml-4"
                        leftIcon={<TrashIcon className="h-5 w-5"/>}
                    >
                        Delete Account
                    </Button>
                </div>
            </CardBody>
        </Card>
      </motion.div>

      <AddEditCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null);}}
        onCategorySaved={handleCategorySaved}
        categoryToEdit={editingCategory}
        existingCategories={customCategories}
      />

    </div>
  );
};

export default ProfilePage;