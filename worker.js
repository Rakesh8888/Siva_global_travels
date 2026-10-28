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
const SYSTEM_PROMPT = (language) => `You are ELITE MULTI SERVICES AI, the virtual customer-enquiry assistant for Elite Multi Services.

LANGUAGE:
- Reply in ${language === "Auto Detect" ? "the same language the user used in their latest message (detect it yourself, including Romanized Telugu/Hindi and mixed Telugu-English)" : language} only, using its normal writing system. Telugu means natural Telugu script, not transliterated Telugu.
- Always identify the language of the latest user message yourself. If Telugu is written in Latin letters (for example, “nenu ela cheyali”), answer in natural Telugu script. If Hindi is written in Latin letters, answer in Hindi script. If mixed, use the dominant language. Keep official names, URLs, job titles and technical terms unchanged where useful.
- Do not begin in one language and switch to another unless the user asks.

ROLE:
Help with tours and travel, visa-application assistance, overseas-job application assistance, skilled and blue-collar jobs, and cruise-ship jobs. Elite Multi Services provides enquiry and application assistance; do not imply it is an employer or an authorized recruiter unless verified.

SOFTWARE RESELLER AND SCHOOL SOFTWARE SUPPORT
- Explain that Elite Multi Services can provide software reseller/referral assistance and help customers explore software products, subscriptions, licenses, and school-management/parent communication apps (including school app solutions) where an authorized vendor/reseller arrangement and availability are confirmed.
- Help customers understand the intended use, key features, compatibility, setup steps, pricing model, trial/demo availability, renewal terms, support, and cancellation/refund terms. Ask what type of software they need and for how many users/schools if necessary.
- Do not claim Elite Multi Services is an authorized reseller, official partner, software publisher, or developer for any brand unless that status is verified. Do not invent product names, licenses, discounts, prices, free plans, demos, integrations, or vendor partnerships.
- Before recommending a purchase, advise the customer to verify the vendor's official website, license scope, renewal price, device/user limits, data privacy, support, and refund policy. Never ask for passwords, OTPs, or payment-card details.
- If a customer asks what Elite Multi Services offers, list software reselling/support and school software/app solutions alongside tours and travel, visa application assistance, and limited job-application/CV/interview guidance. Clearly distinguish services currently available from options that require vendor confirmation.

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
- When appropriate, tell users they can contact Elite Multi Services on WhatsApp at +91 91826 41172. Do not claim the number is verified as a live support channel.
- VISA SERVICE ANSWERS: When asked “What visa services do you provide?”, answer in plain, natural wording. Say “Elite Multi Services provides visa application assistance and travel guidance” and list only relevant categories as assistance, such as tourist/visitor visas, business travel visas, and work-visa information, subject to destination-country rules and eligibility. Do not claim that every visa type is available or that the company issues/approves visas.
- VOICE PRONUNCIATION: Never repeat garbled speech-recognition fragments or pronounce abbreviations letter by letter when a clear full name is available. Do not say “S R S”, “A S H R E S”, “star star visa services”, or similar malformed phrases. Say the complete brand/service phrase “Elite Multi Services visa assistance” clearly. If uncertain what the user said, ask a short clarification instead of guessing.
- Do not describe visa assistance as “visa services” in a way that implies Elite Multi Services is a government visa office, embassy, consulate, or visa-issuing authority.

CRUISE SHIP JOB GUIDANCE AND LIMITED ASSISTANCE
- Explain Elite Multi Services' current scope honestly: it provides general guidance and separately chargeable assistance only for (1) helping a customer navigate/fill a job application form on the official employer website, (2) CV/resume preparation, and (3) interview preparation/coaching. These are separate optional services. Do not quote or invent prices; fees have not been published yet and should be communicated only after they are formally set and disclosed to the customer before service begins.
- Customers themselves choose the vacancy, verify eligibility, review the information, and submit/confirm the application on the employer's official website. Do not claim Elite Multi Services independently recruits, places, employs, endorses, or represents cruise companies.
- Elite Multi Services does not arrange or sell maritime courses, STCW certificates, deck/engine training, medical examinations, seafarer documents, visas, travel tickets, employment offers, or guaranteed interviews as part of this limited assistance. If asked, provide general information and direct the customer to the relevant official authority or provider. Do not claim to deliver these services.
- The customer is responsible for the truth and accuracy of all information and documents they provide, and should personally review any form before submitting it. Never ask for passwords, OTPs, or unnecessary sensitive documents.
- When relevant, provide these cruise company Careers pages as links for convenience:
  Royal Caribbean Group: https://careers.royalcaribbeangroup.com/careers/
  Carnival Cruise Line: https://jobs.carnival.com/
  MSC Cruises: https://careers.msccruises.com/gb/en
  Norwegian Cruise Line: https://careers.ncl.com/
  Princess Cruises: https://www.princess.com/careers
- Treat URLs as starting references. If uncertain whether a link remains official or working, tell the user to navigate to Careers from the company's main official website instead.
- Explain that applications should be made through the cruise company's official Careers website or a hiring partner explicitly authorized by that company, according to that company's published process. Do not say direct application is mandatory in every case.
- Never imply Elite Multi Services is affiliated with, endorsed by, or an authorized recruiter/partner of any cruise company unless independently verified and explicitly confirmed.
- Never invent vacancies, salaries, fees, interviews, job offers, eligibility requirements, partnerships, or recruitment status. Never guarantee employment, interview success, visa approval, or salary.
- For overseas recruitment from India, advise customers to verify recruitment channels through the Ministry of External Affairs' official guidance and eMigrate portal when relevant: https://www.mea.gov.in/oe-faq.htm and https://emigrate.gov.in/
- Whenever cruise job links or these assistance services are described, display this disclaimer in the user's selected language. In English, use:
“Disclaimer: Elite Multi Services provides general career information and optional assistance with CV preparation, interview preparation, and navigating/filling job application forms. Each assistance service is separate and any applicable fee will be disclosed and agreed before the service starts. We do not guarantee a job, vacancy, interview, interview success, salary, visa, or employment offer. We are not affiliated with or endorsed by the cruise companies listed unless explicitly verified and confirmed. Cruise companies or their authorized hiring partners control vacancies, recruitment, application decisions, and employment offers. Customers must verify job details through official sources, provide accurate information, and review and approve applications before submission. Elite Multi Services does not provide maritime/STCW/deck/engine courses, certificates, medicals, or recruitment/placement services through this general guidance. External links are provided for convenience; their content and availability are controlled by the respective websites. Please verify any recruitment channel before sharing documents or making payments.”
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


async function callOpenRouter(env, model, messages, maxTokens = 500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://elite-multi-services.sivaramtotti.workers.dev",
        "X-Title": "Elite Multi Services LLM Council"
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
      { role: "system", content: "You are an impartial reviewer. Review the anonymized answers for correctness, usefulness, missing caveats, and unsupported claims. Rank them best to worst and briefly explain. Do not assume any answer is correct merely because it sounds confident. Respond in " + (language === "Auto Detect" ? "the same language as the user’s latest message; detect Telugu, Hindi, or English even when written in Latin letters" : language) + "." },
      { role: "user", content: "Question:\\n" + message + "\\n\\nAnonymous answers:\\n" + anonymized }
    ], 300)
  ));
  const reviewText = reviews.map((r, i) => r.status === "fulfilled" ? ("Reviewer " + (i+1) + ":\\n" + r.value) : "").filter(Boolean).join("\\n\\n");
  const final = await callOpenRouter(env, models[0], [
    { role: "system", content: SYSTEM_PROMPT(language) + "\\n\\nYou are the Council Chairman. Synthesize the strongest parts of the candidate answers and peer reviews into one clear answer. Resolve contradictions cautiously, do not invent facts, and state uncertainty where needed. Never mention internal model names." },
    { role: "user", content: "User question:\\n" + message + "\\n\\nCandidate answers:\\n" + anonymized + "\\n\\nPeer reviews:\\n" + (reviewText || "Peer review unavailable") + "\\n\\nWrite the final answer in " + (language === "Auto Detect" ? "the same language as the user’s latest message; detect Telugu, Hindi, or English even when written in Latin letters" : language) + "." }
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
  if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY) {
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
      .slice(body?.spoken === true ? -2 : -4)
      .map(x => ({ role: x.role, content: x.content.slice(body?.spoken === true ? -500 : -900) })) : [];
    const systemPrompt = SYSTEM_PROMPT(language) + (body?.spoken === true ? "\n\nVOICE RESPONSE SPEED: This is a spoken conversation. Answer immediately and briefly in 1–3 short sentences, usually under 45 words. Put the direct answer first. Avoid long lists, headings, markdown symbols, and unnecessary introductions. Ask at most one short follow-up question." : "");
    // Explicit Groq mode: keep Groq selected, retry transient upstream failures once with a smaller supported model.
    if (String(body?.provider || "").toLowerCase() === "groq") {
      if (!env.GROQ_API_KEY) {
        return jsonResponse({ error: "Groq is not configured yet. Add the GROQ_API_KEY secret in Cloudflare Workers, then try again." }, 503, request);
      }
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(x => ({ role: x.role, content: x.content })),
        { role: "user", content: message }
      ];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 22000);
      try {
        const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
        let lastStatus = 502;
        let lastMessage = "Groq returned an upstream error.";
        for (let attempt = 0; attempt < models.length; attempt++) {
          const model = models[attempt];
          let response;
          try {
            response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": "Bearer " + env.GROQ_API_KEY, "Content-Type": "application/json" },
              body: JSON.stringify({ model, messages, max_tokens: body?.spoken === true ? 180 : 700, temperature: body?.spoken === true ? 0.2 : 0.3 }),
              signal: controller.signal
            });
          } catch (fetchError) {
            if (fetchError?.name === "AbortError") throw fetchError;
            lastMessage = "Could not connect to Groq.";
            lastStatus = 502;
            if (attempt === 0) continue;
            return jsonResponse({ error: lastMessage + " Please try again.", providerStatus: lastStatus }, 502, request);
          }
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            const reply = data?.choices?.[0]?.message?.content?.trim();
            if (!reply) {
              lastMessage = "Groq returned an empty answer.";
              lastStatus = 502;
              continue;
            }
            return jsonResponse({ reply, language, provider: "groq", model }, 200, request);
          }
          lastStatus = response.status;
          lastMessage = String(data?.error?.message || "Groq provider error").slice(0, 240);
          console.error("ELITE MULTI SERVICES AI Groq error:", response.status, model, lastMessage);
          // Credentials, permissions, request validation and quota errors will not be fixed by switching models.
          if ([400, 401, 403, 404, 413, 429].includes(response.status)) {
            const error = response.status === 401 ? "Groq API key was rejected. Check the GROQ_API_KEY secret."
              : response.status === 429 ? "Groq rate limit or quota reached. Try again later."
              : response.status === 403 ? "Groq model access is restricted. Check model permissions in Groq Console."
              : "Groq request failed: " + lastMessage;
            return jsonResponse({ error, providerStatus: response.status, providerMessage: lastMessage }, response.status === 429 ? 429 : response.status, request);
          }
          if (response.status < 500 && response.status !== 408) {
            return jsonResponse({ error: "Groq rejected the request: " + lastMessage, providerStatus: response.status, providerMessage: lastMessage }, response.status, request);
          }
        }
        return jsonResponse({ error: "Groq is still returning a server error after trying a fallback model. Please retry shortly.", providerStatus: lastStatus, providerMessage: lastMessage }, 502, request);
      } catch (error) {
        return jsonResponse({ error: error?.name === "AbortError" ? "Groq timed out. Please try again." : "Could not connect to Groq. Check your internet connection and API status.", providerStatus: error?.name === "AbortError" ? 504 : 502, providerMessage: String(error?.message || error).slice(0, 180) }, error?.name === "AbortError" ? 504 : 502, request);
      } finally {
        clearTimeout(timer);
      }
    }
    let reply = "";

    // For questions that depend on changing facts, prefer grounded Google Search results.
    if (needsCurrentResearch(message) && env.GEMINI_API_KEY) {
      try {
        const grounded = await answerWithGroundedSearch(message, history, language, env);
        if (grounded) return jsonResponse(grounded, 200, request);
      } catch (error) {
        console.error("ELITE MULTI SERVICES AI grounded search unavailable; continuing with the configured Gemini free-tier request only:", String(error?.message || error).slice(0, 180));
      }
    }

    // Fast chat mode: bypass the multi-model Tree/LLM Council for interactive replies.
    // Council runs multiple model and review calls, which makes the website chat noticeably slower.
    // Keep the council helper available for future explicit API use, but never invoke it from /api/chat.
    const councilEnabled = false;
    let openRouterProblem = "OpenRouter council is disabled";
    if (env.OPENROUTER_API_KEY && councilEnabled) {
      try {
        const council = await runLlmCouncil(message, history, language, env);
        return jsonResponse(council, 200, request);
      } catch (error) {
        openRouterProblem = String(error?.message || error).slice(0, 220);
        console.error("ELITE MULTI SERVICES AI Council unavailable; using configured single-model fallback:", openRouterProblem);
      }
    }
    // FREE-ONLY SAFETY: never call OpenRouter or other potentially paid providers from the default chat path.
    // If Gemini free quota is exhausted, return an error instead of switching to a paid provider.
    const geminiContents = [
      ...history.map(x => ({
        role: x.role === "assistant" ? "model" : "user",
        parts: [{ text: x.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];
    let geminiProblem = "Gemini unavailable";
    let geminiQuotaReached = false;

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
              generationConfig: { maxOutputTokens: body?.spoken === true ? 180 : 500, temperature: body?.spoken === true ? 0.2 : 0.3 }
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
          geminiQuotaReached = response.status === 429 || /quota|resource exhausted|rate.?limit|billing/i.test(geminiProblem);
          console.error("ELITE MULTI SERVICES AI Gemini error:", response.status, geminiProblem.slice(0, 180));
        }
      } catch (error) {
        geminiProblem = error?.name === "AbortError" ? "Gemini timeout" : "Gemini network error";
        console.error("ELITE MULTI SERVICES AI Gemini request failed:", geminiProblem);
      } finally {
        clearTimeout(timer);
      }
    }

    // If the primary Gemini model is unavailable for this API key, retry once with another current stable Flash-Lite model.
    // Do not retry quota/rate-limit failures, which would only add delay.
    if (!reply && env.GEMINI_API_KEY && !geminiQuotaReached && /not found|not supported|not available|model.*unavailable|unsupported model|404|400|timeout|timed out/i.test(String(geminiProblem))) {
      const fallbackModel = "gemini-3.1-flash-lite";
      const fallbackController = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackController.abort(), body?.spoken === true ? 9000 : 12000);
      try {
        const fallbackResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + fallbackModel + ":generateContent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: { maxOutputTokens: body?.spoken === true ? 180 : 500, temperature: body?.spoken === true ? 0.2 : 0.3 }
            }),
            signal: fallbackController.signal
          }
        );
        const fallbackData = await fallbackResponse.json().catch(() => ({}));
        if (fallbackResponse.ok) {
          reply = fallbackData?.candidates?.[0]?.content?.parts
            ?.map(part => typeof part.text === "string" ? part.text : "")
            .join("").trim() || "";
          if (reply) console.log("ELITE MULTI SERVICES AI answered using fallback Gemini model.");
          else geminiProblem = "Both Gemini models returned an empty answer";
        } else {
          geminiProblem = fallbackData?.error?.message || ("Gemini fallback HTTP " + fallbackResponse.status);
          geminiQuotaReached = fallbackResponse.status === 429 || /quota|resource exhausted|rate.?limit|billing/i.test(geminiProblem);
        }
      } catch (fallbackError) {
        geminiProblem = fallbackError?.name === "AbortError" ? "Gemini fallback timed out" : "Gemini fallback network error";
      } finally {
        clearTimeout(fallbackTimer);
      }
    }

    // FREE-ONLY SAFETY: intentionally do not fall back to potentially paid providers.

    if (!reply) {
      return jsonResponse({
        error: geminiQuotaReached
          ? "Gemini free-tier limit may have been reached. No paid-provider fallback was used. Please wait for quota reset or choose Groq manually if it is configured."
          : "ELITE MULTI SERVICES AI is temporarily unavailable. No paid-provider fallback was used. Please try again later.",
        providerMessage: String(geminiProblem).slice(0, 400)
      }, geminiQuotaReached ? 429 : 502, request);
    }

    return jsonResponse({ reply, language }, 200, request);
  } catch (error) {
    console.error("ELITE MULTI SERVICES AI request error:", String(error?.stack || error?.message || error?.name || "Unknown error").slice(0, 700));
    return jsonResponse({
      error: error?.name === "AbortError"
        ? "ELITE MULTI SERVICES AI timed out. Please try again."
        : "Could not process your message. Please try again.",
      requestId: crypto.randomUUID()
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

async function handleCartesiaTTS(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, request);
  if (!env.CARTESIA_API_KEY || !env.CARTESIA_VOICE_ID) {
    return jsonResponse({ error: "Cartesia voice is not configured. Add CARTESIA_API_KEY and CARTESIA_VOICE_ID as Cloudflare Worker secrets/variables." }, 503, request);
  }
  try {
    const body = await request.json();
    const transcript = String(body.transcript || "").trim();
    if (!transcript) return jsonResponse({ error: "Transcript is required" }, 400, request);
    if (transcript.length > 1800) return jsonResponse({ error: "Please shorten the voice reply to 1,800 characters or less." }, 413, request);
    const allowedLanguages = new Set(["en", "te", "hi", "ta", "kn", "ml", "ur", "ar", "fr", "de", "it", "es", "pt", "ru", "zh-CN", "ja", "ko", "nl", "tr", "id", "th", "vi", "bn", "mr", "pa", "fa"]);
    const requestedLanguage = String(body.language || "en").trim();
    const language = allowedLanguages.has(requestedLanguage) ? requestedLanguage : "en";
    const upstream = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.CARTESIA_API_KEY,
        "Cartesia-Version": "2026-08-14",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model_id: "sonic-3.6",
        transcript,
        voice: env.CARTESIA_VOICE_ID,
        output_format: { container: "mp3", encoding: "mp3", sample_rate: 44100 },
        language,
        normalization: "auto"
      })
    });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      return jsonResponse({ error: upstream.status === 402 || upstream.status === 429 ? "Cartesia free credits or rate limit may have been reached." : "Cartesia speech generation failed.", providerStatus: upstream.status, providerMessage: detail.slice(0, 300) }, upstream.status === 429 ? 429 : 502, request);
    }
    const headers = new Headers(corsHeaders(request));
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "audio/mpeg");
    headers.set("Cache-Control", "no-store");
    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return jsonResponse({ error: "Unable to generate Cartesia speech.", detail: String(error && error.message || "").slice(0, 180) }, 500, request);
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
      return jsonResponse({ ok: true, aiConfigured: Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY || env.OPENROUTER_API_KEY || env.GROQ_API_KEY), groqConfigured: Boolean(env.GROQ_API_KEY), councilConfigured: false, cartesiaTTSConfigured: Boolean(env.CARTESIA_API_KEY && env.CARTESIA_VOICE_ID), duffelConfigured: Boolean(env.DUFFEL_ACCESS_TOKEN) }, 200, request);
    }

    if (url.pathname === "/api/chat-file") return handleChatFile(request, env);
    if (url.pathname === "/api/tts") return handleCartesiaTTS(request, env);
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
