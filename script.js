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
if(aiClose)aiClose.addEventListener("click",()=>{aiPanel.hidden=true;aiToggle.hidden=false;});
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
    const voiceMode=document.querySelector("#aiVoiceMode"), voiceMic=document.querySelector("#aiVoiceMic"), voiceStatus=document.querySelector("#aiVoiceStatus");
    if(voiceMode) voiceMode.hidden=false;
    if(aiRecognition._running){aiRecognition.stop();return;}
    const langMap={"te":"te-IN","hi":"hi-IN","ta":"ta-IN","kn":"kn-IN","ml":"ml-IN","ur-IN":"ur-IN","ar-KW":"ar-KW","bn-IN":"bn-IN","de":"de-DE","fr":"fr-FR","es":"es-ES","ru":"ru-RU","he":"he-IL","it-IT":"it-IT","en-CA":"en-CA","fr-CA":"fr-CA","de-CH":"de-CH","fr-CH":"fr-CH","it-CH":"it-CH","mt-MT":"mt-MT","sl-SI":"sl-SI","el-GR":"el-GR","pl-PL":"pl-PL","sv-SE":"sv-SE","da-DK":"da-DK","nb-NO":"nb-NO","fi-FI":"fi-FI","nl-NL":"nl-NL","pt-PT":"pt-PT","cs-CZ":"cs-CZ","sk-SK":"sk-SK","hu-HU":"hu-HU","et-EE":"et-EE","lv-LV":"lv-LV","lt-LT":"lt-LT","ro-RO":"ro-RO","bg-BG":"bg-BG","hr-HR":"hr-HR","ga-IE":"ga-IE","is-IS":"is-IS","lb-LU":"lb-LU","de-AT":"de-AT","zh-CN":"zh-CN","th-TH":"th-TH","ja-JP":"ja-JP","ko-KR":"ko-KR","en-AU":"en-AU","en-IN":"en-IN","en":"en-US"};
    aiRecognition.lang=langMap[aiLanguage?.value]||"en-IN"; aiRecognition._running=true;aiMic.classList.add("active");aiMic.textContent="⏹️";if(voiceMic)voiceMic.classList.add("active");if(voiceStatus)voiceStatus.textContent="Listening… speak now";aiRecognition.start();
  });
  aiRecognition.onresult=e=>{const v=e.results[0][0].transcript;if(aiInput){aiInput.value=v;askAi(v);aiInput.value=""}};
  aiRecognition.onend=()=>{aiRecognition._running=false;aiMic.classList.remove("active");aiMic.textContent="🎙️";if(voiceMic)voiceMic.classList.remove("active");if(voiceStatus)voiceStatus.textContent="Tap the microphone to speak"};
  aiRecognition.onerror=()=>{aiRecognition._running=false;aiMic.classList.remove("active");aiMic.textContent="🎙️";if(voiceMic)voiceMic.classList.remove("active");if(voiceStatus)voiceStatus.textContent="Voice input unavailable — try again"};
} else if(aiMic){aiMic.disabled=true;aiMic.title="Voice input is not supported in this browser";}

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
    earth.rotation.y+=.0019;
    globeGroup.rotation.x=Math.sin(performance.now()*.00018)*.035;
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

  const texture=new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
  );
  texture.colorSpace=THREE.SRGBColorSpace;

  const earth=new THREE.Mesh(
    new THREE.SphereGeometry(1.62,64,64),
    new THREE.MeshPhongMaterial({
      map:texture,
      shininess:22,
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
    earth.rotation.y+=.0024;
    atmosphere.rotation.y+=.0015;
    ring.rotation.y+=.001;
    group.rotation.x=Math.sin(performance.now()*.00025)*.025;
    renderer.render(scene,camera);
  }
  animate();
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
