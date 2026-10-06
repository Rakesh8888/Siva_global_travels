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

async function handleChat(request, env) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!env.OPENAI_API_KEY) {
    return Response.json({ error: "AI service is not configured yet." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const message = body?.message;
    const language = body?.language || "English";
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
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
          model: "gpt-6-luna",
          input
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("LUCKY AI provider error:", response.status, data);
      return Response.json(
        { error: "AI provider request failed." },
        { status: response.status >= 500 ? 502 : 500 }
      );
    }

    const reply =
      typeof data.output_text === "string"
        ? data.output_text.trim()
        : "";

    return Response.json({
      reply: reply || "I could not generate a reply. Please try again."
    });
  } catch (error) {
    console.error("LUCKY AI error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
