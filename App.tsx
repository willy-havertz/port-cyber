import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./src/contexts/ThemeContext";

import Home from "./src/pages/Home";
import Projects from "./src/pages/Projects";
import Experience from "./src/pages/Experience";
import Analyses from "./src/pages/Analyses";
import Writeups from "./src/pages/Writeups";
import Contact from "./src/pages/Contact";
import NotFound from "./src/pages/NotFound";

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
              <Route path="/contact" element={<Contact />} />
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
