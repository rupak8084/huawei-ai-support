'use client';

import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  HelpCircle, 
  MessageCircle, 
  RefreshCw,
  CreditCard,
  Truck,
  Wrench,
  Shield
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

// These prompts are designed for Huawei customer support
// They use simple language without time-sensitive or pricing keywords
const QUICK_ACTIONS = [
  {
    icon: Smartphone,
    label: 'Products',
    prompt: 'Tell me about Huawei smartphones and devices available',
  },
  {
    icon: Wrench,
    label: 'Tech Support',
    prompt: 'I need help with my Huawei device',
  },
  {
    icon: Truck,
    label: 'Track Order',
    prompt: 'I need help tracking my Huawei Store order',
  },
  {
    icon: RefreshCw,
    label: 'Returns',
    prompt: 'Tell me about Huawei return policy',
  },
  {
    icon: Shield,
    label: 'Warranty',
    prompt: 'Tell me about Huawei warranty and Huawei Care',
  },
  {
    icon: CreditCard,
    label: 'Payment',
    prompt: 'What payment methods does Huawei Store accept?',
  },
  {
    icon: HelpCircle,
    label: 'FAQ',
    prompt: 'Show me frequently asked questions about Huawei products',
  },
  {
    icon: MessageCircle,
    label: 'Human Support',
    prompt: 'I want to contact Huawei customer service',
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="px-4 py-3 border-t border-border bg-gradient-to-r from-muted to-muted/50">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => onAction(action.prompt)}
              disabled={disabled}
              className="h-8 text-xs gap-1.5 bg-background cursor-pointer transition-all duration-300 ease-out hover:bg-primary hover:text-white hover:border-primary hover:scale-105 hover:shadow-md dark:hover:bg-primary"
            >
              <action.icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
