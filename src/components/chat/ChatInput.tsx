'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  isLoading = false, 
  disabled = false,
  placeholder = 'Type your message here...'
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !isLoading && !disabled) {
      onSend(trimmedInput);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                'min-h-[44px] max-h-[150px] resize-none pr-12 cursor-text',
                'transition-all duration-300 ease-out',
                'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50',
                'hover:border-primary/30'
              )}
              rows={1}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || disabled}
            size="icon"
            className={cn(
              'h-11 w-11 shrink-0 cursor-pointer',
              'bg-gradient-to-r from-[oklch(0.55_0.22_25)] to-[oklch(0.45_0.20_25)]',
              'hover:from-[oklch(0.50_0.22_25)] hover:to-[oklch(0.40_0.20_25)]',
              'transition-all duration-300 ease-out',
              'hover:scale-105 hover:shadow-lg',
              'disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
