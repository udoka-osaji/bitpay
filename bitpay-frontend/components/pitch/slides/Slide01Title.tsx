"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { Bitcoin, Zap, ArrowRight, Users, Wallet, ExternalLink } from "lucide-react";
import Link from "next/link";

export function Slide01Title() {
  return (
    <SlideContainer background="white">
      <div className="grid md:grid-cols-2 gap-12 items-center h-full px-8">
        {/* Left side - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
              <Bitcoin className="w-8 h-8 text-orange-500" />
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-6xl md:text-7xl font-black mb-4 text-gray-900">
              BitPay
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 font-medium mb-4">
              Bitcoin Streaming & Vesting Vaults
            </p>

            <p className="text-xl md:text-2xl font-bold text-orange-600 italic">
              "Netflix for Money, Secured by Bitcoin"
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                Built on Stacks
              </span>
            </div>

            <div className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                Powered by sBTC
              </span>
            </div>

            <div className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                Production Ready
              </span>
            </div>
          </div>

          {/* Visit Website Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
            >
              <span>Visit Website</span>
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Simple illustration showing payment flow */}
          <div className="relative bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
            {/* Sender */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <Wallet className="w-8 h-8 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Sender</span>
              </div>

              {/* Flow arrow */}
              <div className="flex-1 mx-4 relative">
                <div className="h-1 bg-orange-300 rounded-full" />
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 20 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 transform -translate-y-1/2"
                >
                  <div className="flex items-center gap-1">
                    <Bitcoin className="w-4 h-4 text-orange-600" />
                    <ArrowRight className="w-4 h-4 text-orange-600" />
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Recipient</span>
              </div>
            </div>

            {/* Stream visualization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Per-second</span>
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                Continuous Bitcoin Streaming
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide01Notes = {
  timing: "30 seconds",
  notes: [
    "Welcome! BitPay is the first programmable cash flow primitive on Bitcoin",
    "We're bringing continuous money streams to Bitcoin via sBTC on Stacks",
    "Think Netflix for money - instead of streaming shows, we stream payments",
    "Built for the Stacks Vibe Coding Hackathon, production-ready from day one"
  ]
};
