'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bot, User, Globe, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  searchResults?: SearchResult[];
}

export interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

interface ChatMessageProps {
  message: Message;
  children?: ReactNode;
}

export function ChatMessage({ message, children }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-3 p-4 sm:px-6 transition-all duration-300',
      isUser ? 'bg-background' : 'bg-muted/30 hover:bg-muted/40'
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 transition-transform duration-300 hover:scale-110">
        <AvatarFallback className={cn(
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-gradient-to-br from-[oklch(0.55_0.22_25)] to-[oklch(0.40_0.20_25)] text-white'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {isUser ? 'You' : 'Huawei Support'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {message.isStreaming && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 animate-pulse bg-primary/10 text-primary dark:bg-primary/20">
              typing...
            </Badge>
          )}
        </div>

        {/* Search Results Badge */}
        {message.searchResults && message.searchResults.length > 0 && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs px-2 py-0.5 gap-1 transition-colors duration-300 hover:bg-primary/5 hover:border-primary/50">
              <Globe className="w-3 h-3" />
              {message.searchResults.length} sources found
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {message.content || children}
            {message.isStreaming && (
              <span className="inline-block w-[2px] h-4 ml-0.5 bg-primary animate-[blink_0.8s_ease-in-out_infinite] rounded-sm" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {message.searchResults && message.searchResults.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Sources:</div>
            <div className="space-y-1.5">
              {message.searchResults.slice(0, 3).map((result, index) => (
                <a
                  key={index}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-all duration-300 ease-out group hover:translate-x-1"
                >
                  <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="line-clamp-1 group-hover:underline">{result.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
