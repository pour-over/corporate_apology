// netlify/functions/apology.mjs
// Server-side proxy that STREAMS the Anthropic response.
// Streaming keeps the connection alive and avoids the 10s synchronous
// function timeout (504 Gateway Timeout) on long generations.

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method Not Allowed' } }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not set in Netlify env vars' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: { message: 'Invalid request JSON' } }), {
    status: 400, headers: { 'Content-Type': 'application/json' }
  }); }

  // Request a streaming response from Anthropic
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 2400,
      system: body.system,
      messages: body.messages,
      stream: true
    })
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    return new Response(JSON.stringify({ error: { message: 'Anthropic API error (' + upstream.status + '): ' + errText.slice(0, 300) } }), {
      status: upstream.status, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Pipe the SSE stream straight back to the browser
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};

export const config = {
  path: "/api/apology"
};
