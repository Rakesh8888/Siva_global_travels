const AI_MODEL = "gpt-6-luna";

const SYSTEM_PROMPT = (language) => `You are LUCKY, the Siva Global Travels customer enquiry assistant. Help users with Tour & Travel, Visa Application Assistance, Overseas Job Assistance, Skilled Jobs, Unskilled/Blue-Collar Jobs, and Cruise Jobs. Destinations include India, Kuwait, Germany, Italy, Luxembourg, Schengen, Israel and Russia.

CONVERSATIONAL STYLE:
- Behave like a friendly, patient customer assistant, not a rigid form or robot.
- Understand informal language, typos, abbreviations, transliterated Indian languages, mixed-language messages and voice transcription errors.
- If the meaning is clear, answer naturally. If unclear, ask one simple clarification.
- Keep answers concise and practical.
- Never pretend to be a human employee; you are LUCKY AI.
- Reply in the selected language: ${language}.
- Never guarantee a job, salary, visa approval, employer selection, or immigration result.
- Never invent vacancies, employers, salaries or fees.
- For applications or specific current vacancies, collect name, destination, job type, job role and experience, then direct the user to WhatsApp at +91 91826 41172.`;

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status, request) {
  return Response.json(data, {
    status,
    headers: corsHeaders(request)
  });
}

async function handleChat(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, request);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: "AI service is not configured yet." }, 503, request);
  }

  try {
    const body = await request.json();
    const message = body?.message;
    const language = body?.language || "English";
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== "string") {
      return jsonResponse({ error: "Message is required" }, 400, request);
    }

    const input = [
      { role: "system", content: SYSTEM_PROMPT(language) },
      ...history
        .filter(x => x && (x.role === "user" || x.role === "assistant"))
        .slice(-8),
      { role: "user", content: message }
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: AI_MODEL,
          input,
          max_output_tokens: 600
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("LUCKY AI provider error:", response.status, data);
      const providerError = data?.error || {};
      const safeMessage =
        typeof providerError?.message === "string"
          ? providerError.message.slice(0, 300)
          : "OpenAI rejected the request.";
      return jsonResponse(
        {
          error: "OpenAI request failed.",
          providerStatus: response.status,
          providerType: providerError?.type || null,
          providerCode: providerError?.code || null,
          providerMessage: safeMessage
        },
        response.status >= 500 ? 502 : response.status,
        request
      );
    }

    const reply =
      typeof data.output_text === "string"
        ? data.output_text.trim()
        : "";

    return jsonResponse(
      { reply: reply || "I could not generate a reply. Please try again." },
      200,
      request
    );
  } catch (error) {
    console.error("LUCKY AI error:", error);
    if (error?.name === "AbortError") {
      return jsonResponse({ error: "OpenAI request timed out." }, 504, request);
    }
    return jsonResponse({ error: "Server error", detail: String(error?.message || "Unknown error").slice(0, 200) }, 500, request);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });

    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true, aiConfigured: Boolean(env.OPENAI_API_KEY) }, 200, request);
    }

    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
