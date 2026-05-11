"use client";

import { motion } from "framer-motion";
import { SlideContainer } from "../SlideContainer";
import { AlertCircle, Users, TrendingUp, CheckCircle } from "lucide-react";

export function Slide03Problem() {
  return (
    <SlideContainer background="white">
      <div className="space-y-6">
        {/* Punchy Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-3 text-gray-900">
            Traditional Payments Are <span className="text-red-600">Broken</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Financial relationships today are based on trust and infrequent lump sums that misalign incentives
          </p>
        </motion.div>

        {/* Four required sections - More compact */}
        <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {/* 1. WHY this problem matters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-red-50 rounded-xl p-5 border-2 border-red-200"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Why This Matters
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-bold">$800B+ global payroll</span> and <span className="font-bold">$1.5T+ freelance economy</span> run on broken payment rails.
                  Workers wait 30 days for earned salary. Freelancers risk unpaid work. Token projects struggle with manual vesting.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 2. REAL USER pain point */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200"
          >
            <div className="flex items-start gap-2.5">
              <Users className="w-7 h-7 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Real User Pain
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-bold">Game streamers</span> earn daily but wait weeks for payouts.
                  <span className="font-bold"> Freelance developers</span> risk 30-60 day payment delays with no guarantees.
                  <span className="font-bold"> Remote workers</span> need daily income access, not monthly waits.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. EVIDENCE & trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200"
          >
            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Evidence & Trends
                </h3>
                <ul className="text-sm text-gray-700 leading-relaxed space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-bold">$1.5B+ TVL</span> in Ethereum streaming (DefiLlama)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-bold">Twitch takes 50%</span> with 15-60 day payouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-bold">Zero native</span> streaming on Bitcoin</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* 4. BE HUMAN - relatable */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-green-50 rounded-xl p-5 border-2 border-green-200"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Simple Truth
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You work every day, but <span className="font-bold">your employer holds your money for 30 days.</span>
                  Imagine if Netflix charged you upfront for the whole year—that's what employers do with YOUR salary.
                  Bitcoin can fix this.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide03Notes = {
  timing: "40 seconds",
  notes: [
    "WHY IT MATTERS: $800B payroll + $1.5T freelance markets run on broken payment systems",
    "REAL USERS: Game streamers wait weeks for payouts. Freelancers risk 30-60 day delays. Remote workers need daily access",
    "EVIDENCE (verified): $1.5B+ TVL on Ethereum per DefiLlama. Twitch takes 50% + delays payouts 15-60 days. Zero on Bitcoin",
    "HUMAN TRUTH: You work every day but wait 30 days for YOUR money. Like Netflix charging upfront for the year",
    "Perfect use case: Pay your friend's game streams in real-time with Bitcoin, not waiting for platform payouts"
  ]
};
