'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/chat/Header';
import { ChatMessage, Message, SearchResult } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Sidebar } from '@/components/chat/Sidebar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Sparkles, Trash2, PanelLeft, Smartphone } from 'lucide-react';

interface ConversationHistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

// Welcome message component for Huawei
function WelcomeMessage({ onQuickStart }: { onQuickStart: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      {/* Huawei Logo Style */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.22_25)] to-[oklch(0.40_0.20_25)] shadow-xl mb-5">
        <Smartphone className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Huawei Support</h2>
      <p className="text-sm text-primary font-medium mb-3">AI Customer Service</p>
      <p className="text-muted-foreground max-w-md mb-6">
        Welcome to Huawei Support! I'm your AI assistant, ready to help you with Huawei smartphones, 
        tablets, wearables, laptops, and more. How can I assist you today?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {[
          { icon: '📱', text: 'Huawei Products', prompt: 'Tell me about the latest Huawei smartphones and devices' },
          { icon: '🔧', text: 'Technical Support', prompt: 'I need help with my Huawei device' },
          { icon: '📦', text: 'Track Order', prompt: 'I need help tracking my Huawei Store order' },
          { icon: '🔄', text: 'Returns & Refunds', prompt: 'Tell me about Huawei return and refund policy' },
        ].map((item) => (
          <Button
            key={item.text}
            variant="outline"
            className="h-auto py-3 px-4 justify-start gap-3 text-left cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md hover:border-primary/50 hover:bg-primary/5"
            onClick={() => onQuickStart(item.prompt)}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Custom hook for typing animation
function useTypingAnimation() {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<{
    text: string;
    index: number;
    intervalId: NodeJS.Timeout | null;
  }>({ text: '', index: 0, intervalId: null });

  const startTyping = useCallback((text: string, onComplete: (finalText: string) => void) => {
    // Clear any existing animation
    if (animationRef.current.intervalId) {
      clearInterval(animationRef.current.intervalId);
    }

    animationRef.current = { text, index: 0, intervalId: null };
    setDisplayedText('');
    setIsAnimating(true);

    animationRef.current.intervalId = setInterval(() => {
      const { text: currentText, index } = animationRef.current;
      
      if (index < currentText.length) {
        // Vary the number of characters for more natural feel
        const charsToAdd = Math.random() > 0.7 ? 1 : 2;
        const newIndex = Math.min(index + charsToAdd, currentText.length);
        animationRef.current.index = newIndex;
        setDisplayedText(currentText.slice(0, newIndex));
      } else {
        if (animationRef.current.intervalId) {
          clearInterval(animationRef.current.intervalId);
          animationRef.current.intervalId = null;
        }
        setIsAnimating(false);
        onComplete(currentText);
      }
    }, 20); // Smoother with 20ms interval
  }, []);

  const stopTyping = useCallback(() => {
    if (animationRef.current.intervalId) {
      clearInterval(animationRef.current.intervalId);
      animationRef.current.intervalId = null;
    }
    setIsAnimating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current.intervalId) {
        clearInterval(animationRef.current.intervalId);
      }
    };
  }, []);

  return { displayedText, isAnimating, startTyping, stopTyping };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [typingSearchResults, setTypingSearchResults] = useState<SearchResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { displayedText, isAnimating, startTyping, stopTyping } = useTypingAnimation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, displayedText]);

  // Generate unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update conversation history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const lastMessage = messages[messages.length - 1];
      
      if (firstUserMessage && lastMessage.role === 'assistant') {
        const conversationItem: ConversationHistoryItem = {
          id: generateId(),
          title: firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : ''),
          timestamp: new Date(),
          preview: lastMessage.content.slice(0, 80) + (lastMessage.content.length > 80 ? '...' : ''),
        };
        
        setConversationHistory(prev => {
          const newHistory = [conversationItem, ...prev.filter(h => 
            h.title !== conversationItem.title
          )].slice(0, 10);
          return newHistory;
        });
      }
    }
  }, [messages]);

  // Send message to the agent API
  const sendMessage = useCallback(async (content: string, retryCount = 0) => {
    if (!content.trim() || isLoading || isAnimating) return;

    // Add user message (only on first attempt, not retry)
    if (retryCount === 0) {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }
    
    setIsLoading(true);

    try {
      // Only send recent messages for context (last 4 messages max)
      // This prevents stale search results from affecting new queries
      const recentMessages = messages.slice(-4).map(m => ({
        role: m.role,
        // Strip any search result content from previous messages
        content: m.content.split('**Relevant Search Results:**')[0].trim().slice(0, 500),
      }));

      const apiMessages = [
        ...recentMessages,
        { role: 'user' as const, content: content.trim() }
      ];

      console.log('[Chat] Sending fresh request with', apiMessages.length, 'messages');
      console.log('[Chat] User query:', content.trim().slice(0, 100));

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // If retryable and haven't retried too many times, retry
        if (data.retryable && retryCount < 2) {
          console.log('[Chat] Retrying request, attempt', retryCount + 1);
          setIsLoading(false);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return sendMessage(content, retryCount + 1);
        }
        throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('[Chat] Received response, length:', data.content?.length || 0);
      
      // Start typing animation
      setIsLoading(false);
      setTypingSearchResults(data.searchResults || []);
      setIsConnected(true);
      
      startTyping(data.content || 'I apologize, but I could not generate a response. Please try again.', (finalText) => {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: finalText,
          timestamp: new Date(),
          searchResults: data.searchResults?.length > 0 ? data.searchResults : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setTypingSearchResults([]);
      });

    } catch (error) {
      console.error('[Chat] Error:', error);
      setIsLoading(false);
      setIsConnected(true); // Keep connected, just a temporary error
      
      // Add a friendly error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: "I'm having a bit of trouble right now. Could you please try sending your message again? If the problem continues, feel free to start a new conversation.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [messages, isLoading, isAnimating, startTyping]);

  // Clear chat
  const clearChat = useCallback(() => {
    stopTyping();
    setMessages([]);
    setIsConnected(true);
    setTypingSearchResults([]);
  }, [stopTyping]);

  // Handle selecting a conversation from history
  const handleSelectConversation = useCallback((id: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    console.log('Selected conversation:', id);
  }, []);

  // Handle quick action
  const handleQuickAction = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          conversationHistory={conversationHistory}
          onSelectConversation={handleSelectConversation}
          onNewChat={clearChat}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar toggle - Huawei branded */}
          <header className="flex items-center gap-2 bg-gradient-to-r from-[oklch(0.55_0.22_25)] to-[oklch(0.45_0.20_25)] px-4 py-3 sm:px-6 shadow-lg">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 cursor-pointer transition-all duration-300 ease-out hover:bg-white/20 hover:text-white text-white/90"
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <Header isConnected={isConnected} onClearChat={clearChat} />
            </div>
          </header>

          {/* Main Chat Area */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full" ref={scrollRef}>
              {messages.length === 0 && !isLoading && !isAnimating ? (
                <div className="h-full min-h-[calc(100vh-200px)] flex items-center justify-center">
                  <WelcomeMessage onQuickStart={handleQuickAction} />
                </div>
              ) : (
                <div className="py-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  
                  {/* Typing animation message */}
                  {isAnimating && displayedText && (
                    <ChatMessage 
                      message={{
                        id: 'typing',
                        role: 'assistant',
                        content: displayedText,
                        timestamp: new Date(),
                        isStreaming: true,
                        searchResults: typingSearchResults.length > 0 ? typingSearchResults : undefined,
                      }} 
                    />
                  )}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-3 p-4 sm:px-6 bg-muted/30">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_25)] to-[oklch(0.40_0.20_25)]">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pt-2">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <QuickActions 
            onAction={handleQuickAction} 
            disabled={isLoading || isAnimating} 
          />

          {/* Chat Input */}
          <ChatInput 
            onSend={sendMessage} 
            isLoading={isLoading || isAnimating}
            disabled={!isConnected}
            placeholder="Ask me about Huawei products, orders, technical support..."
          />

          {/* Floating Clear Button */}
          {messages.length > 0 && (
            <div className="absolute bottom-32 right-4 sm:right-8 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="shadow-lg bg-card/80 backdrop-blur-sm gap-1.5 cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:bg-card"
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </Button>
            </div>
          )}
        </div>

        {/* Huawei AI Powered Badge */}
        <div className="fixed bottom-4 right-4 z-10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border transition-all duration-300 hover:bg-card">
            <Sparkles className="w-3 h-3 text-primary" />
            Huawei AI Support
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
