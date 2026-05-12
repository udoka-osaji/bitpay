'use client';

import { motion } from 'framer-motion';
import { SlideContainer } from '../SlideContainer';
import { Mail, Github, Heart } from 'lucide-react';

export function Slide08TeamAndThanks() {
  return (
    <SlideContainer background="white">
      <div className="text-center space-y-8">
        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-3">
            Built the <span className="text-orange-600">Future of Bitcoin Payments</span>
          </h2>

          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Production-ready streaming protocol • 7 smart contracts • Live on testnet
          </p>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-bold text-gray-900">Team</h3>

          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-lg text-gray-700">
              <Mail className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Thesoftnode@gmail.com</span>
            </div>

            <div className="flex items-center gap-2 text-lg text-gray-700">
              <Mail className="w-5 h-5 text-orange-600" />
              <span className="font-medium">ujahnaomi104@gmail.com</span>
            </div>

            <div className="flex items-center gap-2 text-lg text-gray-700">
              <Github className="w-5 h-5 text-orange-600" />
              <a
                href="https://github.com/Ifeoma-star/BitpayMore"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-orange-600 transition-colors"
              >
                github.com/Ifeoma-star/BitpayMore
              </a>
            </div>
          </div>
        </motion.div>

        {/* Thank you */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="pt-6"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
            <Heart className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-black text-gray-900">Thank You!</span>
          </div>

          <p className="text-lg text-gray-600 mt-4">
            Built with ❤️ on Bitcoin • Powered by Stacks & sBTC
          </p>
        </motion.div>
      </div>
    </SlideContainer>
  );
}

export const slide08Notes = {
  timing: "20 seconds",
  notes: [
    "We built a production-ready streaming protocol with 7 smart contracts, live on testnet",
    "Our team emails: Thesoftnode@gmail.com, ujahnaomi104@gmail.com",
    "GitHub: github.com/Ifeoma-star/BitpayMore",
    "Thank you for your time! Questions?"
  ]
};
