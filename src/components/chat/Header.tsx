'use client';

import { Badge } from '@/components/ui/badge';
import { Smartphone, CircleCheck } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onClearChat: () => void;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo and Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/30">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Huawei Support</h1>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <CircleCheck className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="text-xs text-white/80">Online</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-white/50" />
                <span className="text-xs text-white/60">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs cursor-default bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300"
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
          Huawei AI
        </Badge>
      </div>
    </div>
  );
}
