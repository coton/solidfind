"use client";

import { X } from "lucide-react";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThankYouModal({ isOpen, onClose }: ThankYouModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] w-[360px] p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#333]/50 hover:text-[#f14110] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-[48px] mb-4">🎉</div>
        <h2 className="text-[20px] font-semibold text-[#333] mb-2">Thank You!</h2>
        <p className="text-[11px] text-[#333]/50 mb-6 tracking-[0.22px]">
          Thank you for your review! Your feedback helps the community make better decisions.
        </p>

        <button
          onClick={onClose}
          className="h-[44px] px-8 rounded-full bg-[#f14110] text-white text-[12px] font-medium tracking-[0.24px] hover:bg-[#d93a0e] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
