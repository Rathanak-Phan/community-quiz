import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role?.name !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Inter']">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-12 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
