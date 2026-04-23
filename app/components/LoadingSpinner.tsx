'use client';

import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'accent' }: { size?: 'sm' | 'md' | 'lg', color?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} border-t-transparent border-${color} rounded-full animate-spin`}></div>
  );
};

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[9999] flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse"></div>
        {/* Spinner */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <p className="text-accent font-serif text-lg tracking-widest animate-pulse">SHMLH</p>
        </div>
      </div>
    </div>
  );
};
