const CONTACT_CONFIG = {
    // Add the real business details here when ready. Empty values stay hidden.
    whatsappNumber: "9182641172",
    email: "",
    instagram: "",
    facebook: ""
};

function buildWhatsAppUrl(message = "Hello Siva Global Travels, I would like to make an enquiry.") {
    const number = CONTACT_CONFIG.whatsappNumber.replace(/\D/g, "");
    return number
        ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message)
        : "https://wa.me/?text=" + encodeURIComponent(message);
}

document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero-3d");
    const scene = document.querySelector(".earth-scene");
    const cards = document.querySelectorAll(".service-card");

    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px)";
        const reveal = () => {
            card.style.transition = "opacity .7s ease, transform .7s ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        };
        setTimeout(reveal, 250 + index * 120);
    });

    if (hero && scene && window.matchMedia("(pointer:fine)").matches) {
        hero.addEventListener("mousemove", (event) => {
            const x = (window.innerWidth / 2 - event.clientX) / 55;
            const y = (window.innerHeight / 2 - event.clientY) / 55;
            scene.style.transform = `translateY(-50%) translate(${x}px,${y}px)`;
        });
        hero.addEventListener("mouseleave", () => {
            scene.style.transform = "translateY(-50%)";
        });
    }

    const whatsappContact = document.querySelector("#whatsappContact");
    if (whatsappContact) {
        whatsappContact.href = buildWhatsAppUrl();
    }

    const channels = [
        ["#emailContact", CONTACT_CONFIG.email, value => "mailto:" + value],
        ["#instagramContact", CONTACT_CONFIG.instagram, value => value],
        ["#facebookContact", CONTACT_CONFIG.facebook, value => value]
    ];
    channels.forEach(([selector, value, makeUrl]) => {
        const link = document.querySelector(selector);
        if (link && value) {
            link.href = makeUrl(value);
            link.hidden = false;
            link.target = value.startsWith("http") ? "_blank" : "";
            link.rel = "noopener";
        }
    });

    document.querySelectorAll(".job-card").forEach((card) => {
        card.addEventListener("click", () => {
            const country = card.dataset.jobCountry || "";
            const service = document.querySelector("#enquiryService");
            const goal = document.querySelector("#enquiryGoal");
            if (service) service.value = "Overseas Job Assistance";
            if (goal && country) goal.value = country + " job assistance";
        });
    });

    document.querySelectorAll(".destination-card").forEach((card) => {
        card.addEventListener("click", () => {
            const country = card.dataset.destination || "";
            const service = document.querySelector("#enquiryService");
            const goal = document.querySelector("#enquiryGoal");
            if (service && (country === "Israel" || country === "Russia")) service.value = "Overseas Job Assistance";
            if (goal && country) goal.value = country + ((country === "Israel" || country === "Russia") ? " job assistance" : " enquiry");
        });
    });

    document.querySelectorAll(".category-card").forEach((card) => {
        card.addEventListener("click", () => {
            const category = card.dataset.jobCategory || "";
            const service = document.querySelector("#enquiryService");
            const goal = document.querySelector("#enquiryGoal");
            if (service) service.value = "Overseas Job Assistance";
            if (goal && category) goal.value = category;
            const jobType = document.querySelector("#enquiryJobType");
            if (jobType) jobType.value = category === "Skilled Jobs" ? "Skilled Jobs" : "Unskilled / Blue-Collar Jobs";
        });
    });

    document.querySelectorAll(".vacancy-apply").forEach((button) => {
        button.addEventListener("click", () => {
            const role = button.dataset.role || "";
            const service = document.querySelector("#enquiryService");
            const jobType = document.querySelector("#enquiryJobType");
            const jobRole = document.querySelector("#enquiryJobRole");
            const goal = document.querySelector("#enquiryGoal");
            if (service) service.value = "Overseas Job Assistance";
            if (jobType) jobType.value = button.closest(".vacancy-card")?.querySelector(".vacancy-top span")?.textContent.includes("BLUE") ? "Unskilled / Blue-Collar Jobs" : "Skilled Jobs";
            if (jobRole) jobRole.value = role;
            if (goal) goal.value = "Current vacancy enquiry";
        });
    });

    const enquiryForm = document.querySelector("#enquiryForm");
    if (enquiryForm) {
        enquiryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.querySelector("#enquiryName").value.trim();
            const service = document.querySelector("#enquiryService").value;
            const jobType = document.querySelector("#enquiryJobType")?.value || "";
            const jobRole = document.querySelector("#enquiryJobRole")?.value.trim() || "";
            const goal = document.querySelector("#enquiryGoal").value.trim();
            const message = document.querySelector("#enquiryMessage").value.trim();
            const cv = document.querySelector("#cvUpload")?.files?.[0] || null;
            if (cv && cv.size > 5 * 1024 * 1024) {
                alert("Please select a CV smaller than 5 MB.");
                return;
            }
            const note = document.querySelector("#formNote");

            const text = [
                "Hello Siva Global Travels,",
                "",
                cv ? `CV / Resume selected: ${cv.name}` : "CV / Resume: Not attached yet.",
                "",
                `Name: ${name}`,
                `Service: ${service}`,
                ...(jobType ? [`Job Type: ${jobType}`] : []),
                ...(jobRole ? [`Job Role: ${jobRole}`] : []),
                `Destination / Goal: ${goal || "Not specified"}`,
                `Message: ${message || "Please contact me regarding this enquiry."}`
            ].join("\\n");

            window.open(buildWhatsAppUrl(text), "_blank", "noopener");
            note.textContent = CONTACT_CONFIG.whatsappNumber
                ? "WhatsApp opened for Siva Global Travels."
                : "WhatsApp opened. The business number will be connected when the official number is added.";
            if (window.innerWidth < 700) {
                note.scrollIntoView({behavior:"smooth", block:"nearest"});
            }
        });
    }
});

/* SIVA AI ASSISTANT */
const aiToggle=document.querySelector("#aiChatToggle"),aiPanel=document.querySelector("#aiChatPanel"),aiClose=document.querySelector("#aiChatClose"),aiForm=document.querySelector("#aiChatForm"),aiInput=document.querySelector("#aiChatInput"),aiMessages=document.querySelector("#aiChatMessages");
const aiHistory=[];
const aiLanguage=document.querySelector("#aiLanguage");
function addAiMessage(text,role="bot"){const el=document.createElement("div");el.className="ai-msg "+(role==="user"?"ai-msg-user":"ai-msg-bot");el.textContent=text;aiMessages.appendChild(el);aiMessages.scrollTop=aiMessages.scrollHeight;}
async function askAi(message){
  addAiMessage(message,"user"); aiHistory.push({role:"user",content:message});
  const loading=document.createElement("div"); loading.className="ai-msg ai-msg-bot"; loading.textContent="Thinking…"; aiMessages.appendChild(loading);
  try{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,language:aiLanguage?.value||"English",history:aiHistory.slice(-8)})});
    const data=await res.json();
    loading.remove();
    const reply=data.reply||"Please continue with WhatsApp and our team will assist you.";
    addAiMessage(reply); aiHistory.push({role:"assistant",content:reply});
  }catch(e){loading.remove();addAiMessage("I’m temporarily unavailable. Please use WhatsApp for direct help.");}
}
if(aiToggle)aiToggle.addEventListener("click",()=>{aiPanel.hidden=false;aiToggle.hidden=true;aiInput?.focus()});
if(aiLanguage)aiLanguage.addEventListener("change",()=>{aiInput?.focus()});
if(aiClose)aiClose.addEventListener("click",()=>{aiPanel.hidden=true;aiToggle.hidden=false});\nconst aiCancel=document.querySelector("#aiCancel"); if(aiCancel) aiCancel.addEventListener("click",()=>{aiPanel.hidden=true;aiToggle.hidden=false;aiHistory=[];if(aiMessages)aiMessages.innerHTML="";});
if(aiForm)aiForm.addEventListener("submit",e=>{e.preventDefault();const v=aiInput.value.trim();if(v){aiInput.value="";askAi(v)}});
const aiMic=document.querySelector("#aiMic"), aiSpeak=document.querySelector("#aiSpeak");
let aiRecognition=null, aiSpeaking=false;
if("speechSynthesis" in window && aiSpeak){
  aiSpeak.addEventListener("click",()=>{
    const msgs=aiMessages?.querySelectorAll(".ai-msg-bot"); const last=msgs?.[msgs.length-1];
    if(!last) return;
    if(aiSpeaking){speechSynthesis.cancel(); aiSpeaking=false; aiSpeak.classList.remove("active"); aiSpeak.textContent="🔊"; return;}
    const u=new SpeechSynthesisUtterance(last.textContent);
    const langMap={"te":"te-IN","hi":"hi-IN","ta":"ta-IN","kn":"kn-IN","ml":"ml-IN","ur-IN":"ur-IN","ar-KW":"ar-KW","bn-IN":"bn-IN","de":"de-DE","fr":"fr-FR","es":"es-ES","ru":"ru-RU","he":"he-IL","it-IT":"it-IT","en-CA":"en-CA","fr-CA":"fr-CA","de-CH":"de-CH","fr-CH":"fr-CH","it-CH":"it-CH","mt-MT":"mt-MT","sl-SI":"sl-SI","el-GR":"el-GR","pl-PL":"pl-PL","sv-SE":"sv-SE","da-DK":"da-DK","nb-NO":"nb-NO","fi-FI":"fi-FI","nl-NL":"nl-NL","pt-PT":"pt-PT","cs-CZ":"cs-CZ","sk-SK":"sk-SK","hu-HU":"hu-HU","et-EE":"et-EE","lv-LV":"lv-LV","lt-LT":"lt-LT","ro-RO":"ro-RO","bg-BG":"bg-BG","hr-HR":"hr-HR","ga-IE":"ga-IE","is-IS":"is-IS","lb-LU":"lb-LU","de-AT":"de-AT","zh-CN":"zh-CN","th-TH":"th-TH","ja-JP":"ja-JP","ko-KR":"ko-KR","en-AU":"en-AU","en-IN":"en-IN","en":"en-US"};
    u.lang=langMap[aiLanguage?.value]||"en-IN"; u.onend=()=>{aiSpeaking=false;aiSpeak.classList.remove("active");aiSpeak.textContent="🔊"}; aiSpeaking=true;aiSpeak.classList.add("active");aiSpeak.textContent="⏹️";speechSynthesis.speak(u);
  });
}
if(aiMic && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition; aiRecognition=new R(); aiRecognition.continuous=false;aiRecognition.interimResults=false;
  aiMic.addEventListener("click",()=>{
    if(aiRecognition._running){aiRecognition.stop();return;}
    const langMap={"te":"te-IN","hi":"hi-IN","ta":"ta-IN","kn":"kn-IN","ml":"ml-IN","ur-IN":"ur-IN","ar-KW":"ar-KW","bn-IN":"bn-IN","de":"de-DE","fr":"fr-FR","es":"es-ES","ru":"ru-RU","he":"he-IL","it-IT":"it-IT","en-CA":"en-CA","fr-CA":"fr-CA","de-CH":"de-CH","fr-CH":"fr-CH","it-CH":"it-CH","mt-MT":"mt-MT","sl-SI":"sl-SI","el-GR":"el-GR","pl-PL":"pl-PL","sv-SE":"sv-SE","da-DK":"da-DK","nb-NO":"nb-NO","fi-FI":"fi-FI","nl-NL":"nl-NL","pt-PT":"pt-PT","cs-CZ":"cs-CZ","sk-SK":"sk-SK","hu-HU":"hu-HU","et-EE":"et-EE","lv-LV":"lv-LV","lt-LT":"lt-LT","ro-RO":"ro-RO","bg-BG":"bg-BG","hr-HR":"hr-HR","ga-IE":"ga-IE","is-IS":"is-IS","lb-LU":"lb-LU","de-AT":"de-AT","zh-CN":"zh-CN","th-TH":"th-TH","ja-JP":"ja-JP","ko-KR":"ko-KR","en-AU":"en-AU","en-IN":"en-IN","en":"en-US"};
    aiRecognition.lang=langMap[aiLanguage?.value]||"en-IN"; aiRecognition._running=true;aiMic.classList.add("active");aiMic.textContent="⏹️";aiRecognition.start();
  });
  aiRecognition.onresult=e=>{const v=e.results[0][0].transcript;if(aiInput){aiInput.value=v;askAi(v);aiInput.value=""}};
  aiRecognition.onend=()=>{aiRecognition._running=false;aiMic.classList.remove("active");aiMic.textContent="🎙️"};
  aiRecognition.onerror=()=>{aiRecognition._running=false;aiMic.classList.remove("active");aiMic.textContent="🎙️"};
} else if(aiMic){aiMic.disabled=true;aiMic.title="Voice input is not supported in this browser";}

document.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>askAi(b.dataset.ai)));
