'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  PanelLeftClose, 
  MessageSquare,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  Star,
  Bookmark,
  ExternalLink,
  User,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationHistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversationHistory: ConversationHistoryItem[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

const QUICK_LINKS = [
  { icon: Phone, label: 'Huawei Hotline', href: 'tel:1-800-HUAWEI' },
  { icon: Mail, label: 'Email Support', href: 'mailto:support@huawei.com' },
  { icon: HelpCircle, label: 'Help Center', href: 'https://consumer.huawei.com/support' },
];

const MENU_ITEMS = [
  { icon: MessageSquare, label: 'All Conversations', badge: null },
  { icon: Star, label: 'Favorites', badge: '3' },
  { icon: Bookmark, label: 'Saved Replies', badge: null },
  { icon: Clock, label: 'Recent', badge: null },
];

export function Sidebar({ 
  isOpen, 
  onToggle, 
  conversationHistory, 
  onSelectConversation,
  onNewChat 
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative inset-y-0 left-0 z-50',
        'w-72 bg-card border-r border-border',
        'transform transition-all duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.55_0.22_25)] to-[oklch(0.40_0.20_25)] flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">Huawei Support</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 cursor-pointer transition-all duration-300 ease-out hover:bg-accent hover:scale-110"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button 
              className="w-full justify-start gap-2 cursor-pointer bg-gradient-to-r from-[oklch(0.55_0.22_25)] to-[oklch(0.45_0.20_25)] hover:from-[oklch(0.50_0.22_25)] hover:to-[oklch(0.40_0.20_25)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg"
              onClick={onNewChat}
            >
              <MessageSquare className="w-4 h-4" />
              New Conversation
            </Button>
          </div>

          {/* Menu Items */}
          <div className="px-3 space-y-1">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-between items-center cursor-pointer transition-all duration-300 ease-out hover:bg-accent hover:translate-x-1"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Conversation History */}
          <div className="flex-1 overflow-hidden">
            <div className="px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Conversations
              </span>
            </div>
            <ScrollArea className="h-full px-2">
              {conversationHistory.length > 0 ? (
                <div className="space-y-1">
                  {conversationHistory.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className="w-full text-left p-2 rounded-lg hover:bg-accent cursor-pointer group transition-all duration-300 ease-out hover:translate-x-1"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 transition-colors duration-300 group-hover:text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors duration-300">
                            {conv.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.preview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(conv.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new chat to begin</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          {/* Quick Links */}
          <div className="p-3 space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Quick Links
            </span>
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground cursor-pointer rounded-lg hover:bg-accent hover:text-foreground transition-all duration-300 ease-out hover:translate-x-1 group"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            ))}
          </div>

          {/* Settings & User */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-all duration-300 ease-out hover:translate-x-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Guest User</p>
                <p className="text-xs text-muted-foreground">Huawei Member</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground transition-transform duration-300 hover:rotate-90" />
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 bg-card border border-border shadow-sm cursor-pointer transition-all duration-300 ease-out hover:bg-accent hover:scale-110 hover:shadow-lg"
        >
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
