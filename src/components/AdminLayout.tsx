import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { logoutAdmin } from "../lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", path: "/admin" },
    { icon: FileText, label: "Writeups", path: "/admin/writeups" },
    { icon: MessageSquare, label: "Comments", path: "/admin/comments" },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {menuItems.find((item) => isActive(item.path))?.label ||
              "Dashboard"}
          </h2>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
