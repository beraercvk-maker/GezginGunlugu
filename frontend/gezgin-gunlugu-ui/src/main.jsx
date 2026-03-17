import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import './index.css';

import { AuthProvider } from './AuthContext.jsx'; 
import App from './App.jsx'; 

import LandingPage from './pages/LandingPage.jsx'; 
import LogListPage from './pages/LogListPage.jsx'; 
import NewLogForm from './pages/NewLogForm.jsx'; 
import RegisterPage from './pages/RegisterPage.jsx'; 
import LoginPage from './pages/LoginPage.jsx'; 
import AdminPanelPage from './pages/AdminPanelPage.jsx'; 
import LogDetailPage from './pages/LogDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; 
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLogList from './components/admin/AdminLogList.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Navbar buranın içinde
    children: [
      {
        index: true, 
        element: <LandingPage />, 
      },
      {
        path: "logs", 
        element: <LogListPage />,
      },
      {
        path: "dashboard", 
        element: <AdminDashboard />,
      },
       {
        path: "admin/logs", 
        element: <AdminLogList />,
      },
      {
        path: "logs/:id",
        element: <LogDetailPage />,
      },
      {
        path: "new", 
        element: <NewLogForm />, 
      },

      {
        path: "discover",
        element: <DiscoverPage />,
      },
      {
        path: "admin",
        element: <AdminPanelPage />,
      },
      {
        path: "profile", 
        element: <ProfilePage />,
      },
      // --- AUTH SAYFALARI TEKRAR BURADA ---
      {
        path: "login", 
        element: <LoginPage />,
      },
      {
        path: "register", 
        element: <RegisterPage />, 
      },
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />, 
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);