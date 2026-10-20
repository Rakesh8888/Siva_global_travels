const GEMINI_MODEL = "gemini-2.5-flash";

function normalizeLanguage(message, requestedLanguage) {
  const text = String(message || "");
  const requested = String(requestedLanguage || "").trim().toLowerCase();
  const languageAliases = {
    "en":"English","english":"English","en-in":"English",
    "te":"Telugu","telugu":"Telugu","te-in":"Telugu",
    "hi":"Hindi","hindi":"Hindi","hi-in":"Hindi",
    "ta":"Tamil","tamil":"Tamil","ta-in":"Tamil",
    "kn":"Kannada","kannada":"Kannada","kn-in":"Kannada",
    "ml":"Malayalam","malayalam":"Malayalam","ml-in":"Malayalam",
    "ur":"Urdu","urdu":"Urdu","ur-in":"Urdu",
    "ar":"Arabic","arabic":"Arabic","ar-sa":"Arabic","ar-kw":"Arabic",
    "fr":"French","french":"French","fr-fr":"French","fr-ca":"French",
    "de":"German","german":"German","de-de":"German","de-ch":"German","de-at":"German",
    "es":"Spanish","spanish":"Spanish","es-es":"Spanish",
    "pt":"Portuguese","portuguese":"Portuguese","pt-pt":"Portuguese",
    "ru":"Russian","russian":"Russian","ru-ru":"Russian",
    "zh-cn":"Chinese (Simplified)","zh":"Chinese (Simplified)","chinese":"Chinese (Simplified)",
    "ja":"Japanese","japanese":"Japanese","ja-jp":"Japanese",
    "ko":"Korean","korean":"Korean","ko-kr":"Korean",
    "id":"Indonesian","indonesian":"Indonesian","id-id":"Indonesian",
    "bn":"Bengali","bengali":"Bengali","bn-in":"Bengali",
    "mr":"Marathi","marathi":"Marathi","mr-in":"Marathi",
    "pa":"Punjabi","punjabi":"Punjabi","pa-in":"Punjabi"
  };
  const scriptRules = [
    [/[ఀ-౿]/, "Telugu"], [/[ऀ-ॿ]/, "Hindi"],
    [/[஀-௿]/, "Tamil"], [/[ಀ-೿]/, "Kannada"],
    [/[ഀ-ൿ]/, "Malayalam"], [/[ঀ-৿]/, "Bengali"],
    [/[਀-੿]/, "Punjabi"], [/[؀-ۿ]/, "Arabic"],
    [/[一-鿿]/, "Chinese (Simplified)"], [/[぀-ヿ]/, "Japanese"],
    [/[가-힯]/, "Korean"]
  ];
  if (requested === "auto" || requested === "auto detect" || requested === "") {
    for (const [pattern, name] of scriptRules) if (pattern.test(text)) return name;
    return "Auto Detect";
  }
  if (languageAliases[requested]) return languageAliases[requested];
  for (const [pattern, name] of scriptRules) if (pattern.test(text)) return name;
  return "English";
}
const SYSTEM_PROMPT = (language) => `You are LUCKY AI, the virtual customer-enquiry assistant for Siva Global Travels.

LANGUAGE:
- Reply in ${language === "Auto Detect" ? "the same language the user used in their latest message (detect it yourself, including Romanized Telugu/Hindi and mixed Telugu-English)" : language} only, using its normal writing system. Telugu means natural Telugu script, not transliterated Telugu.
- Always identify the language of the latest user message yourself. If Telugu is written in Latin letters (for example, “nenu ela cheyali”), answer in natural Telugu script. If Hindi is written in Latin letters, answer in Hindi script. If mixed, use the dominant language. Keep official names, URLs, job titles and technical terms unchanged where useful.
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


async function callOpenRouter(env, model, messages, maxTokens = 500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://siva-global-travels.sivaramtotti.workers.dev",
        "X-Title": "Siva Global Travels LLM Council"
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.2 }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error("OpenRouter request failed (" + response.status + "): " + String(data?.error?.message || data?.message || "Unknown provider error").slice(0, 220));
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) throw new Error("Model returned an empty response");
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeCouncilModel(value) {
  const raw = String(value || "").trim().replace(/^models\//i, "");
  const aliases = {
    "gemini-2.5-flash": "google/gemini-2.5-flash",
    "gemini-3.8-flash": "google/gemini-2.5-flash",
    "google/gemini-3.8-flash": "google/gemini-2.5-flash",
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "deepseek-chat": "deepseek/deepseek-chat"
  };
  return aliases[raw.toLowerCase()] || raw;
}

async function runLlmCouncil(message, history, language, env) {
  const defaults = ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "deepseek/deepseek-chat"];
  const models = String(env.COUNCIL_MODELS || defaults.join(",")).split(",").map(normalizeCouncilModel).filter(Boolean).slice(0, 3);
  if (models.length < 2) throw new Error("Council requires at least two models");
  const system = SYSTEM_PROMPT(language) + "\\n\\nYou are one member of a multi-model council. Give a careful, useful answer. Do not invent current facts, prices, vacancies, or guarantees.";
  const context = history.map(x => ({ role: x.role, content: x.content })).slice(-4);
  const first = await Promise.allSettled(models.map(model =>
    callOpenRouter(env, model, [{ role: "system", content: system }, ...context, { role: "user", content: message }], 450)
  ));
  const answers = first.map((r, i) => ({ label: "Response " + String.fromCharCode(65+i), model: models[i], text: r.status === "fulfilled" ? r.value : "" })).filter(x => x.text);
  if (answers.length < 2) throw new Error("Not enough council models responded");
  const anonymized = answers.map(a => a.label + ":\\n" + a.text).join("\\n\\n---\\n\\n");
  const reviews = await Promise.allSettled(models.map(model =>
    callOpenRouter(env, model, [
      { role: "system", content: "You are an impartial reviewer. Review the anonymized answers for correctness, usefulness, missing caveats, and unsupported claims. Rank them best to worst and briefly explain. Do not assume any answer is correct merely because it sounds confident. Respond in " + language + "." },
      { role: "user", content: "Question:\\n" + message + "\\n\\nAnonymous answers:\\n" + anonymized }
    ], 300)
  ));
  const reviewText = reviews.map((r, i) => r.status === "fulfilled" ? ("Reviewer " + (i+1) + ":\\n" + r.value) : "").filter(Boolean).join("\\n\\n");
  const final = await callOpenRouter(env, models[0], [
    { role: "system", content: SYSTEM_PROMPT(language) + "\\n\\nYou are the Council Chairman. Synthesize the strongest parts of the candidate answers and peer reviews into one clear answer. Resolve contradictions cautiously, do not invent facts, and state uncertainty where needed. Never mention internal model names." },
    { role: "user", content: "User question:\\n" + message + "\\n\\nCandidate answers:\\n" + anonymized + "\\n\\nPeer reviews:\\n" + (reviewText || "Peer review unavailable") + "\\n\\nWrite the final answer in " + language + "." }
  ], 650);
  return { reply: final, council: { enabled: true, modelsUsed: answers.length, reviewsReceived: reviews.filter(x => x.status === "fulfilled").length } };
}


function needsCurrentResearch(message) {
  return /\b(latest|today|current|currently|now|recent|news|price|prices|fare|fares|flight status|weather|visa rules|visa requirement|job vacancy|vacancies|available jobs|deadline|official update|exchange rate)\b/i.test(message)
    || /ఇప్పటి|ప్రస్తుత|ఈరోజు|తాజా|ధరలు|విమాన ధర|వీసా నియమాలు|ఉద్యోగ ఖాళీ|నేటి వార్తలు/.test(message);
}

async function answerWithGroundedSearch(message, history, language, env) {
  if (!env.GEMINI_API_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const contents = [
      ...history.map(x => ({ role: x.role === "assistant" ? "model" : "user", parts: [{ text: x.content }] })),
      { role: "user", parts: [{ text: message }] }
    ];
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT(language) + "\\n\\nFor current-information questions, use Google Search grounding. State dates clearly, distinguish official sources from other sources, and do not invent a price, vacancy, visa rule, or availability. If search results do not confirm something, say so." }] },
          contents,
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.2 }
        }),
        signal: controller.signal
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || ("Gemini grounded search HTTP " + response.status));
    const candidate = data?.candidates?.[0];
    const reply = candidate?.content?.parts?.map(part => typeof part.text === "string" ? part.text : "").join("").trim();
    if (!reply) return null;
    const grounding = candidate?.groundingMetadata;
    const sources = Array.isArray(grounding?.groundingChunks)
      ? grounding.groundingChunks.map(chunk => chunk?.web).filter(web => web?.uri && web?.title).slice(0, 5)
      : [];
    return { reply, language, research: true, sources };
  } finally {
    clearTimeout(timer);
  }
}

async function handleChat(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, request);
  }
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY && !(env.OPENROUTER_API_KEY && String(env.COUNCIL_ENABLED || "").toLowerCase() === "true")) {
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
    const systemPrompt = SYSTEM_PROMPT(language);
    let reply = "";
    let openRouterProblem = "OpenRouter not attempted";

    // For questions that depend on changing facts, prefer grounded Google Search results.
    if (needsCurrentResearch(message) && env.GEMINI_API_KEY) {
      try {
        const grounded = await answerWithGroundedSearch(message, history, language, env);
        if (grounded) return jsonResponse(grounded, 200, request);
      } catch (error) {
        console.error("LUCKY AI grounded search unavailable; falling back to configured models:", String(error?.message || error).slice(0, 180));
      }
    }

    // Automatically use the Karpathy-style council whenever the OpenRouter key exists.
    // COUNCIL_ENABLED=false can explicitly disable it; no extra variable is required.
    const councilDisabled = String(env.COUNCIL_ENABLED || "").toLowerCase() === "false";
    if (env.OPENROUTER_API_KEY && !councilDisabled) {
      try {
        const council = await runLlmCouncil(message, history, language, env);
        return jsonResponse(council, 200, request);
      } catch (error) {
        openRouterProblem = String(error?.message || error).slice(0, 220);
        console.error("LUCKY AI Council unavailable; using configured single-model fallback:", openRouterProblem);
      }
    }
    // If the full council is disabled or unavailable, try OpenRouter's single-model path
    // before the existing Gemini/OpenAI providers. This also makes provider failures easier to recover from.
    if (!reply && env.OPENROUTER_API_KEY) {
      const fallbackModels = [
        "openai/gpt-4o-mini",
        "google/gemini-2.5-flash",
        "deepseek/deepseek-chat"
      ];
      for (const fallbackModel of fallbackModels) {
        try {
          reply = await callOpenRouter(env, fallbackModel, [
            { role: "system", content: systemPrompt },
            ...history.map(x => ({ role: x.role, content: x.content })),
            { role: "user", content: message }
          ], 500);
          if (reply) break;
        } catch (error) {
          openRouterProblem = String(error?.message || error).slice(0, 220);
          console.error("LUCKY AI OpenRouter fallback error (" + fallbackModel + "):", openRouterProblem);
        }
      }
    }

    const geminiContents = [
      ...history.map(x => ({
        role: x.role === "assistant" ? "model" : "user",
        parts: [{ text: x.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];
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
        error: "LUCKY AI is temporarily unavailable. Please try again shortly or contact Siva Global Travels.",
        providerMessage: String(openRouterProblem + "; " + geminiProblem).slice(0, 400)
      }, 502, request);
    }

    return jsonResponse({ reply, language }, 200, request);
  } catch (error) {
    console.error("LUCKY AI request error:", String(error?.stack || error?.message || error?.name || "Unknown error").slice(0, 700));
    return jsonResponse({
      error: error?.name === "AbortError"
        ? "LUCKY AI timed out. Please try again."
        : "Could not process your message. Please try again.",
      requestId: crypto.randomUUID()
    }, error?.name === "AbortError" ? 504 : 500, request);
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
