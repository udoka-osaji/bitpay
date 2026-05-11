"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize, Presentation } from "lucide-react";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onSlideChange: (slide: number) => void;
  showNotes: boolean;
  onToggleNotes: () => void;
  onToggleFullscreen: () => void;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  onSlideChange,
  showNotes,
  onToggleNotes,
  onToggleFullscreen
}: SlideNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={currentSlide === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={onNext}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <span className="text-sm text-gray-600 ml-2 font-medium">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>

          {/* Center: Progress dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => onSlideChange(index)}
                className="group relative"
                aria-label={`Go to slide ${index + 1}`}
              >
                <motion.div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-gradient-to-r from-orange-500 to-pink-600"
                      : "w-2 bg-gray-300 group-hover:bg-gray-400"
                  }`}
                  layoutId={index === currentSlide ? "activeSlide" : undefined}
                />
              </button>
            ))}
          </div>

          {/* Right: Control buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleNotes}
              className={`p-2 rounded-lg transition-colors ${
                showNotes
                  ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              aria-label="Toggle speaker notes"
            >
              <Presentation className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              aria-label="Toggle fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
