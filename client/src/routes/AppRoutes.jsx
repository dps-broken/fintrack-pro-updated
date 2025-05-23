// client/src/routes/AppRoutes.jsx (OPTIONAL - if you prefer this structure)
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';

// // Layouts
// import MainLayout from '../components/layout/MainLayout';
// import AuthLayout from '../components/layout/AuthLayout';

// // Pages
// import DashboardPage from '../pages/DashboardPage';
// import TransactionsPage from '../pages/TransactionsPage';
// // ... import other pages
// import LoginPage from '../pages/LoginPage';
// import SignupPage from '../pages/SignupPage';
// import NotFoundPage from '../pages/NotFoundPage';

// // Route Protectors
// import ProtectedRoute from './ProtectedRoute';
// import GuestRoute from './GuestRoute';

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Protected Routes */}
//       <Route element={<ProtectedRoute />}>
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<DashboardPage />} />
//           <Route path="/dashboard" element={<DashboardPage />} />
//           <Route path="/transactions" element={<TransactionsPage />} />
//           {/* ... other protected routes */}
//         </Route>
//       </Route>

//       {/* Guest Routes */}
//       <Route element={<GuestRoute />}>
//         <Route element={<AuthLayout />}>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//         </Route>
//       </Route>

//       {/* Not Found */}
//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// };

// export default AppRoutes;