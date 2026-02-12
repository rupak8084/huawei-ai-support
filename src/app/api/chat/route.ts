import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are a professional AI customer service representative for an e-commerce platform. Your role is to assist customers with:

1. **Product Inquiries**: Help customers find products, check availability, compare options, and provide detailed product information.

2. **Order Status Checks**: Assist with tracking orders, checking delivery status, and resolving delivery issues.

3. **FAQ Responses**: Answer common questions about shipping, returns, payments, account management, and store policies.

4. **Issue Resolution**: Handle complaints, process refund requests, resolve payment issues, and address product problems.

5. **Escalation Guidance**: Recognize when issues require human intervention and guide customers on how to reach human support.

**Guidelines**:
- Always be polite, professional, and empathetic
- Use clear, concise language
- Ask clarifying questions when needed
- Provide accurate information
- If you cannot resolve an issue, advise the customer to contact human support
- Never make up order numbers or personal information
- Maintain a helpful and positive tone throughout the conversation

Remember: Customer satisfaction is your top priority. Treat every customer with respect and aim to resolve their issues efficiently.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Chat API] Received request with', messages.length, 'messages');

    const zai = await ZAI.create();

    // Create chat completion
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ],
      stream: false,
    });

    const content = completion.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';
    console.log('[Chat API] Response length:', content.length);

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
