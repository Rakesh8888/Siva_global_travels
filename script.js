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
  if(!message || !aiMessages) return;
  addAiMessage(message,"user");
  aiHistory.push({role:"user",content:message});
  const loading=document.createElement("div");
  loading.className="ai-msg ai-msg-bot";
  loading.textContent="Thinking…";
  aiMessages.appendChild(loading);
  const sendButton=aiForm?.querySelector('button[type="submit"],button:not([type])');
  if(sendButton){sendButton.disabled=true;sendButton.setAttribute("aria-busy","true");}
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),30000);
    const res=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({message,language:aiLanguage?.value||"en-IN",history:aiHistory.slice(0,-1).slice(-8)}),
      signal:controller.signal
    });
    clearTimeout(timeout);
    let data={};
    try{data=await res.json()}catch(_){}
    loading.remove();
    if(!res.ok) throw new Error(data.error||"AI request failed");
    const reply=(data.reply||"Please continue with WhatsApp and our team will assist you.").trim();
    addAiMessage(reply);
    aiHistory.push({role:"assistant",content:reply});
  }catch(e){
    loading.remove();
    const msg=e?.name==="AbortError"
      ?"LUCKY is taking too long to respond. Please try again or use WhatsApp."
      :"LUCKY is temporarily unavailable. Please try again or use WhatsApp.";
    addAiMessage(msg);
  }finally{
    if(sendButton){sendButton.disabled=false;sendButton.removeAttribute("aria-busy");}
  }
}
if(aiToggle)aiToggle.addEventListener("click",(event)=>{event.preventDefault();event.stopPropagation();if(aiPanel){aiPanel.hidden=false;aiPanel.style.display="";aiPanel.setAttribute("aria-hidden","false");}aiToggle.hidden=true;setTimeout(()=>aiInput?.focus(),0)});
if(aiLanguage)aiLanguage.addEventListener("change",()=>{aiInput?.focus()});
if(aiClose)aiClose.addEventListener("click",(event)=>{event.preventDefault();event.stopPropagation();if(aiPanel){aiPanel.hidden=true;aiPanel.setAttribute("aria-hidden","true");aiPanel.style.display="none";}if(aiToggle){aiToggle.hidden=false;aiToggle.removeAttribute("aria-hidden");aiToggle.focus();}if(aiRecognition&&aiRecognition._running){try{aiRecognition.stop()}catch(_){}}});
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
const aiVoiceMode=document.querySelector("#aiVoiceMode");
const aiVoiceMic=document.querySelector("#aiVoiceMic");
const aiVoiceStatus=document.querySelector("#aiVoiceStatus");
const voiceLangMap={"te":"te-IN","hi":"hi-IN","ta":"ta-IN","kn":"kn-IN","ml":"ml-IN","ur-IN":"ur-IN","ar-KW":"ar-KW","bn-IN":"bn-IN","de":"de-DE","fr":"fr-FR","es":"es-ES","ru":"ru-RU","he":"he-IL","it-IT":"it-IT","en-CA":"en-CA","fr-CA":"fr-CA","de-CH":"de-CH","fr-CH":"fr-CH","it-CH":"it-CH","mt-MT":"mt-MT","sl-SI":"sl-SI","el-GR":"el-GR","pl-PL":"pl-PL","sv-SE":"sv-SE","da-DK":"da-DK","nb-NO":"nb-NO","fi-FI":"fi-FI","nl-NL":"nl-NL","pt-PT":"pt-PT","cs-CZ":"cs-CZ","sk-SK":"sk-SK","hu-HU":"hu-HU","et-EE":"et-EE","lv-LV":"lv-LV","lt-LT":"lt-LT","ro-RO":"ro-RO","bg-BG":"bg-BG","hr-HR":"hr-HR","ga-IE":"ga-IE","is-IS":"is-IS","lb-LU":"lb-LU","de-AT":"de-AT","zh-CN":"zh-CN","th-TH":"th-TH","ja-JP":"ja-JP","ko-KR":"ko-KR","en-AU":"en-AU","en-IN":"en-IN","en":"en-US"};
function setVoiceUi(listening){
  if(aiMic){aiMic.classList.toggle("active",listening);aiMic.textContent=listening?"⏹️":"🎙️";}
  if(aiVoiceMic){aiVoiceMic.classList.toggle("active",listening);}
  if(aiVoiceStatus)aiVoiceStatus.textContent=listening?"Listening… speak now":"Tap the microphone to speak";
}
function stopLuckyRecognition(){
  if(aiRecognition&&aiRecognition._running){try{aiRecognition.stop()}catch(_){}}
  setVoiceUi(false);
}
function startLuckyRecognition(){
  if(!aiRecognition)return;
  if(aiRecognition._running){stopLuckyRecognition();return;}
  if(aiVoiceMode)aiVoiceMode.hidden=false;
  aiRecognition.lang=voiceLangMap[aiLanguage?.value]||"en-IN";
  aiRecognition.continuous=false;
  aiRecognition.interimResults=false;
  aiRecognition._running=true;
  setVoiceUi(true);
  try{aiRecognition.start()}catch(_){aiRecognition._running=false;setVoiceUi(false);}
}
if(aiMic && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)){
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  aiRecognition=new R();
  aiMic.addEventListener("click",startLuckyRecognition);
  aiVoiceMic?.addEventListener("click",startLuckyRecognition);
  aiRecognition.onresult=e=>{
    const v=e.results?.[0]?.[0]?.transcript?.trim();
    if(v){if(aiInput)aiInput.value=v;askAi(v);if(aiInput)aiInput.value="";}
  };
  aiRecognition.onend=()=>{aiRecognition._running=false;setVoiceUi(false);};
  aiRecognition.onerror=()=>{aiRecognition._running=false;setVoiceUi(false);if(aiVoiceStatus)aiVoiceStatus.textContent="Voice input unavailable — try again";};
} else if(aiMic){
  aiMic.disabled=true;
  aiMic.title="Voice input is not supported in this browser";
  if(aiVoiceMic)aiVoiceMic.disabled=true;
}

document.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>askAi(b.dataset.ai)));


/* LUCKY 3D WORLD — interactive globe, aircraft and cruise ship */
let lucky3D = null;
function initLucky3DWorld(){
  const host=document.querySelector("#aiGlobe3D");
  if(!host || !window.THREE || lucky3D) return;
  const THREE=window.THREE;
  host.innerHTML="";
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(0,0,7.2);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  host.appendChild(renderer.domElement);

  const globeGroup=new THREE.Group();
  scene.add(globeGroup);

  const loader=new THREE.TextureLoader();
  loader.crossOrigin="anonymous";
  const earthTexture=loader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    undefined,
    undefined,
    ()=>{}
  );
  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1.72,64,64),
    new THREE.MeshPhongMaterial({map:earthTexture,shininess:18,specular:0x335577})
  );
  globeGroup.add(earth);

  const atmosphere=new THREE.Mesh(
    new THREE.SphereGeometry(1.79,64,64),
    new THREE.MeshBasicMaterial({color:0x66bfff,transparent:true,opacity:.10,side:THREE.BackSide})
  );
  globeGroup.add(atmosphere);

  const halo=new THREE.Mesh(
    new THREE.RingGeometry(1.92,2.02,96),
    new THREE.MeshBasicMaterial({color:0xff9d2e,transparent:true,opacity:.26,side:THREE.DoubleSide})
  );
  halo.rotation.x=Math.PI/2;
  globeGroup.add(halo);

  const starsGeo=new THREE.BufferGeometry();
  const starCount=700, positions=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    const r=12+Math.random()*8, a=Math.random()*Math.PI*2, z=(Math.random()*2-1)*r, q=Math.sqrt(Math.max(0,r*r-z*z));
    positions[i*3]=Math.cos(a)*q; positions[i*3+1]=z; positions[i*3+2]=Math.sin(a)*q;
  }
  starsGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
  scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.7})));

  scene.add(new THREE.AmbientLight(0x9fc7e8,1.5));
  const keyLight=new THREE.DirectionalLight(0xffffff,2.7); keyLight.position.set(4,4,6); scene.add(keyLight);
  const rimLight=new THREE.PointLight(0xff9d2e,7,12); rimLight.position.set(-4,1,3); scene.add(rimLight);

  function makePlane(){
    const g=new THREE.Group();
    const white=new THREE.MeshStandardMaterial({color:0xf4f7fb,metalness:.35,roughness:.28});
    const orange=new THREE.MeshStandardMaterial({color:0xff9d2e,metalness:.3,roughness:.3});
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.10,.72,6,12),white);
    body.rotation.z=Math.PI/2; g.add(body);
    const wing=new THREE.Mesh(new THREE.BoxGeometry(.85,.035,.24),white); wing.position.set(0,-.02,0); g.add(wing);
    const tail=new THREE.Mesh(new THREE.BoxGeometry(.25,.035,.14),white); tail.position.set(-.28,.08,0); g.add(tail);
    const nose=new THREE.Mesh(new THREE.SphereGeometry(.11,16,10),orange); nose.position.x=.40; g.add(nose);
    g.scale.setScalar(.48);
    return g;
  }
  const planeOrbit=new THREE.Group(); scene.add(planeOrbit);
  const plane=makePlane(); plane.position.set(0,0,2.15); plane.rotation.z=Math.PI/2; planeOrbit.add(plane);

  function makeShip(){
    const g=new THREE.Group();
    const hullMat=new THREE.MeshStandardMaterial({color:0xf5f7f8,metalness:.25,roughness:.32});
    const deckMat=new THREE.MeshStandardMaterial({color:0xd8e0e6,metalness:.2,roughness:.4});
    const orangeMat=new THREE.MeshStandardMaterial({color:0xff9d2e,metalness:.2,roughness:.35});
    const hull=new THREE.Mesh(new THREE.BoxGeometry(.95,.20,.34),hullMat); hull.position.y=-.05; g.add(hull);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(.72,.12,.28),deckMat); deck.position.set(.02,.12,0); g.add(deck);
    const bridge=new THREE.Mesh(new THREE.BoxGeometry(.28,.22,.25),hullMat); bridge.position.set(-.16,.27,0); g.add(bridge);
    for(let i=0;i<3;i++){const funnel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.18,12),orangeMat); funnel.position.set(.18+i*.13,.27,0); g.add(funnel);}
    g.scale.setScalar(.78);
    return g;
  }
  const shipOrbit=new THREE.Group(); scene.add(shipOrbit);
  const ship=makeShip(); ship.position.set(0,0,-2.22); ship.rotation.y=Math.PI; shipOrbit.add(ship);

  const routeRing=new THREE.Mesh(
    new THREE.TorusGeometry(2.16,.018,8,128),
    new THREE.MeshBasicMaterial({color:0xff9d2e,transparent:true,opacity:.72})
  );
  routeRing.rotation.x=.32; routeRing.rotation.z=.18; scene.add(routeRing);

  function resize(){
    const w=Math.max(1,host.clientWidth), h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  let raf=0, running=true;
  function animate(){
    if(!running) return;
    raf=requestAnimationFrame(animate);
    earth.rotation.y+=.008;
    globeGroup.rotation.x=Math.sin(performance.now()*.00035)*.045;
    planeOrbit.rotation.y+=.008;
    shipOrbit.rotation.y-=.0035;
    plane.rotation.z=Math.sin(performance.now()*.002)*.035;
    ship.rotation.y=Math.PI+Math.sin(performance.now()*.0013)*.05;
    routeRing.rotation.y+=.0012;
    renderer.render(scene,camera);
  }
  animate();
  lucky3D={scene,renderer,host,stop(){running=false;cancelAnimationFrame(raf);renderer.dispose();}};
}
function openLuckyVoice3D(){initLucky3DWorld();}

document.addEventListener("DOMContentLoaded",()=>{
  const voiceMode=document.querySelector("#aiVoiceMode");
  const voiceClose=document.querySelector("#aiVoiceClose");
  const voiceCancel=document.querySelector("#aiVoiceCancel");
  const closeVoice=()=>{
    if(voiceMode) voiceMode.hidden=true;
    if(aiRecognition && aiRecognition._running){try{aiRecognition.stop()}catch(e){}}
  };
  [voiceClose,voiceCancel].forEach(b=>b&&b.addEventListener("click",closeVoice));
  const voiceObserver=new MutationObserver(()=>{if(voiceMode && !voiceMode.hidden) openLuckyVoice3D();});
  if(voiceMode) voiceObserver.observe(voiceMode,{attributes:true,attributeFilter:["hidden"]});
});


/* PREMIUM HERO 3D EARTH */
let heroGlobe3DReady=false;
function initHeroGlobe3D(){
  const host=document.querySelector("#heroGlobe3D");
  if(!host || !window.THREE || heroGlobe3DReady) return;
  heroGlobe3DReady=true;
  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(0,0,5.9);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setClearColor(0x000000,0);
  host.innerHTML="";
  host.appendChild(renderer.domElement);

  const group=new THREE.Group();
  scene.add(group);

  const textureLoader=new THREE.TextureLoader();
  textureLoader.crossOrigin="anonymous";
  const texture=textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
  );
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=8;
  const normalTexture=textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
  );

  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1.62,64,64),
    new THREE.MeshPhongMaterial({
      map:texture,
      normalMap:normalTexture,
      normalScale:new THREE.Vector2(.45,.45),
      shininess:28,
      specular:new THREE.Color(0x244d72)
    })
  );
  group.add(earth);

  const atmosphere=new THREE.Mesh(
    new THREE.SphereGeometry(1.70,64,64),
    new THREE.MeshPhongMaterial({
      color:0x55bfff,
      transparent:true,
      opacity:.14,
      side:THREE.BackSide
    })
  );
  group.add(atmosphere);

  const glow=new THREE.Mesh(
    new THREE.SphereGeometry(1.77,48,48),
    new THREE.MeshBasicMaterial({
      color:0x3aa8ff,
      transparent:true,
      opacity:.055,
      side:THREE.BackSide
    })
  );
  group.add(glow);

  scene.add(new THREE.AmbientLight(0x9fc9e8,1.2));
  const sun=new THREE.DirectionalLight(0xffffff,2.8);
  sun.position.set(4,3,5);
  scene.add(sun);
  const warm=new THREE.PointLight(0xff9d2e,3.2,10);
  warm.position.set(-3,-1,3);
  scene.add(warm);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(1.83,.012,8,128),
    new THREE.MeshBasicMaterial({color:0xff9d2e,transparent:true,opacity:.55})
  );
  ring.rotation.x=.42;
  ring.rotation.z=-.18;
  scene.add(ring);

  let flightRouteGroup=null,flightRoutePlane=null;
  function geoPoint(lat,lon,r=1.685){const p=(90-lat)*Math.PI/180,t=(lon+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t));}
  function arcPoint(a,b,t){const ang=a.angleTo(b);if(ang<.0001)return a.clone().lerp(b,t).normalize();const s=Math.sin(ang);return a.clone().multiplyScalar(Math.sin((1-t)*ang)/s).add(b.clone().multiplyScalar(Math.sin(t*ang)/s)).normalize();}
  window.renderFlightRoute=(from,to)=>{
    if(flightRouteGroup)group.remove(flightRouteGroup);
    flightRouteGroup=new THREE.Group();
    const start=geoPoint(from.lat,from.lon),end=geoPoint(to.lat,to.lon),pts=[];
    for(let i=0;i<=80;i++){const t=i/80,p=arcPoint(start.clone().normalize(),end.clone().normalize(),t);p.multiplyScalar(1.685+Math.sin(Math.PI*t)*.12);pts.push(p);}
    flightRouteGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xff9d2e,transparent:true,opacity:.95})));
    const markerMat=new THREE.MeshStandardMaterial({color:0xff9d2e,emissive:0x8a3d00,emissiveIntensity:1.2});
    [start,end].forEach(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),markerMat.clone());m.position.copy(p);flightRouteGroup.add(m);});
    flightRoutePlane=new THREE.Mesh(new THREE.SphereGeometry(.075,16,10),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xff9d2e,emissiveIntensity:1}));
    flightRouteGroup.add(flightRoutePlane);group.add(flightRouteGroup);flightRouteState={start,end,t:0};
  };

  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  function animate(){
    requestAnimationFrame(animate);
    earth.rotation.y+=.009;
    atmosphere.rotation.y+=.004;
    ring.rotation.y+=.0025;
    if(flightRouteState&&flightRoutePlane){flightRouteState.t=(flightRouteState.t+.002)%1;const t=flightRouteState.t,p=arcPoint(flightRouteState.start.clone().normalize(),flightRouteState.end.clone().normalize(),t);p.multiplyScalar(1.685+Math.sin(Math.PI*t)*.12);flightRoutePlane.position.copy(p);}
    group.rotation.x=Math.sin(performance.now()*.00025)*.025;
    renderer.render(scene,camera);
  }
  animate();
  if(window.renderFlightRoute)window.renderFlightRoute({lat:14.4673,lon:78.8242},{lat:29.3759,lon:47.9774});
}
document.addEventListener("DOMContentLoaded",initHeroGlobe3D);


/* PREMIUM HERO 3D AIRCRAFT */
let heroAircraftReady=false;
function initHeroAircraft3D(){
  const host=document.querySelector("#heroAirplane3D");
  if(!host || !window.THREE || heroAircraftReady) return;
  heroAircraftReady=true;
  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,50);
  camera.position.set(0,0,4.5);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setClearColor(0x000000,0);
  host.innerHTML="";
  host.appendChild(renderer.domElement);

  const aircraft=new THREE.Group();
  aircraft.rotation.set(.10,.15,-.12);
  aircraft.scale.setScalar(1.15);
  scene.add(aircraft);

  const white=new THREE.MeshStandardMaterial({color:0xf7fafc,metalness:.45,roughness:.24});
  const orange=new THREE.MeshStandardMaterial({color:0xff8f1f,metalness:.35,roughness:.25});
  const dark=new THREE.MeshStandardMaterial({color:0x24364a,metalness:.35,roughness:.3});

  const fuselage=new THREE.Mesh(new THREE.CapsuleGeometry(.17,1.55,8,20),white);
  fuselage.rotation.z=Math.PI/2;
  aircraft.add(fuselage);

  const nose=new THREE.Mesh(new THREE.SphereGeometry(.175,20,12),orange);
  nose.position.x=.86;
  aircraft.add(nose);

  const wing=new THREE.Mesh(new THREE.BoxGeometry(.95,.045,.55),white);
  wing.position.set(.05,0,0);
  wing.rotation.y=-.10;
  aircraft.add(wing);

  const tailWing=new THREE.Mesh(new THREE.BoxGeometry(.38,.04,.25),white);
  tailWing.position.set(-.66,.12,0);
  aircraft.add(tailWing);

  const tailFin=new THREE.Mesh(new THREE.BoxGeometry(.24,.36,.045),white);
  tailFin.position.set(-.64,.17,0);
  tailFin.rotation.z=-.28;
  aircraft.add(tailFin);

  for(const z of [-.25,.25]){
    const engine=new THREE.Mesh(new THREE.CylinderGeometry(.075,.095,.38,18),dark);
    engine.rotation.x=Math.PI/2;
    engine.position.set(.18,-.10,z);
    aircraft.add(engine);
  }

  const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.05,.025,.015),orange);
  stripe.position.set(.05,-.16,.08);
  aircraft.add(stripe);

  scene.add(new THREE.HemisphereLight(0xb9ddff,0x172437,2.1));
  const key=new THREE.DirectionalLight(0xffffff,3);
  key.position.set(3,4,5);
  scene.add(key);
  const rim=new THREE.PointLight(0xff9d2e,3,10);
  rim.position.set(-2,1,2);
  scene.add(rim);

  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    aircraft.rotation.y=.16+Math.sin(t*.7)*.08;
    aircraft.rotation.z=-.10+Math.sin(t*1.2)*.035;
    aircraft.position.y=Math.sin(t*1.4)*.06;
    renderer.render(scene,camera);
  }
  animate();
}
document.addEventListener("DOMContentLoaded",initHeroAircraft3D);


/* PREMIUM HERO 3D CRUISE SHIP */
let heroCruiseReady=false;
function initHeroCruise3D(){
  const host=document.querySelector("#heroCruise3D");
  if(!host || !window.THREE || heroCruiseReady) return;
  heroCruiseReady=true;
  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,60);
  camera.position.set(0,0,5.6);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setClearColor(0x000000,0);
  host.innerHTML="";
  host.appendChild(renderer.domElement);

  const ship=new THREE.Group();
  ship.rotation.set(.05,-.25,-.05);
  ship.scale.setScalar(1.12);
  scene.add(ship);

  const hullMat=new THREE.MeshStandardMaterial({color:0xf4f7fa,metalness:.35,roughness:.25});
  const darkMat=new THREE.MeshStandardMaterial({color:0x1b334a,metalness:.3,roughness:.28});
  const glassMat=new THREE.MeshPhysicalMaterial({color:0x77bfe8,metalness:.1,roughness:.08,transparent:true,opacity:.82});
  const orangeMat=new THREE.MeshStandardMaterial({color:0xff8f1f,metalness:.3,roughness:.24});

  const hull=new THREE.Mesh(new THREE.BoxGeometry(2.55,.48,.72),hullMat);
  hull.position.y=-.35;
  hull.scale.x=1.08;
  ship.add(hull);

  const bow=new THREE.Mesh(new THREE.ConeGeometry(.52,.95,32),hullMat);
  bow.rotation.z=-Math.PI/2;
  bow.position.x=1.55;
  bow.position.y=-.28;
  bow.scale.z=1.05;
  ship.add(bow);

  const lowerHull=new THREE.Mesh(new THREE.BoxGeometry(2.35,.12,.70),orangeMat);
  lowerHull.position.set(0,-.59,0);
  ship.add(lowerHull);

  for(let i=0;i<4;i++){
    const deck=new THREE.Mesh(new THREE.BoxGeometry(1.85-i*.16,.18,.60),hullMat);
    deck.position.set(-.10,.02+i*.20,0);
    ship.add(deck);
  }

  const bridge=new THREE.Mesh(new THREE.BoxGeometry(.72,.35,.54),glassMat);
  bridge.position.set(.62,.52,0);
  ship.add(bridge);

  for(let i=0;i<6;i++){
    const window=new THREE.Mesh(new THREE.BoxGeometry(.13,.08,.025),darkMat);
    window.position.set(-.70+i*.28,.22,.315);
    ship.add(window);
    const other=window.clone();
    other.position.z=-.315;
    ship.add(other);
  }

  for(let i=0;i<3;i++){
    const funnel=new THREE.Mesh(new THREE.CylinderGeometry(.075,.095,.38,18),orangeMat);
    funnel.position.set(-.62+i*.25,.66,0);
    ship.add(funnel);
  }

  const topDeck=new THREE.Mesh(new THREE.BoxGeometry(.72,.06,.58),glassMat);
  topDeck.position.set(-.18,.80,0);
  ship.add(topDeck);

  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.45,10),darkMat);
  mast.position.set(.05,1.02,0);
  ship.add(mast);

  scene.add(new THREE.HemisphereLight(0xbde4ff,0x18283a,2.0));
  const key=new THREE.DirectionalLight(0xffffff,3.1);
  key.position.set(4,4,5);
  scene.add(key);
  const warm=new THREE.PointLight(0xff9d2e,3.5,12);
  warm.position.set(-3,1,3);
  scene.add(warm);

  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize",resize,{passive:true});

  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    ship.rotation.y=-.25+Math.sin(t*.45)*.07;
    ship.rotation.z=-.05+Math.sin(t*.8)*.025;
    ship.position.y=Math.sin(t*1.15)*.055;
    renderer.render(scene,camera);
  }
  animate();
}
document.addEventListener("DOMContentLoaded",initHeroCruise3D);

/* FLIGHT LOCATION SEARCH */
const FLIGHT_DEFAULTS={"Kadapa, India":{lat:14.4673,lon:78.8242,label:"Kadapa, India"},"Kuwait City, Kuwait":{lat:29.3759,lon:47.9774,label:"Kuwait City, Kuwait"}};
async function findFlightPlace(value){const key=Object.keys(FLIGHT_DEFAULTS).find(k=>k.toLowerCase()===value.trim().toLowerCase());if(key)return FLIGHT_DEFAULTS[key];const r=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q="+encodeURIComponent(value.trim()));if(!r.ok)throw Error("lookup");const d=await r.json();if(!d[0])throw Error("notfound");return{lat:+d[0].lat,lon:+d[0].lon,label:d[0].display_name.split(",").slice(0,2).join(",")};}
document.addEventListener("DOMContentLoaded",()=>{
 const show=document.querySelector("#flightShow"),swap=document.querySelector("#flightSwap"),from=document.querySelector("#flightFrom"),to=document.querySelector("#flightTo"),status=document.querySelector("#flightStatus");
 if(!show||!from||!to)return;
 swap?.addEventListener("click",()=>{const x=from.value;from.value=to.value;to.value=x;});
 show.addEventListener("click",async()=>{show.disabled=true;status.className="flight-status loading";status.textContent="Finding accurate coordinates…";try{const[a,b]=await Promise.all([findFlightPlace(from.value),findFlightPlace(to.value)]);window.renderFlightRoute(a,b);document.querySelector(".route-from").textContent=a.label.split(",")[0].toUpperCase();document.querySelector(".route-to").textContent=b.label.split(",")[0].toUpperCase();status.className="flight-status success";status.textContent=a.label+" → "+b.label+" • 3D route ready";}catch(e){status.className="flight-status error";status.textContent="Location not found. Try City, Country."}finally{show.disabled=false;}});
});
