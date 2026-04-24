'use client';

import { useEffect, useState } from 'react';

interface AdSlotProps {
  slot: 'sidebar-1' | 'sidebar-2' | 'inline-1' | 'inline-2' | 'banner' | 'mobile-sticky';
  className?: string;
  format?: 'rectangle' | 'vertical' | 'horizontal' | 'square';
  label?: string;
}

const SLOT_DIMENSIONS: Record<string, { width: string; height: string; label: string }> = {
  'sidebar-1': { width: '300px', height: '250px', label: 'Advertisement' },
  'sidebar-2': { width: '300px', height: '600px', label: 'Advertisement' },
  'inline-1': { width: '100%', height: '120px', label: 'Advertisement' },
  'inline-2': { width: '100%', height: '120px', label: 'Advertisement' },
  'banner': { width: '728px', height: '90px', label: 'Advertisement' },
  'mobile-sticky': { width: '320px', height: '50px', label: 'Advertisement' },
};

export default function AdSlot({ slot, className = '', format, label }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show ads after a short delay to improve CLS
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const dimensions = SLOT_DIMENSIONS[slot];
  const adLabel = label || dimensions.label;

  // Placeholder styling when no real ad network is connected
  // Replace the inner content with actual ad network code (Google AdSense, etc.)
  return (
    <div
      className={`ad-slot-container ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
      data-ad-slot={slot}
      style={{
        width: dimensions.width === '100%' ? '100%' : dimensions.width,
        minHeight: dimensions.height,
      }}
    >
      {/* Ad placeholder — replace with actual ad network code */}
      <div className="w-full border border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center p-4 hover:border-gray-300 transition-colors">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          {adLabel}
        </span>
        <span className="text-[10px] text-gray-300 mt-1">
          {dimensions.width} × {dimensions.height}
        </span>
        {/* 
          TODO: Replace this placeholder with your ad network code.
          Example for Google AdSense:
          <ins class="adsbygoogle"
            style={{ display: 'block', width: dimensions.width, height: dimensions.height }}
            data-ad-client="ca-pub-XXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        */}
      </div>
    </div>
  );
}
