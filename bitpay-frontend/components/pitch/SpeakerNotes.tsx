"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface SpeakerNotesProps {
  isVisible: boolean;
  notes: string[];
  timing: string;
  onClose: () => void;
}

export function SpeakerNotes({
  isVisible,
  notes,
  timing,
  onClose
}: SpeakerNotesProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Speaker Notes
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                  aria-label="Close notes"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-600">
                  {timing}
                </span>
              </div>
            </div>

            {/* Notes content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-4">
                {notes.map((note, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed">
                      {note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer tip */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-1 bg-white rounded border border-gray-300 text-gray-700 font-mono">N</kbd> to toggle notes
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
