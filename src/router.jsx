import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';

// Products
import ProductsList from './pages/products/ProductsList';
import NewProduct from './pages/products/NewProduct';
import EditProduct from './pages/products/EditProduct';

// Clients
import ClientsList from './pages/clients/ClientsList';
import NewClient from './pages/clients/NewClient';
import ClientDetails from './pages/clients/ClientDetails';
import EditClient from './pages/clients/EditClient';

// Orders
import OrdersList from './pages/orders/OrdersList';
import NewOrder from './pages/orders/NewOrder';
import OrderDetails from './pages/orders/OrderDetails';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            // Products routes
            {
                path: 'products',
                element: <ProductsList />,
            },
            {
                path: 'products/new',
                element: <NewProduct />,
            },
            {
                path: 'products/:id/edit',
                element: <EditProduct />,
            },
            // Clients routes
            {
                path: 'clients',
                element: <ClientsList />,
            },
            {
                path: 'clients/new',
                element: <NewClient />,
            },
            {
                path: 'clients/:id',
                element: <ClientDetails />,
            },
            {
                path: 'clients/:id/edit',
                element: <EditClient />,
            },
            // Orders routes
            {
                path: 'orders',
                element: <OrdersList />,
            },
            {
                path: 'orders/new',
                element: <NewOrder />,
            },
            {
                path: 'orders/:id',
                element: <OrderDetails />,
            },
        ],
    },
]);
