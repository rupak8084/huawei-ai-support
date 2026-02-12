import { NextRequest } from 'next/server';
import OpenAI from 'openai';

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

// Initialize OpenAI client
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it in Vercel Dashboard > Settings > Environment Variables');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
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
- If you don't know something, be honest and offer to help find information
- Guide customers to Huawei Support at consumer.huawei.com/support when needed
- Keep responses concise but thorough
- Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Remember: You represent Huawei's commitment to "Building a fully connected, intelligent world" and customer satisfaction is your top priority!`;

// Keywords that might need current information (we'll note this in response)
const CURRENT_INFO_KEYWORDS = [
  'latest', 'current', 'recent', 'today', 'now', 
  'price', 'cost', 'deal', 'offer', 'discount', 'sale',
  '2024', '2025', '2026',
];

function mentionsCurrentInfo(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return CURRENT_INFO_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

function limitMessages(messages: ChatMessage[], max = 6): ChatMessage[] {
  return messages.length <= max ? messages : messages.slice(-max);
}

function truncateContent(content: string, max = 1000): string {
  return content.length <= max ? content : content.slice(0, max) + '...';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log('[Agent API] ========== NEW REQUEST ==========');
    console.log('[Agent API] Time:', new Date().toISOString());

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return Response.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    console.log('[Agent API] User query:', lastUserMessage.content.slice(0, 100));

    // Initialize OpenAI
    const openai = getOpenAI();
    console.log('[Agent API] OpenAI client initialized');

    // Check if query mentions current info
    const needsCurrentInfo = mentionsCurrentInfo(lastUserMessage.content);
    
    // Build messages array
    const limitedMessages = limitMessages(messages, 6);
    const messagesForAPI: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    for (const msg of limitedMessages) {
      if (msg === lastUserMessage) continue;
      
      let cleanContent = msg.content;
      // Clean up any previous search markers
      if (cleanContent.includes('**CURRENT WEB SEARCH')) {
        cleanContent = cleanContent.split('**CURRENT WEB SEARCH')[0].trim();
      }
      
      messagesForAPI.push({
        role: msg.role as 'user' | 'assistant',
        content: truncateContent(cleanContent, 800)
      });
    }

    // Add user message with note if asking about current info
    let userContent = lastUserMessage.content;
    if (needsCurrentInfo) {
      userContent += `\n\n[Note: This query may require the most current information. Please provide the best available knowledge and note if information might have changed.]`;
    }
    
    messagesForAPI.push({
      role: 'user',
      content: userContent
    });

    console.log('[Agent API] Sending to OpenAI with', messagesForAPI.length, 'messages');

    // Call OpenAI API with timeout
    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: messagesForAPI,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API timeout after 30s')), 30000);
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const content = completion.choices?.[0]?.message?.content;
    
    if (!content) {
      return Response.json({
        content: "I apologize, but I couldn't generate a response. Please try again."
      });
    }

    console.log('[Agent API] Response generated, length:', content.length);
    console.log('[Agent API] ========== COMPLETE ==========');

    return Response.json({
      content,
      // No search results when using OpenAI directly
    });

  } catch (error: any) {
    console.error('[Agent API] Error:', error);
    console.error('[Agent API] Stack:', error?.stack);
    
    const errorMessage = error?.message || 'Unknown error';
    
    // Check for specific error types
    let userMessage = "I'm experiencing some technical difficulties right now. Please try again in a moment.";
    
    if (errorMessage.includes('OPENAI_API_KEY')) {
      userMessage = "Configuration error: The OpenAI API key is not set. Please contact the administrator.";
    } else if (errorMessage.includes('timeout')) {
      userMessage = "The request took too long. Please try with a shorter message.";
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      userMessage = "We're experiencing high demand. Please try again in a few moments.";
    } else if (errorMessage.includes('insufficient_quota') || errorMessage.includes('billing')) {
      userMessage = "Service temporarily unavailable. Please contact support.";
    }
    
    return Response.json({
      content: userMessage,
      error: errorMessage,
      retryable: true
    });
  }
}
