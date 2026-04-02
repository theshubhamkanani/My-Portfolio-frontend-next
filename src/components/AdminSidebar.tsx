// src/components/AdminSidebar.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the props we expect from layout.tsx
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'text-blue-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800';

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}>

      {/* Header & Toggle Button */}
      <div className="flex items-center justify-between p-4 mb-6 mt-2">
        {isOpen && (
          <Link
            href="/admin-dashboard"
            className="text-xl font-bold text-white tracking-wide whitespace-nowrap overflow-hidden transition-colors hover:text-blue-400"
          >
            SHUBHAM PATEL
          </Link>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ☰
        </button>
      </div>


      <nav className="flex-1 space-y-2 px-2">
        {/* Master Creation Dropdown */}
        <div>
          <button
            onClick={() => {
                if (!isOpen) toggleSidebar(); // Auto-open sidebar if collapsed
                setIsMasterOpen(!isMasterOpen);
            }}
            className="w-full flex justify-between items-center p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
          >
            <div className="flex items-center">
              <span className="text-xl">🛠️</span>
              {isOpen && <span className="font-medium ml-3">Master Creation</span>}
            </div>
            {isOpen && <span className={`transition-transform duration-300 ${isMasterOpen ? 'rotate-180' : ''}`}>▼</span>}
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMasterOpen && isOpen ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col space-y-1 border-l border-slate-700 ml-5 pl-4">
              <Link href="/admin-dashboard/experience" className={`py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap ${isActive('/admin-dashboard/experience')}`}>
                💼 Experience
              </Link>
              <Link href="/admin-dashboard/projects" className={`py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap ${isActive('/admin-dashboard/projects')}`}>
                🚀 Project
              </Link>
              <Link href="/admin-dashboard/skills" className={`py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap ${isActive('/admin-dashboard/skills')}`}>
                🧠 Skills
              </Link>
              <Link href="/admin-dashboard/education" className={`py-2 rounded-lg text-sm transition-colors duration-200 whitespace-nowrap ${isActive('/admin-dashboard/education')}`}>
                🎓 Education
              </Link>
            </div>
          </div>
        </div>

        {/* Standard Links */}
        <Link href="/admin-dashboard/about" className={`flex items-center p-3 rounded-lg font-medium transition-colors duration-200 ${isActive('/admin-dashboard/about')}`}>
          <span className="text-xl">📝</span>
          {isOpen && <span className="ml-3 whitespace-nowrap">About Updation</span>}
        </Link>

        <Link href="/admin-dashboard/contacts" className={`flex items-center p-3 rounded-lg font-medium transition-colors duration-200 ${isActive('/admin-dashboard/contacts')}`}>
          <span className="text-xl">📩</span>
          {isOpen && <span className="ml-3 whitespace-nowrap">Contact Requests</span>}
        </Link>
      </nav>
    </aside>
  );
}