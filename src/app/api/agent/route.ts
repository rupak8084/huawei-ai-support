import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

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
6. **Real-time Information**: You have access to web search for current prices, new product launches, and updates

**Product Knowledge:**
- **Smartphones**: Mate 70 series, Pura 70 series, nova series, Mate X foldable series
- **Wearables**: Huawei Watch GT series, Watch Ultimate, Watch D, FreeBuds series
- **Laptops**: MateBook X Pro, MateBook 14, MateBook D series
- **Tablets**: MatePad Pro, MatePad Air, MatePad series
- **Software**: HarmonyOS 4.0/5.0, EMUI, Huawei Mobile Services (HMS)

**Guidelines:**
- Always be polite, professional, and embody Huawei's brand values
- Provide clear and helpful responses about Huawei products and services
- If you don't know something, be honest and offer to find more information
- When using search results, cite your sources
- Guide customers to Huawei Support or service centers when needed
- Keep responses concise but thorough
- When search results are provided, ALWAYS prioritize the most recent information (2025-2026)

**Huawei Support Channels:**
- Huawei Support Website: consumer.huawei.com/support
- Huawei Support App: Pre-installed on Huawei devices
- Service Centers: Available worldwide

**IMPORTANT**: When you receive search results, use the most current data available. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Always focus on the latest information (2025-2026).

Remember: You represent Huawei's commitment to "Building a fully connected, intelligent world" and customer satisfaction is your top priority!`;

// Keywords that specifically indicate a need for web search (current/real-time data only)
// These are words that clearly indicate user wants up-to-date information
// IMPORTANT: Keep this list SHORT and SPECIFIC to avoid triggering search for common queries
const SEARCH_KEYWORDS = [
  // Time-sensitive keywords
  'latest', 'current', 'recent', 'today', 'now', 
  // Pricing/deals keywords
  'price', 'cost', 'deal', 'offer', 'discount', 'sale', 'deals',
  // Comparison keywords
  'compare', 'review', 'best', 'top', 'rating', 
  // Year keywords for current data
  '2024', '2025', '2026',
  // Huawei specific products
  'mate 70', 'mate 60', 'pura 70', 'mate x', 'matebook', 'matepad',
  'huawei watch', 'freebuds', 'harmonyos', 'huawei'
];

// Words that should NOT trigger search even if combined with keywords
const SEARCH_EXCLUSIONS = [
  'policy', 'return', 'refund', 'shipping options', 'payment method',
  'track order', 'order status', 'customer service', 'human support',
  'faq', 'frequently asked', 'help me', 'how do i', 'what is'
];

function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // First check if query contains any exclusion words
  if (SEARCH_EXCLUSIONS.some(exclusion => lowerQuery.includes(exclusion))) {
    return false;
  }
  
  // Then check for search keywords
  return SEARCH_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

// Get current year for search queries
function getCurrentYearContext(): { currentYear: number; nextYear: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  return { currentYear, nextYear: currentYear + 1 };
}

// Limit messages to avoid context length issues
function limitMessages(messages: ChatMessage[], maxMessages: number = 4): ChatMessage[] {
  if (messages.length <= maxMessages) {
    return messages;
  }
  return messages.slice(-maxMessages);
}

// Truncate message content if too long
function truncateContent(content: string, maxLength: number = 800): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '...';
}

// Perform web search with enhanced query for current data
async function performWebSearch(zai: Awaited<ReturnType<typeof ZAI.create>>, query: string): Promise<SearchResult[]> {
  const { currentYear, nextYear } = getCurrentYearContext();
  
  // Enhance query with current year context for better results
  let enhancedQuery = query;
  
  // Add year context if not already present
  if (!query.includes('2025') && !query.includes('2026') && !query.includes('2024')) {
    enhancedQuery = `${query} ${currentYear} ${nextYear}`;
  }
  
  // Limit query length
  enhancedQuery = enhancedQuery.slice(0, 200);
  
  console.log('[Agent API] Enhanced search query:', enhancedQuery);
  
  try {
    // Perform search with 15 second timeout
    const searchPromise = zai.functions.invoke('web_search', {
      query: enhancedQuery,
      num: 8, // Get more results for better filtering
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), 15000);
    });

    const searchResult = await Promise.race([searchPromise, timeoutPromise]);
    const results = searchResult as SearchResult[];
    
    if (!results || results.length === 0) {
      console.log('[Agent API] No search results found');
      return [];
    }

    // Sort results by date if available (newest first)
    const sortedResults = results.sort((a, b) => {
      // Try to parse dates and sort
      try {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    });

    // Log the results with their dates
    console.log('[Agent API] Search results found:', sortedResults.length);
    sortedResults.forEach((r, i) => {
      console.log(`[Agent API] Result ${i + 1}: ${r.name} (Date: ${r.date || 'N/A'})`);
    });

    return sortedResults;
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
    console.log('[Agent API] Current Date:', new Date().toISOString());

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Agent API] User query:', lastUserMessage.content);

    // Initialize ZAI
    const zai = await ZAI.create();

    // Determine if we need web search
    const shouldSearch = needsWebSearch(lastUserMessage.content);
    console.log('[Agent API] Web search needed:', shouldSearch);

    // Perform web search if needed
    let searchResults: SearchResult[] = [];
    
    if (shouldSearch) {
      console.log('[Agent API] Fetching current web data...');
      searchResults = await performWebSearch(zai, lastUserMessage.content);
    }

    // Build messages array with clean context
    const limitedMessages = limitMessages(messages, 4);
    
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation messages (clean, no old search data)
    for (const msg of limitedMessages) {
      if (msg === lastUserMessage) continue;
      
      // Strip any previous search results
      let cleanContent = msg.content;
      if (cleanContent.includes('**Relevant Search Results:**')) {
        cleanContent = cleanContent.split('**Relevant Search Results:**')[0].trim();
      }
      
      messagesWithSystem.push({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: truncateContent(cleanContent, 600),
      });
    }

    // Build final user message with search context
    let finalUserContent = lastUserMessage.content;
    
    if (searchResults.length > 0) {
      const { currentYear, nextYear } = getCurrentYearContext();
      
      const searchContext = `

**CURRENT WEB SEARCH RESULTS (${currentYear}):**
${searchResults.map((r, i) => 
  `${i + 1}. ${r.name}
   Date: ${r.date || 'Recent'}
   Source: ${r.host_name}
   Summary: ${r.snippet}
   URL: ${r.url}`
).join('\n\n')}

**Instructions**: Use ONLY the above CURRENT search results to answer the question. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Focus on the most recent information from ${currentYear}-${nextYear}.`;
      
      finalUserContent = lastUserMessage.content + searchContext;
      console.log('[Agent API] Added current search results to prompt');
    }

    messagesWithSystem.push({
      role: 'user',
      content: finalUserContent,
    });

    console.log('[Agent API] Sending to AI with', messagesWithSystem.length, 'messages');

    // Create chat completion with timeout
    const completionPromise = zai.chat.completions.create({
      messages: messagesWithSystem,
      stream: false,
    });

    const apiTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI API timeout')), 30000);
    });

    const completion = await Promise.race([completionPromise, apiTimeoutPromise]);

    const content = completion.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ 
          content: "I apologize, but I couldn't generate a response. Please try again.",
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Agent API] Response generated successfully');
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
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        } 
      }
    );
  } catch (error) {
    console.error('[Agent API] Error:', error);
    
    // Determine if error is retryable
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');
    
    // Return a user-friendly error response
    return new Response(
      JSON.stringify({ 
        content: isTimeout 
          ? "I'm sorry, the request took too long to process. Please try again with a shorter message."
          : "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        error: 'Request failed', 
        details: errorMessage,
        retryable: true
      }),
      { 
        status: 200, // Return 200 with error message so UI can display it gracefully
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        } 
      }
    );
  }
}
