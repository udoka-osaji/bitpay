"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { Lightbulb, Zap, Target, ArrowRight } from "lucide-react";

export function Slide04Solution() {
  return (
    <SlideContainer background="white">
      <div className="space-y-5">
        {/* Header - Clear solution statement */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-3 text-gray-900">
            BitPay: <span className="text-orange-600">Stream Bitcoin Per-Second</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Smart contracts guarantee continuous payments—no trust, no waiting, no risk
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-5 max-w-6xl mx-auto">
          {/* Left: Key solution points */}
          <div className="space-y-4">
            {/* Aha Moment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-7 h-7 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1.5">Aha! Moment</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold">What if money flowed like Netflix streams video?</span> Instead of waiting months for payment,
                    Bitcoin streams per-second into your wallet based on time worked. You earn it, you own it, instantly.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* What it does */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"
            >
              <div className="flex items-start gap-3">
                <Zap className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1.5">What BitPay Does</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold">Lock sBTC</span> in smart contract vaults. Money <span className="font-bold">streams continuously</span> per-second.
                    Recipients <span className="font-bold">withdraw anytime.</span> Senders <span className="font-bold">cancel anytime,</span> recover unvested funds.
                    Future streams <span className="font-bold">tradable as NFTs.</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Key outcomes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-green-50 rounded-xl p-4 border-2 border-green-200"
            >
              <div className="flex items-start gap-3">
                <Target className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-1.5">Key Outcomes</h3>
                  <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><span className="font-bold">Faster:</span> Per-second access vs 30-day waits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><span className="font-bold">Safer:</span> Smart contracts guarantee payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><span className="font-bold">More control:</span> Both parties can exit anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: How it solves better */}
          <div className="space-y-4">
            {/* Better than existing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200"
            >
              <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-purple-600" />
                Better Than Existing Solutions
              </h3>
              <div className="space-y-2.5">
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">Traditional Payroll</p>
                  <p className="text-sm text-gray-700"><span className="font-bold">❌ Monthly waits</span> → <span className="font-bold text-green-600">✓ Per-second streams</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">Freelance Platforms</p>
                  <p className="text-sm text-gray-700"><span className="font-bold">❌ Trust + fees</span> → <span className="font-bold text-green-600">✓ Smart contracts</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">Token Vesting</p>
                  <p className="text-sm text-gray-700"><span className="font-bold">❌ Manual execution</span> → <span className="font-bold text-green-600">✓ Automated</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-bold text-gray-500 mb-1">Ethereum Streaming</p>
                  <p className="text-sm text-gray-700"><span className="font-bold">❌ No Bitcoin</span> → <span className="font-bold text-green-600">✓ First on Bitcoin</span></p>
                </div>
              </div>
            </motion.div>

            {/* For who */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200"
            >
              <h3 className="text-lg font-black text-gray-900 mb-2">Connect to Users</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold">For game streamers,</span> BitPay lets you receive fan payments instantly, not weeks later.
                <span className="font-bold"> For remote workers,</span> access your salary daily, not monthly.
                <span className="font-bold"> For DAOs,</span> automate token vesting trustlessly.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide04Notes = {
  timing: "45 seconds",
  notes: [
    "AHA MOMENT: What if money flowed like Netflix? Bitcoin streams per-second as you work",
    "WHAT IT DOES: Lock sBTC, streams continuously, withdraw anytime, cancel anytime, trade as NFTs",
    "KEY OUTCOMES: Faster (seconds vs 30 days), Safer (smart contracts), More control (exit anytime)",
    "BETTER THAN: Traditional payroll (monthly), freelance platforms (trust+fees), token vesting (manual), Ethereum (not Bitcoin)",
    "FOR WHO: Game streamers get instant fan payments, workers access salary daily, DAOs automate vesting"
  ]
};
