"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  gradient?: "primary" | "secondary" | "accent";
}

export function IconCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  gradient = "primary"
}: IconCardProps) {
  const gradients = {
    primary: "from-orange-500 to-pink-600",
    secondary: "from-cyan-500 to-teal-600",
    accent: "from-purple-500 to-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div className="relative p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradients[gradient]} mb-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
