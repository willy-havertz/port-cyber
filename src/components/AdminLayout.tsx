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
  Shield,
  Mail,
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
    { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
    { icon: Shield, label: "Security Tools", path: "/admin/security-tools" },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed lg:sticky top-0 h-screen z-30 lg:z-0 ${
          sidebarOpen ? "w-64" : "w-64 lg:w-20"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Admin</h1>}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-green-400"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Top Bar */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-900 dark:text-white" />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {menuItems.find((item) => isActive(item.path))?.label ||
              "Dashboard"}
          </h2>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
