const GEMINI_MODEL = "gemini-3.8-flash";

function normalizeLanguage(message, requestedLanguage) {
  const text = String(message || "");
  const requested = String(requestedLanguage || "").toLowerCase();
  // Prefer the language actually used in the latest message, especially Telugu script.
  if (/[\u0C00-\u0C7F]/.test(text) || /^(te|te-in|telugu)$/.test(requested)) return "Telugu";
  if (/[\u0900-\u097F]/.test(text) || /^(hi|hi-in|hindi)$/.test(requested)) return "Hindi";
  if (/[\u0B80-\u0BFF]/.test(text) || /^(ta|ta-in|tamil)$/.test(requested)) return "Tamil";
  if (/[\u0C80-\u0CFF]/.test(text) || /^(kn|kn-in|kannada)$/.test(requested)) return "Kannada";
  if (/[\u0D00-\u0D7F]/.test(text) || /^(ml|ml-in|malayalam)$/.test(requested)) return "Malayalam";
  if (requested.startsWith("ur")) return "Urdu";
  if (requested.startsWith("ar")) return "Arabic";
  if (requested.startsWith("de")) return "German";
  if (requested.startsWith("fr")) return "French";
  if (requested.startsWith("it")) return "Italian";
  if (requested.startsWith("es")) return "Spanish";
  if (requested.startsWith("ru")) return "Russian";
  return "English";
}

const SYSTEM_PROMPT = (language) => `You are LUCKY AI, the virtual customer-enquiry assistant for Siva Global Travels.

LANGUAGE:
- Reply in ${language} only, using its normal writing system. Telugu means natural Telugu script, not transliterated Telugu.
- Follow the language of the user's latest message. If it is Telugu, answer in Telugu; if English, answer in English. If mixed, use the dominant language. Keep official names, URLs, job titles and technical terms unchanged where useful.
- Do not begin in one language and switch to another unless the user asks.

ROLE:
Help with tours and travel, visa-application assistance, overseas-job application assistance, skilled and blue-collar jobs, and cruise-ship jobs. Siva Global Travels provides enquiry and application assistance; do not imply it is an employer or an authorized recruiter unless verified.

ACCURACY:
- Answer the exact question first, in concise, simple steps.
- Never invent current vacancies, employers, salary figures, visa rules, prices, fees, interview calls, approvals, partnerships, or bookings.
- Separate confirmed facts from examples or estimates. If information is not available or current verification is needed, say so plainly.
- Never promise a job, interview, visa, immigration result, or booking.
- For current job/visa/travel details, direct users to the official employer, airline, cruise company, or government source when available.
- If the user's request is unclear, ask one short clarifying question.
- Do not claim an application, booking, payment, or message has been submitted unless that action was actually verified.

STYLE AND COST:
- Be friendly, patient, and practical for beginners.
- Prefer short paragraphs and numbered steps; avoid repetition and unnecessary background.
- Understand common typos, informal speech, Indian English, and mixed-language messages.
- When appropriate, tell users they can contact Siva Global Travels on WhatsApp at +91 91826 41172. Do not claim the number is verified as a live support channel.
`;

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
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    return jsonResponse({ error: "AI service is not configured yet." }, 503, request);
  }

  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return jsonResponse({ error: "Message is required" }, 400, request);
    if (message.length > 4000) {
      return jsonResponse({ error: "Please shorten your message to 4,000 characters or less." }, 413, request);
    }

    const language = normalizeLanguage(message, body?.language);
    const history = Array.isArray(body?.history) ? body.history
      .filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
      .slice(-6)
      .map(x => ({ role: x.role, content: x.content.slice(-1200) })) : [];
    const geminiContents = [
      ...history.map(x => ({
        role: x.role === "assistant" ? "model" : "user",
        parts: [{ text: x.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];
    const systemPrompt = SYSTEM_PROMPT(language);
    let reply = "";
    let geminiProblem = "Gemini unavailable";

    // Try Gemini first. If it errors, times out, or returns an empty answer, try OpenAI.
    if (env.GEMINI_API_KEY) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
            }),
            signal: controller.signal
          }
        );
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          reply = data?.candidates?.[0]?.content?.parts
            ?.map(part => typeof part.text === "string" ? part.text : "")
            .join("").trim() || "";
          if (!reply) geminiProblem = "Gemini returned an empty answer";
        } else {
          geminiProblem = data?.error?.message || ("Gemini HTTP " + response.status);
          console.error("LUCKY AI Gemini error:", response.status, geminiProblem.slice(0, 180));
        }
      } catch (error) {
        geminiProblem = error?.name === "AbortError" ? "Gemini timeout" : "Gemini network error";
        console.error("LUCKY AI Gemini request failed:", geminiProblem);
      } finally {
        clearTimeout(timer);
      }
    }

    if (!reply && env.OPENAI_API_KEY) {
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(x => ({ role: x.role, content: x.content })),
        { role: "user", content: message }
      ];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env.OPENAI_API_KEY
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 500,
            temperature: 0.3
          }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          reply = data?.choices?.[0]?.message?.content?.trim() || "";
        } else {
          console.error("LUCKY AI OpenAI fallback error:", response.status, data?.error?.message || "Unknown provider error");
        }
      } catch (error) {
        console.error("LUCKY AI OpenAI fallback failed:", error?.name || "Network error");
      } finally {
        clearTimeout(timer);
      }
    }

    if (!reply) {
      return jsonResponse({
        error: "LUCKY AI is temporarily unavailable. Please try again shortly or contact Siva Global Travels."
      }, 502, request);
    }

    return jsonResponse({ reply, language }, 200, request);
  } catch (error) {
    console.error("LUCKY AI request error:", error?.name || "Error");
    return jsonResponse({
      error: error?.name === "AbortError"
        ? "LUCKY AI timed out. Please try again."
        : "Could not process your message. Please try again."
    }, error?.name === "AbortError" ? 504 : 400, request);
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
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
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
        error: response.status === 401 ? "Duffel rejected the API token. Check that Cloudflare contains an activated Duffel LIVE access token." :
          response.status === 429 ? "Flight search is temporarily busy. Please try again shortly." :
          "Flight search provider could not complete the request. Please try again."
      }, response.status === 429 ? 429 : 502, request);
    }
    // Never expose test-mode offers as real fares. Duffel's offer request reports live_mode.
    const liveMode = result?.data?.live_mode === true;
    if (!liveMode) {
      return jsonResponse({
        error: "Duffel returned test-mode results. No sample prices are displayed. Add an activated LIVE Duffel access token to the DUFFEL_ACCESS_TOKEN secret in Cloudflare.",
        offers: [], count: 0, liveMode: false
      }, 409, request);
    }
    const rawOffers = result?.data?.offers || result?.data?.offer_request?.offers || [];
    // Defense in depth: exclude Duffel's explicit test airline and incomplete price records.
    const verifiedOffers = rawOffers.filter(offer =>
      offer?.id &&
      offer?.total_amount !== undefined && offer?.total_amount !== null &&
      offer?.total_currency &&
      String(offer?.owner?.name || "").toLowerCase() !== "duffel airways" &&
      offer?.owner?.iata_code !== "ZZ" &&
      !(offer?.slices || []).some(slice => (slice?.segments || []).some(segment =>
        segment?.marketing_carrier?.iata_code === "ZZ" || segment?.operating_carrier?.iata_code === "ZZ"
      ))
    );
    const offers = verifiedOffers.slice(0, 10).map(offer => ({
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
      offers, count: offers.length, liveMode: true,
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
      return jsonResponse({ ok: true, aiConfigured: Boolean(env.GEMINI_API_KEY), duffelConfigured: Boolean(env.DUFFEL_ACCESS_TOKEN) }, 200, request);
    }

    if (url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/flights/search") {
      return handleDuffelFlightSearch(request, env);
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse({
      error: "Static assets binding is unavailable in this Worker preview.",
      apiHealth: "/api/health"
    }, 404, request);
  }
};
