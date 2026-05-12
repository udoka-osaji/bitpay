'use client';

import { motion } from 'framer-motion';
import { Lock, Zap, ArrowDownToLine, XCircle, Shield, Clock, Unlock } from 'lucide-react';
import { SlideContainer } from '../SlideContainer';

export function Slide05HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Lock,
      title: "Lock sBTC",
      description: "Sender locks Bitcoin in a smart contract vault",
      color: "orange"
    },
    {
      number: "2",
      icon: Zap,
      title: "Money Streams",
      description: "Funds vest continuously per-second to recipient",
      color: "blue"
    },
    {
      number: "3",
      icon: ArrowDownToLine,
      title: "Withdraw Anytime",
      description: "Recipient claims vested amount whenever needed",
      color: "green"
    },
    {
      number: "4",
      icon: XCircle,
      title: "Cancel Option",
      description: "Sender can cancel, recovers unvested funds",
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      orange: "bg-orange-50 border-orange-200 text-orange-600",
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600"
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <SlideContainer background="white" className="py-8">
      <div className="text-center max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black leading-tight text-gray-900 mb-4">
            BitPay Turns Payment Moments
            <br />
            Into <span className="text-orange-600">Payment Relationships</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smart contracts guarantee continuous payments. No trust needed.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className={`rounded-xl p-5 border-2 ${getColorClasses(step.color)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-current">
                    <span className="text-lg font-black">{step.number}</span>
                  </div>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-700">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-8 pt-4"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            <span className="text-base font-bold text-gray-900">Trust-minimized</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-base font-bold text-gray-900">Continuous</span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full" />
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-green-600" />
            <span className="text-base font-bold text-gray-900">Flexible</span>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide05Notes = {
  timing: "30 seconds",
  notes: [
    "BitPay turns payment MOMENTS into payment RELATIONSHIPS",
    "Step 1: Sender locks sBTC in smart contract vault - trustless escrow",
    "Step 2: Money streams continuously per-second to recipient - like Netflix for payments",
    "Step 3: Recipient withdraws anytime - access your vested funds on demand",
    "Step 4: Sender can cancel - recovers unvested portion, fair for both sides",
    "Trust-minimized, Continuous, Flexible - the future of payments"
  ]
};
