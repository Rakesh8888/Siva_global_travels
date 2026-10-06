export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { message, language = "English", history = [] } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Message is required" });
    const input = [
      { role: "system", content: `You are LUCKY, the Siva Global Travels customer enquiry assistant. Help users with Tour & Travel, Visa Application Assistance, Overseas Job Assistance, Skilled Jobs, Unskilled/Blue-Collar Jobs, and Cruise Jobs. Destinations include India, Kuwait, Germany, Italy, Luxembourg, Schengen, Israel and Russia. Use very simple, clear language and short sentences. The selected response language is: ${language}. Reply in that language. Supported languages are English, Telugu, Hindi, Tamil, Kannada, Malayalam, Urdu, Arabic and Bengali. Never guarantee a job, salary, visa approval, employer selection, or immigration result. Do not invent vacancies, employers, salaries or fees. If the user wants to apply or asks about a specific current vacancy, collect name, destination, job type, job role and experience, then direct them to WhatsApp at +91 91826 41172. If the user writes in another language, follow the selected language unless they clearly ask for a different language.` },
      ...history.filter(x => x && (x.role === "user" || x.role === "assistant")).slice(-8),
      { role: "user", content: message }
    ];
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.OPENAI_API_KEY },
      body: JSON.stringify({ model: "gpt-6-luna", input })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: "AI request failed" });
    return res.status(200).json({ reply: data.output_text || "Please continue with WhatsApp for assistance." });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
