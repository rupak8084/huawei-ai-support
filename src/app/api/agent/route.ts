import { NextRequest } from 'next/server';

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

const SYSTEM_PROMPT = `You are a friendly and helpful AI customer service agent for **Huawei**, the leading global technology company. You represent Huawei's commitment to innovation and customer satisfaction.

**About Huawei:**
- Huawei is a global leader in smartphones, tablets, wearables, laptops, and telecommunications equipment
- Known for innovative products like Huawei Mate series, P series, nova series smartphones
- Creator of HarmonyOS, the proprietary operating system
- Offers products like Huawei Watch, FreeBuds, MateBook laptops, and MatePad tablets

**Your Capabilities:**
1. **Product Information**: Help customers with Huawei smartphones, tablets, laptops, wearables, and accessories
2. **Order Support**: Assist with tracking orders, delivery issues, and order modifications from Huawei Store
3. **Technical Support**: Help with HarmonyOS, EMUI, device setup, troubleshooting, and software updates
4. **Returns & Refunds**: Guide customers through Huawei's return policies and refund processes
5. **Warranty & Service**: Information about Huawei Care, warranty claims, and service center locations

**Product Knowledge:**
- **Smartphones**: Mate 70 series, Pura 70 series, nova series, Mate X foldable series
- **Wearables**: Huawei Watch GT series, Watch Ultimate, Watch D, FreeBuds series
- **Laptops**: MateBook X Pro, MateBook 14, MateBook D series
- **Tablets**: MatePad Pro, MatePad Air, MatePad series
- **Software**: HarmonyOS 4.0/5.0, EMUI, Huawei Mobile Services (HMS)

**Guidelines:**
- Always be polite, professional, and embody Huawei's brand values
- Provide clear and helpful responses about Huawei products and services
- Keep responses concise but thorough
- Guide customers to Huawei Support at consumer.huawei.com/support when needed

Remember: You represent Huawei's commitment to "Building a fully connected, intelligent world" and customer satisfaction is your top priority!`;

// Keywords that trigger web search
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
  if (SEARCH_EXCLUSIONS.some(exclusion => lowerQuery.includes(exclusion))) {
    return false;
  }
  return SEARCH_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

function limitMessages(messages: ChatMessage[], maxMessages: number = 4): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}

function truncateContent(content: string, maxLength: number = 800): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}

// Dynamic import for ZAI SDK
async function getZAI() {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    return await ZAI.create();
  } catch (error) {
    console.error('[Agent API] Failed to load ZAI SDK:', error);
    throw new Error('AI SDK initialization failed');
  }
}

// Perform web search
async function performWebSearch(zai: any, query: string): Promise<SearchResult[]> {
  const currentYear = new Date().getFullYear();
  let enhancedQuery = query;
  
  if (!query.includes('2025') && !query.includes('2026') && !query.includes('2024')) {
    enhancedQuery = `${query} ${currentYear} ${currentYear + 1}`;
  }
  
  enhancedQuery = enhancedQuery.slice(0, 200);
  console.log('[Agent API] Search query:', enhancedQuery);
  
  try {
    const searchPromise = zai.functions.invoke('web_search', {
      query: enhancedQuery,
      num: 6,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), 12000);
    });

    const searchResult = await Promise.race([searchPromise, timeoutPromise]);
    const results = searchResult as SearchResult[];
    
    console.log('[Agent API] Search results:', results?.length || 0);
    return results || [];
  } catch (searchError) {
    console.error('[Agent API] Web search failed:', searchError);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Agent API] ========== NEW REQUEST ==========');
    console.log('[Agent API] Time:', new Date().toISOString());

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Agent API] Query:', lastUserMessage.content.slice(0, 100));

    // Initialize ZAI SDK
    const zai = await getZAI();
    console.log('[Agent API] ZAI SDK initialized');

    // Check if web search needed
    const shouldSearch = needsWebSearch(lastUserMessage.content);
    console.log('[Agent API] Web search:', shouldSearch);

    let searchResults: SearchResult[] = [];
    
    if (shouldSearch) {
      searchResults = await performWebSearch(zai, lastUserMessage.content);
    }

    // Build messages
    const limitedMessages = limitMessages(messages, 4);
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    for (const msg of limitedMessages) {
      if (msg === lastUserMessage) continue;
      let cleanContent = msg.content;
      if (cleanContent.includes('**Relevant Search Results:**')) {
        cleanContent = cleanContent.split('**Relevant Search Results:**')[0].trim();
      }
      messagesWithSystem.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: truncateContent(cleanContent, 600),
      });
    }

    let finalUserContent = lastUserMessage.content;
    
    if (searchResults.length > 0) {
      const currentYear = new Date().getFullYear();
      const searchContext = `

**CURRENT WEB SEARCH RESULTS (${currentYear}):**
${searchResults.map((r, i) => 
  `${i + 1}. ${r.name}
   Date: ${r.date || 'Recent'}
   Source: ${r.host_name}
   Summary: ${r.snippet}
   URL: ${r.url}`
).join('\n\n')}

**Instructions**: Use ONLY the above CURRENT search results to answer the question. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`;
      
      finalUserContent = lastUserMessage.content + searchContext;
      console.log('[Agent API] Added search context');
    }

    messagesWithSystem.push({
      role: 'user',
      content: finalUserContent,
    });

    console.log('[Agent API] Sending to AI, messages:', messagesWithSystem.length);

    // Create chat completion with timeout
    const completionPromise = zai.chat.completions.create({
      messages: messagesWithSystem,
      stream: false,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI API timeout after 45s')), 45000);
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const content = completion.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ 
          content: "I apologize, but I couldn't generate a response. Please try again.",
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Agent API] Response generated, length:', content.length);
    console.log('[Agent API] ========== COMPLETE ==========');

    return new Response(
      JSON.stringify({ 
        content,
        searchResults: searchResults.length > 0 ? searchResults : undefined
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        } 
      }
    );
  } catch (error: any) {
    console.error('[Agent API] Error:', error);
    console.error('[Agent API] Error stack:', error?.stack);
    
    const errorMessage = error?.message || 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    
    return new Response(
      JSON.stringify({ 
        content: isTimeout 
          ? "I'm sorry, the request took too long. Please try again with a shorter message."
          : `I'm experiencing some technical difficulties. Error: ${errorMessage}. Please try again.`,
        error: 'Request failed', 
        details: errorMessage,
        retryable: true
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        } 
      }
    );
  }
}
