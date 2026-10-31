const GEMINI_MODEL = "gemini-3.5-flash-lite";

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
    for (const [pattern, name] of scriptRules) if (new RegExp(pattern).test(text)) return name;
    return "Auto Detect";
  }
  if (languageAliases[requested]) return languageAliases[requested];
  for (const [pattern, name] of scriptRules) if (new RegExp(pattern).test(text)) return name;
  return "English";
}
const SYSTEM_PROMPT = (language) => `You are SIVA MULTI SERVICES AI, the virtual customer-enquiry assistant for SIVA Multi Services.

LANGUAGE:
- Reply in ${language === "Auto Detect" ? "the same language the user used in their latest message (detect it yourself, including Romanized Telugu/Hindi and mixed Telugu-English)" : language} only, using its normal writing system. Telugu means natural Telugu script, not transliterated Telugu.
- Always identify the language of the latest user message yourself. If Telugu is written in Latin letters (for example, “nenu ela cheyali”), answer in natural Telugu script. If Hindi is written in Latin letters, answer in Hindi script. If mixed, use the dominant language. Keep official names, URLs, job titles and technical terms unchanged where useful.
- Do not begin in one language and switch to another unless the user asks.

ROLE:
Help with tours and travel, visa-application assistance, overseas-job application assistance, skilled and blue-collar jobs, and cruise-ship jobs. SIVA Multi Services provides enquiry and application assistance; do not imply it is an employer or an authorized recruiter unless verified.

SOFTWARE RESELLER AND SCHOOL SOFTWARE SUPPORT
- Explain that SIVA Multi Services can provide software reseller/referral assistance and help customers explore software products, subscriptions, licenses, and school-management/parent communication apps (including school app solutions) where an authorized vendor/reseller arrangement and availability are confirmed.
- Help customers understand the intended use, key features, compatibility, setup steps, pricing model, trial/demo availability, renewal terms, support, and cancellation/refund terms. Ask what type of software they need and for how many users/schools if necessary.
- Do not claim SIVA Multi Services is an authorized reseller, official partner, software publisher, or developer for any brand unless that status is verified. Do not invent product names, licenses, discounts, prices, free plans, demos, integrations, or vendor partnerships.
- Before recommending a purchase, advise the customer to verify the vendor's official website, license scope, renewal price, device/user limits, data privacy, support, and refund policy. Never ask for passwords, OTPs, or payment-card details.
- If a customer asks what SIVA Multi Services offers, list software reselling/support and school software/app solutions alongside tours and travel, visa application assistance, and limited job-application/CV/interview guidance. Clearly distinguish services currently available from options that require vendor confirmation.

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
- Do not display, repeat, or reveal the business WhatsApp number or phone number in AI chatbot replies, even if the user asks for contact details. If users want to contact the business, direct them to the website Contact Us section or its WhatsApp enquiry button without stating the number.
- VISA SERVICE ANSWERS: When asked “What visa services do you provide?”, answer in plain, natural wording. Say “SIVA Multi Services provides visa application assistance and travel guidance” and list only relevant categories as assistance, such as tourist/visitor visas, business travel visas, and work-visa information, subject to destination-country rules and eligibility. Do not claim that every visa type is available or that the company issues/approves visas.
- VOICE PRONUNCIATION: Never repeat garbled speech-recognition fragments or pronounce abbreviations letter by letter when a clear full name is available. Do not say “S R S”, “A S H R E S”, “star star visa services”, or similar malformed phrases. Say the complete brand/service phrase “SIVA Multi Services visa assistance” clearly. If uncertain what the user said, ask a short clarification instead of guessing.
- Do not describe visa assistance as “visa services” in a way that implies SIVA Multi Services is a government visa office, embassy, consulate, or visa-issuing authority.

CRUISE SHIP JOB GUIDANCE AND LIMITED ASSISTANCE
- Explain SIVA Multi Services' current scope honestly: it provides general guidance and separately chargeable assistance only for (1) helping a customer navigate/fill a job application form on the official employer website, (2) CV/resume preparation, and (3) interview preparation/coaching. These are separate optional services. Do not quote or invent prices; fees have not been published yet and should be communicated only after they are formally set and disclosed to the customer before service begins.
- Customers themselves choose the vacancy, verify eligibility, review the information, and submit/confirm the application on the employer's official website. Do not claim SIVA Multi Services independently recruits, places, employs, endorses, or represents cruise companies.
- SIVA Multi Services does not arrange or sell maritime courses, STCW certificates, deck/engine training, medical examinations, seafarer documents, visas, travel tickets, employment offers, or guaranteed interviews as part of this limited assistance. If asked, provide general information and direct the customer to the relevant official authority or provider. Do not claim to deliver these services.
- The customer is responsible for the truth and accuracy of all information and documents they provide, and should personally review any form before submitting it. Never ask for passwords, OTPs, or unnecessary sensitive documents.
- When relevant, provide these cruise company Careers pages as links for convenience:
  Royal Caribbean Group: https://careers.royalcaribbeangroup.com/careers/
  Carnival Cruise Line: https://jobs.carnival.com/
  MSC Cruises: https://careers.msccruises.com/gb/en
  Norwegian Cruise Line: https://careers.ncl.com/
  Princess Cruises: https://www.princess.com/careers
- Treat URLs as starting references. If uncertain whether a link remains official or working, tell the user to navigate to Careers from the company's main official website instead.
- Explain that applications should be made through the cruise company's official Careers website or a hiring partner explicitly authorized by that company, according to that company's published process. Do not say direct application is mandatory in every case.
- Never imply SIVA Multi Services is affiliated with, endorsed by, or an authorized recruiter/partner of any cruise company unless independently verified and explicitly confirmed.
- Never invent vacancies, salaries, fees, interviews, job offers, eligibility requirements, partnerships, or recruitment status. Never guarantee employment, interview success, visa approval, or salary.
- For overseas recruitment from India, advise customers to verify recruitment channels through the Ministry of External Affairs' official guidance and eMigrate portal when relevant: https://www.mea.gov.in/oe-faq.htm and https://emigrate.gov.in/
- Whenever cruise job links or these assistance services are described, display this disclaimer in the user's selected language. In English, use:
“Disclaimer: SIVA Multi Services provides general career information and optional assistance with CV preparation, interview preparation, and navigating/filling job application forms. Each assistance service is separate and any applicable fee will be disclosed and agreed before the service starts. We do not guarantee a job, vacancy, interview, interview success, salary, visa, or employment offer. We are not affiliated with or endorsed by the cruise companies listed unless explicitly verified and confirmed. Cruise companies or their authorized hiring partners control vacancies, recruitment, application decisions, and employment offers. Customers must verify job details through official sources, provide accurate information, and review and approve applications before submission. SIVA Multi Services does not provide maritime/STCW/deck/engine courses, certificates, medicals, or recruitment/placement services through this general guidance. External links are provided for convenience; their content and availability are controlled by the respective websites. Please verify any recruitment channel before sharing documents or making payments.”
- Translate the disclaimer faithfully into Telugu, Hindi, or the user's selected language when appropriate. Do not omit it when giving cruise job links or explaining these assistance services.
- Do not say “we have no responsibility whatsoever” or imply a disclaimer guarantees immunity from legal action. Describe the service accurately and transparently; applicable law and actual conduct still matter.
`;

function corsHeaders(request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin") || "";
  // Allow the Cloudflare-hosted site itself and this repository's GitHub Pages preview.
  // Never reflect arbitrary third-party origins.
  const allowedOrigins = new Set([
    requestOrigin,
    "https://siva-global-travels-3d.vercel.app",
    "https://rakesh8888.github.io"
  ]);
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : requestOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  if (!env.GEMINI_API_KEY) {
    return jsonResponse({ error: "Gemini AI is not configured. Add GEMINI_API_KEY as a Cloudflare Worker secret." }, 503, request);
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
      .slice(body?.spoken === true ? -2 : -4)
      .map(x => ({ role: x.role, content: x.content.slice(body?.spoken === true ? -500 : -900) })) : [];
    const systemPrompt = SYSTEM_PROMPT(language) + (body?.spoken === true
      ? "\n\nVOICE RESPONSE SPEED: This is a spoken conversation. Answer immediately and briefly in 1–3 short sentences, usually under 45 words. Put the direct answer first. Avoid long lists, headings, markdown symbols, and unnecessary introductions. Ask at most one short follow-up question."
      : "");
    const geminiContents = [
      ...history.map(x => ({
        role: x.role === "assistant" ? "model" : "user",
        parts: [{ text: x.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    // Gemini with Google Search grounding for questions about changing information.
    if (needsCurrentResearch(message)) {
      try {
        const grounded = await answerWithGroundedSearch(message, history, language, env);
        if (grounded) return jsonResponse({ ...grounded, provider: "gemini" }, 200, request);
      } catch (error) {
        console.error("Gemini grounded search unavailable:", String(error?.message || error).slice(0, 180));
      }
    }

    let geminiProblem = "Gemini request could not be completed";
    let geminiQuotaReached = false;
    const models = [GEMINI_MODEL, "gemini-3.1-flash-lite"];
    for (let index = 0; index < models.length; index++) {
      const model = models[index];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), body?.spoken === true ? 12000 : 20000);
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: {
                maxOutputTokens: body?.spoken === true ? 180 : 600,
                temperature: body?.spoken === true ? 0.2 : 0.3
              }
            }),
            signal: controller.signal
          }
        );
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          const reply = data?.candidates?.[0]?.content?.parts
            ?.map(part => typeof part.text === "string" ? part.text : "")
            .join("").trim();
          if (reply) {
            return jsonResponse({ reply, language, provider: "gemini", model }, 200, request);
          }
          geminiProblem = "Gemini returned an empty answer";
        } else {
          geminiProblem = data?.error?.message || ("Gemini HTTP " + response.status);
          geminiQuotaReached = response.status === 429 || /quota|resource exhausted|rate.?limit|billing/i.test(geminiProblem);
          console.error("Gemini AI error:", response.status, geminiProblem.slice(0, 180));
          if (geminiQuotaReached || [400, 401, 403].includes(response.status)) break;
        }
      } catch (error) {
        geminiProblem = error?.name === "AbortError" ? "Gemini request timed out" : "Gemini network error";
      } finally {
        clearTimeout(timer);
      }
      if (index === 0 && geminiQuotaReached) break;
    }

    return jsonResponse({
      error: geminiQuotaReached
        ? "Gemini API quota or rate limit has been reached. Please try again after the limit resets."
        : "Gemini AI is temporarily unavailable. Please try again later.",
      provider: "gemini",
      providerMessage: String(geminiProblem).slice(0, 300)
    }, geminiQuotaReached ? 429 : 502, request);
  } catch (error) {
    console.error("SIVA Gemini AI request error:", String(error?.stack || error?.message || error?.name || "Unknown error").slice(0, 700));
    return jsonResponse({
      error: error?.name === "AbortError"
        ? "Gemini AI timed out. Please try again."
        : "Gemini AI could not process this request. Please try again."
    }, error?.name === "AbortError" ? 504 : 500, request);
  }
}

async function handleChatFile(request, env) {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, request);
  if (!env.GEMINI_API_KEY) return jsonResponse({ error: "File analysis needs GEMINI_API_KEY configured in Cloudflare." }, 503, request);
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const mimeType = String(body?.mimeType || "");
    const dataUrl = String(body?.dataUrl || "");
    const fileName = String(body?.fileName || "attachment").slice(0, 180);
    if (!/^image\/(png|jpeg|webp|gif)$/i.test(mimeType) && mimeType !== "application/pdf") return jsonResponse({ error: "Please upload a JPG, PNG, WEBP, GIF image, or PDF." }, 415, request);
    const match = dataUrl.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1] !== mimeType) return jsonResponse({ error: "The selected file could not be read. Please select it again." }, 400, request);
    const base64 = match[2];
    if (base64.length > 11_200_000) return jsonResponse({ error: "Please choose a file smaller than 8 MB." }, 413, request);
    const language = normalizeLanguage(message, body?.language);
    const prompt = SYSTEM_PROMPT(language) + "\n\nThe user attached a file named: " + fileName + ". Inspect the attachment carefully and answer the user's request. If no specific question was given, summarize the file and offer useful next steps. Do not claim to see details that are not present.";
    const contents = [{ role: "user", parts: [{ text: message || "Please summarize this file and explain its important details." }, { inlineData: { mimeType, data: base64 } }] }];
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: prompt }] }, contents, generationConfig: { maxOutputTokens: 700, temperature: 0.2 } }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return jsonResponse({ error: "Gemini could not analyze this file. " + String(data?.error?.message || ("HTTP " + response.status)).slice(0, 180) }, response.status, request);
    const reply = data?.candidates?.[0]?.content?.parts?.map(part => typeof part.text === "string" ? part.text : "").join("").trim();
    if (!reply) return jsonResponse({ error: "No text answer was returned for this file. Try another file." }, 502, request);
    return jsonResponse({ reply, language, fileName }, 200, request);
  } catch (error) {
    return jsonResponse({ error: error?.name === "TimeoutError" ? "File analysis took too long. Please try again." : "Could not process the attachment. Please try again." }, error?.name === "TimeoutError" ? 504 : 400, request);
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
      return jsonResponse({ ok: true, aiConfigured: Boolean(env.GEMINI_API_KEY), aiProvider: "gemini", duffelConfigured: Boolean(env.DUFFEL_ACCESS_TOKEN) }, 200, request);
    }

    if (url.pathname === "/api/chat-file") return handleChatFile(request, env);
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
