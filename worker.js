const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = (language) => `You are LUCKY, the Siva Global Travels customer enquiry assistant. Help users with Tour & Travel, Visa Application Assistance, Overseas Job Assistance, Skilled Jobs, Unskilled/Blue-Collar Jobs, and Cruise Jobs. Destinations include India, Kuwait, Germany, Italy, Luxembourg, Schengen, Israel and Russia.

CONVERSATIONAL STYLE:
- Behave like a friendly, patient customer assistant, not a rigid form or robot.
- Understand informal language, typos, abbreviations, transliterated Indian languages, mixed-language messages and voice transcription errors.
- If the meaning is clear, answer naturally. If unclear, ask one simple clarification.
- Keep answers concise and practical.
- Never pretend to be a human employee; you are LUCKY AI.
- Reply in the selected language: ${language}.
- Never guarantee a job, salary, visa approval, employer selection, or immigration result.
- Never invent vacancies, employers, salaries, flight prices or fees.
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

  if (!env.GEMINI_API_KEY) {
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

    const contents = [
      ...history
        .filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
        .slice(-8)
        .map(x => ({ role: x.role === "assistant" ? "model" : "user", parts: [{ text: x.content }] })),
      { role: "user", parts: [{ text: message }] }
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT(language) }] },
            contents,
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("LUCKY AI Gemini provider error:", response.status, data);
      const providerError = data?.error || {};
      return jsonResponse(
        {
          error: "Gemini request failed.",
          providerStatus: response.status,
          providerMessage: typeof providerError.message === "string"
            ? providerError.message.slice(0, 250)
            : "Gemini rejected the request."
        },
        response.status >= 500 ? 502 : response.status,
        request
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map(part => typeof part.text === "string" ? part.text : "")
      .join("")
      .trim() || "";

    return jsonResponse(
      { reply: reply || "I could not generate a reply. Please try again." },
      200,
      request
    );
  } catch (error) {
    console.error("LUCKY AI error:", error);
    if (error?.name === "AbortError") {
      return jsonResponse({ error: "Gemini request timed out." }, 504, request);
    }
    return jsonResponse({ error: "Server error", detail: String(error?.message || "Unknown error").slice(0, 200) }, 500, request);
  }
}


async function handleDuffelFlightSearch(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, request);
  if (!env.DUFFEL_ACCESS_TOKEN) {
    return jsonResponse({ error: "Flight search is not configured yet. Add the DUFFEL_ACCESS_TOKEN secret in Cloudflare." }, 503, request);
  }
  try {
    const body = await request.json();
    const origin = String(body?.origin || "").trim().toUpperCase();
    const destination = String(body?.destination || "").trim().toUpperCase();
    const departureDate = String(body?.departureDate || "").trim();
    const returnDate = body?.returnDate ? String(body.returnDate).trim() : "";
    const adults = Number(body?.adults || 1);
    const cabinMap = { "economy": "economy", "premium economy": "premium_economy", "business": "business", "first": "first" };
    const cabinClass = cabinMap[String(body?.cabinClass || "economy").trim().toLowerCase()];
    const validDate = value => /^\\d{4}-\\d{2}-\\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value + "T00:00:00Z")) &&
      new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination) {
      return jsonResponse({ error: "Please select two different valid airport codes." }, 400, request);
    }
    if (!validDate(departureDate) || (returnDate && !validDate(returnDate))) {
      return jsonResponse({ error: "Please provide valid travel dates in YYYY-MM-DD format." }, 400, request);
    }
    const today = new Date().toISOString().slice(0, 10);
    const maxDate = new Date();
    maxDate.setUTCMonth(maxDate.getUTCMonth() + 12);
    if (departureDate < today || departureDate > maxDate.toISOString().slice(0, 10) ||
        (returnDate && (returnDate < departureDate || returnDate > maxDate.toISOString().slice(0, 10)))) {
      return jsonResponse({ error: "Choose travel dates from today up to 12 months ahead; return date must be on or after departure." }, 400, request);
    }
    if (!Number.isInteger(adults) || adults < 1 || adults > 9 || !cabinClass) {
      return jsonResponse({ error: "Choose 1–9 adults and a valid cabin class." }, 400, request);
    }
    const slices = [{ origin, destination, departure_date: departureDate }];
    if (returnDate) slices.push({ origin: destination, destination: origin, departure_date: returnDate });
    const payload = { data: { slices, passengers: Array.from({ length: adults }, () => ({ type: "adult" })), cabin_class: cabinClass } };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch("https://api.duffel.com/air/offer_requests", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.DUFFEL_ACCESS_TOKEN,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Duffel-Version": "v2"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } finally { clearTimeout(timer); }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Duffel flight search failed:", response.status);
      return jsonResponse({
        error: response.status === 401 ? "Duffel rejected the API token. Check the test token in Cloudflare." :
          response.status === 429 ? "Flight search is temporarily busy. Please try again shortly." :
          "Flight search provider could not complete the request. Please try again."
      }, response.status === 429 ? 429 : 502, request);
    }
    const rawOffers = result?.data?.offers || result?.data?.offer_request?.offers || [];
    const offers = rawOffers.slice(0, 10).map(offer => ({
      id: offer.id,
      totalAmount: offer.total_amount || "",
      totalCurrency: offer.total_currency || "",
      expiresAt: offer.expires_at || "",
      owner: offer.owner?.name || "Airline",
      slices: (offer.slices || []).map(slice => ({
        origin: slice.origin?.iata_code || slice.segments?.[0]?.origin?.iata_code || "",
        destination: slice.destination?.iata_code || slice.segments?.[slice.segments.length - 1]?.destination?.iata_code || "",
        segments: (slice.segments || []).map(segment => ({
          airline: segment.operating_carrier?.name || segment.marketing_carrier?.name || "Airline",
          flightNumber: [segment.marketing_carrier?.iata_code, segment.marketing_carrier_flight_number].filter(Boolean).join(" "),
          departingAt: segment.departing_at || "",
          arrivingAt: segment.arriving_at || ""
        }))
      }))
    }));
    return jsonResponse({
      offers, count: offers.length, liveMode: Boolean(result?.data?.live_mode),
      message: offers.length ? "Prices and availability can change. Recheck the selected offer before any booking." :
        "No offers were returned for this search. Try different dates or airports."
    }, 200, request);
  } catch (error) {
    console.error("Duffel flight search error:", error?.name || "Error");
    return jsonResponse({ error: error?.name === "AbortError" ? "Flight search timed out. Please try again." :
      "Could not process the flight search. Check the dates and try again." }, error?.name === "AbortError" ? 504 : 400, request);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });

    if (url.pathname === "/api/health") {
      return jsonResponse({ ok: true, aiConfigured: Boolean(env.GEMINI_API_KEY) }, 200, request);
    }

    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/flights/search") {
      return handleDuffelFlightSearch(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
