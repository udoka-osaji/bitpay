"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { Quote } from "lucide-react";

export function Slide02TwitterPitch() {
  return (
    <SlideContainer background="white">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-8 max-w-5xl">
          {/* Main pitch - Quote style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Quote mark */}
            <Quote className="absolute -top-6 -left-6 w-20 h-20 text-gray-200" />

            <div className="relative">
              <p className="text-5xl md:text-6xl font-black leading-tight text-gray-900 mb-6">
                Netflix for Money,
                <br />
                <span className="text-orange-600">Secured by Bitcoin</span>
              </p>

              <div className="w-32 h-1.5 bg-orange-500 mx-auto mb-8" />

              <p className="text-2xl md:text-3xl text-gray-700 font-medium leading-relaxed max-w-4xl mx-auto">
                BitPay streams Bitcoin payments <span className="font-bold text-gray-900">per-second</span> using smart contracts—
                no more waiting 30 days for salary or risking non-payment for freelance work.
              </p>
            </div>
          </motion.div>

          {/* Key points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <div className="px-5 py-2.5 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-base font-bold text-gray-900">
                🎯 First on Bitcoin
              </p>
            </div>

            <div className="px-5 py-2.5 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-base font-bold text-gray-900">
                ⚡ Per-Second Streaming
              </p>
            </div>

            <div className="px-5 py-2.5 bg-gray-50 rounded-lg border-2 border-gray-200">
              <p className="text-base font-bold text-gray-900">
                🔒 Trust-Minimized
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide02Notes = {
  timing: "25 seconds",
  notes: [
    "Our Twitter pitch: Netflix for Money, Secured by Bitcoin",
    "BitPay is the FIRST protocol bringing streaming payments to Bitcoin",
    "Just like Netflix streams video continuously, we stream Bitcoin payments per-second",
    "Solves real problems: no more 30-day salary waits, no freelancer payment risks",
    "Trust-minimized through smart contracts - code guarantees, not promises"
  ]
};
