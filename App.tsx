import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./src/contexts/ThemeContext";

import Home from "./src/pages/Home";
import Projects from "./src/pages/Projects";
import Experience from "./src/pages/Experience";
import Analyses from "./src/pages/Analyses";
import Writeups from "./src/pages/Writeups";
import WriteupDetail from "./src/pages/WriteupDetail";
import Contact from "./src/pages/Contact";
import NotFound from "./src/pages/NotFound";
import AdminLogin from "./src/pages/AdminLogin.tsx";
import AdminDashboard from "./src/pages/AdminDashboard.tsx";
import AdminWriteups from "./src/pages/AdminWriteups.tsx";
import AdminComments from "./src/pages/AdminComments.tsx";
import ProtectedRoute from "./src/components/ProtectedRoute.tsx";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Theme appearance="inherit" radius="large" scaling="100%">
        <Router>
          <main className="min-h-screen font-inter overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/analyses" element={<Analyses />} />
              <Route path="/writeups" element={<Writeups />} />
              <Route path="/writeups/:id" element={<WriteupDetail />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/writeups"
                element={
                  <ProtectedRoute>
                    <AdminWriteups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/comments"
                element={
                  <ProtectedRoute>
                    <AdminComments />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              newestOnTop
              closeOnClick
              pauseOnHover
            />
          </main>
        </Router>
      </Theme>
    </ThemeProvider>
  );
};

export default App;
