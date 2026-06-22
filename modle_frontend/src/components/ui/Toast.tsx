import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export type ToastState = {
  type: "success" | "error";
  message: string;
};

export function Toast({ toast }: { toast: ToastState }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      role="status"
      className={`fixed bottom-6 right-6 z-[9999] rounded-2xl border px-6 py-4 text-[15px] font-bold tracking-wide shadow-2xl ${
        toast.type === "success"
          ? "border-green-500 bg-white text-green-700"
          : "border-red-500 bg-white text-red-700"
      }`}
    >
      {toast.message}
    </motion.div>,
    document.body
  );
}
