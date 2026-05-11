"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListProps {
  items: ReactNode[];
  delay?: number;
}

export function AnimatedList({ items, delay = 0 }: AnimatedListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.15,
            ease: "easeOut"
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
