import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Landing } from "./pages/Landing";
import { Products } from "./pages/Products";
import { CartPage } from "./pages/Cart";
import { Orders } from "./pages/Orders";
import { Similar } from "./pages/Similar";
import { useBackendDetect } from "./hooks/useBackendDetect";

export default function App() {
  useBackendDetect();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafaf9] text-zinc-900">
        <Navbar />
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
        <Toaster position="bottom-right" richColors theme="light" toastOptions={{
          style: { background: "#fff", border: "1px solid #e4e4e7", fontSize: 13, borderRadius: 12 }
        }} />
      </div>
    </BrowserRouter>
  );
}

function AnimatedRoutes() {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={loc}>
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id/similar" element={<Similar />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
