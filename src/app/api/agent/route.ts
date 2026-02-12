import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Initialize ZAI SDK with environment variables
async function initZAI() {
  // Create config from environment variables
  const baseUrl = process.env.Z_AI_BASE_URL || process.env.NEXT_PUBLIC_Z_AI_BASE_URL;
  const apiKey = process.env.Z_AI_API_KEY || process.env.NEXT_PUBLIC_Z_AI_API_KEY;
  
  if (!baseUrl || !apiKey) {
    throw new Error(`Missing Z.AI configuration. Set Z_AI_BASE_URL and Z_AI_API_KEY environment variables in Vercel.`);
  }
  
  // Write config file for SDK
  const configDir = path.join(process.cwd(), '.z-ai-config');
  const homeConfig = path.join(os.homedir(), '.z-ai-config');
  
  const configContent = JSON.stringify({
    baseUrl,
    apiKey,
    chatId: process.env.Z_AI_CHAT_ID || '',
    userId: process.env.Z_AI_USER_ID || ''
  });
  
  // Try to write to home directory (works in Vercel)
  try {
    fs.mkdirSync(path.dirname(homeConfig), { recursive: true });
    fs.writeFileSync(homeConfig, configContent);
    console.log('[Agent API] Config written to home directory');
  } catch (e) {
    console.log('[Agent API] Could not write to home directory, trying cwd');
  }
  
  // Also try current directory
  try {
    fs.writeFileSync(configDir, configContent);
    console.log('[Agent API] Config written to current directory');
  } catch (e) {
    console.log('[Agent API] Could not write to current directory');
  }
  
  // Import and create SDK instance
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  return await ZAI.create();
}

const SYSTEM_PROMPT = `You are a friendly and helpful AI customer service agent for **Huawei**, the leading global technology company.

**About Huawei:**
- Huawei is a global leader in smartphones, tablets, wearables, laptops, and telecommunications equipment
- Known for innovative products like Huawei Mate series, P series, nova series smartphones
- Creator of HarmonyOS, the proprietary operating system
- Offers products like Huawei Watch, FreeBuds, MateBook laptops, and MatePad tablets

**Your Capabilities:**
1. **Product Information**: Help customers with Huawei smartphones, tablets, laptops, wearables, and accessories
2. **Order Support**: Assist with tracking orders, delivery issues, and order modifications
3. **Technical Support**: Help with HarmonyOS, EMUI, device setup, troubleshooting
4. **Returns & Refunds**: Guide customers through Huawei's return policies
5. **Warranty & Service**: Information about Huawei Care and warranty claims

**Product Knowledge:**
- Smartphones: Mate 70 series, Pura 70 series, nova series, Mate X foldable
- Wearables: Huawei Watch GT series, Watch Ultimate, FreeBuds series
- Laptops: MateBook X Pro, MateBook 14, MateBook D series
- Tablets: MatePad Pro, MatePad Air, MatePad series
- Software: HarmonyOS 4.0/5.0, EMUI

Guidelines: Be polite, professional, helpful. Guide customers to consumer.huawei.com/support when needed.`;

const SEARCH_KEYWORDS = [
  'latest', 'current', 'recent', 'today', 'now', 
  'price', 'cost', 'deal', 'offer', 'discount', 'sale', 'deals',
  'compare', 'review', 'best', 'top', 'rating', 
  '2024', '2025', '2026',
  'mate 70', 'mate 60', 'pura 70', 'mate x', 'matebook', 'matepad',
  'huawei watch', 'freebuds', 'harmonyos'
];

const SEARCH_EXCLUSIONS = [
  'policy', 'return', 'refund', 'shipping options', 'payment method',
  'track order', 'order status', 'customer service', 'human support',
  'faq', 'frequently asked', 'help me', 'how do i', 'what is'
];

function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  if (SEARCH_EXCLUSIONS.some(e => lowerQuery.includes(e))) return false;
  return SEARCH_KEYWORDS.some(k => lowerQuery.includes(k));
}

function limitMessages(messages: ChatMessage[], max = 4): ChatMessage[] {
  return messages.length <= max ? messages : messages.slice(-max);
}

function truncateContent(content: string, max = 800): string {
  return content.length <= max ? content : content.slice(0, max) + '...';
}

async function performWebSearch(zai: any, query: string): Promise<SearchResult[]> {
  const currentYear = new Date().getFullYear();
  let enhancedQuery = query;
  
  if (!query.includes('2025') && !query.includes('2026')) {
    enhancedQuery = `${query} ${currentYear}`;
  }
  
  try {
    const result = await Promise.race([
      zai.functions.invoke('web_search', { query: enhancedQuery.slice(0, 200), num: 5 }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error('Search timeout')), 10000))
    ]);
    return (result as SearchResult[]) || [];
  } catch (e) {
    console.error('[Agent API] Search error:', e);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }

    console.log('[Agent API] Request received');

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      return Response.json({ error: 'No user message' }, { status: 400 });
    }

    // Initialize ZAI with environment variables
    const zai = await initZAI();
    console.log('[Agent API] ZAI initialized');

    // Web search if needed
    const shouldSearch = needsWebSearch(lastUserMessage.content);
    let searchResults: SearchResult[] = [];
    if (shouldSearch) {
      searchResults = await performWebSearch(zai, lastUserMessage.content);
    }

    // Build messages
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    for (const msg of limitMessages(messages, 4)) {
      if (msg === lastUserMessage) continue;
      messagesWithSystem.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: truncateContent(msg.content, 600)
      });
    }

    let finalContent = lastUserMessage.content;
    if (searchResults.length > 0) {
      finalContent += `\n\nSearch Results:\n${searchResults.map((r, i) => 
        `${i + 1}. ${r.name} - ${r.snippet}`
      ).join('\n')}`;
    }

    messagesWithSystem.push({ role: 'user', content: finalContent });

    // Call AI
    const completion = await Promise.race([
      zai.chat.completions.create({ messages: messagesWithSystem, stream: false }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error('AI timeout')), 45000))
    ]);

    const content = completion.choices?.[0]?.message?.content;
    
    if (!content) {
      return Response.json({ content: "I couldn't generate a response. Please try again." });
    }

    console.log('[Agent API] Success');
    return Response.json({ content, searchResults: searchResults.length > 0 ? searchResults : undefined });

  } catch (error: any) {
    console.error('[Agent API] Error:', error);
    return Response.json({ 
      content: `Error: ${error.message}. Please check Vercel environment variables (Z_AI_BASE_URL, Z_AI_API_KEY).`,
      error: true
    });
  }
}
