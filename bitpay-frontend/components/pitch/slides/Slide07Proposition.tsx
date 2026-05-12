'use client';

import { motion } from 'framer-motion';
import { SlideContainer } from '../SlideContainer';
import { Sparkles, TrendingUp, Bitcoin, Layers } from 'lucide-react';

export function Slide07Proposition() {
  return (
    <SlideContainer background="white">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-2 text-orange-600">
            Proposition
          </h2>
        </motion.div>

        {/* 3 sections */}
        <div className="space-y-5 max-w-6xl mx-auto">
          {/* Value Prop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Value Prop</h3>
                <p className="text-sm text-gray-600 italic mb-3">Why this matters. What makes it unique?</p>
                <p className="text-base text-gray-900">
                  <span className="font-bold">First streaming protocol on Bitcoin.</span> Real sBTC utility beyond speculation.
                  Guaranteed payments in code, tradeable as NFTs.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Impact Potential */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Impact Potential</h3>
                <p className="text-sm text-gray-600 italic mb-3">Potential adoption. How can it scale?</p>
                <p className="text-base text-gray-900">
                  <span className="font-bold">$1.5T freelance + $800B payroll markets.</span> Composable primitive—
                  payroll apps, DAOs, subscriptions build on us. Network effects.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bitcoin & Stacks Alignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200"
          >
            <div className="flex items-start gap-3">
              <Layers className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Bitcoin & Stacks Alignment</h3>
                <p className="text-sm text-gray-600 italic mb-3">How does this increase Bitcoin utility? How does this increase Stacks adoption?</p>
                <p className="text-base text-gray-900">
                  <span className="font-bold">Bitcoin:</span> Programmable sBTC for continuous payments, not just holding.
                  <br />
                  <span className="font-bold">Stacks:</span> Showcases Clarity safety for financial contracts. Real adoption driven by utility.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}

export const slide07Notes = {
  timing: "40 seconds",
  notes: [
    "VALUE PROP - Why matters: $2.3T markets broken. What's unique: First Bitcoin streaming, guaranteed payments",
    "IMPACT POTENTIAL - Adoption: $1.5T freelance, $800B payroll. Scale: Composable primitive, network effects",
    "BITCOIN UTILITY - Programmable sBTC for payments, real use case beyond speculation",
    "STACKS ADOPTION - Showcases Clarity safety, attracts developers needing trust-minimized infrastructure"
  ]
};
