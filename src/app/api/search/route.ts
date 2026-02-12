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

export async function POST(request: NextRequest) {
  try {
    const { query, num = 5 } = await request.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const zai = await ZAI.create();

    // Perform web search using z-ai-web-dev-sdk
    const searchResult = await zai.functions.invoke('web_search', {
      query,
      num,
    });

    // Return structured search results
    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: searchResult as SearchResult[],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to perform search', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
