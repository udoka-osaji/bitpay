'use client';

import { motion } from 'framer-motion';
import { SlideContainer } from '../SlideContainer';
import { ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';

export function Slide06LiveDemo() {
  return (
    <SlideContainer background="white">
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
            <Play className="w-12 h-12 text-orange-600" />
          </div>

          <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-4">
            Let's See It <span className="text-orange-600">Live</span>
          </h2>

          <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
            Visit the website and see how it works
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>bitpay-more.vercel.app</span>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide06Notes = {
  timing: "10 seconds",
  notes: [
    "Now let's see it in action - live demo at bitpay-more.vercel.app",
    "Show: Create stream, watch vesting, withdraw, marketplace"
  ]
};
