'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex gap-1">
        <div 
          className="w-2 h-2 rounded-full bg-emerald-500" 
          style={{ 
            animation: 'typing-bounce 1.4s infinite ease-in-out',
            animationDelay: '0ms'
          }} 
        />
        <div 
          className="w-2 h-2 rounded-full bg-emerald-500" 
          style={{ 
            animation: 'typing-bounce 1.4s infinite ease-in-out',
            animationDelay: '200ms'
          }} 
        />
        <div 
          className="w-2 h-2 rounded-full bg-emerald-500" 
          style={{ 
            animation: 'typing-bounce 1.4s infinite ease-in-out',
            animationDelay: '400ms'
          }} 
        />
      </div>
      
      <style jsx>{`
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
