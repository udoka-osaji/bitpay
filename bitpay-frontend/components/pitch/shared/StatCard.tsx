"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatCardProps {
  value: string;
  label: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
}

export function StatCard({
  value,
  label,
  delay = 0,
  prefix = "",
  suffix = ""
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="text-center"
    >
      <div className="inline-flex items-baseline gap-1">
        {prefix && (
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
            {prefix}
          </span>
        )}
        <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          {value}
        </span>
        {suffix && (
          <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {suffix}
          </span>
        )}
      </div>
      <p className="text-xl text-gray-600 font-medium mt-3">
        {label}
      </p>
    </motion.div>
  );
}
