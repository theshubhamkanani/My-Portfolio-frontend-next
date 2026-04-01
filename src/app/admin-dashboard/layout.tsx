// src/app/admin-dashboard/layout.tsx
"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Create the state here in the parent
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* 2. Pass the state and the toggle function to the sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* 3. Dynamically change the padding based on the state */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {children}
      </div>
    </div>
  );
}