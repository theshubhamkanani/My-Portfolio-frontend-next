"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/services/authService';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the token exists in session storage
    const token = sessionStorage.getItem('portfolio_token');

    if (!token) {
      // If no token, kick them back to the landing page 🏠
      router.push('/');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) return <div className="bg-slate-950 min-h-screen text-white p-10">Loading Security... 🛡️</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <nav className="flex justify-between items-center mb-12 pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">Hey Buddy, Welcome Back..</h1>
        <button
          onClick={logoutUser}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium"
        >
          Logout
        </button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-slate-400 text-sm">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-slate-400 text-sm">Active Courses</h3>
          <p className="text-3xl font-bold mt-2">4</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
          <h3 className="text-slate-400 text-sm">Unread Messages</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="bg-blue-600 px-6 py-3 rounded-lg font-bold">+ Add Project</button>
          <button className="bg-slate-800 px-6 py-3 rounded-lg font-bold">Manage Courses</button>
        </div>
      </section>
    </main>
  );
}