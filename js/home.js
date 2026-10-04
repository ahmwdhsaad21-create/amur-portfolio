(()=>{
  const cfg=window.AMUR_CONFIG||{};
  const sb=(window.supabase&&cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY)?supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  const BI=window.AMUR_BI;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const copy={
    en:{
      "hero.kicker":"Branding · Visual Identity · Creative Direction","hero.title":"We turn ideas into presence.","hero.body":"Strategy, identity and creative direction shaped into a clear visual system that makes a brand seen and remembered.","hero.cta":"Discover AMUR",
      "about.kicker":"About AMUR","about.title":"Clarity in the idea. Power in the execution.","about.p1":"Identity built on meaning, not just appearance.","about.p2":"Creative direction that keeps the brand consistent at every touchpoint.","about.p3":"Digital systems that connect the idea to operation and growth.",
      "work.kicker":"Selected Work","work.title":"Projects built to work, not just look good.","work.body":"Real projects across identity, content, operations and digital systems.","work.loading":"Loading projects…",
      "services.kicker":"Services","services.title":"One direction. Multiple touchpoints.","services.s1t":"Brand Identity","services.s1b":"Naming, identity systems and visual direction built around a clear idea.","services.s2t":"Creative Direction","services.s2b":"Content systems, campaigns and visual consistency across every appearance.","services.s3t":"Digital Systems","services.s3b":"Operational tools and interfaces that turn brand thinking into real workflows.",
      "process.kicker":"Process","process.title":"A clear path from idea to execution.","process.body":"The work stays simple: understand, define, build and refine.","process.p1t":"Understand","process.p1b":"Read the problem, the audience and the real context.","process.p2t":"Define","process.p2b":"Set the idea, tone and visual direction before designing.","process.p3t":"Build","process.p3b":"Turn the direction into a coherent system across touchpoints.","process.p4t":"Refine","process.p4b":"Test, simplify and keep only what strengthens the brand.",
      "contact.kicker":"Contact","contact.title":"Got an idea that deserves more?","contact.body":"Send the idea. We organize it, define its direction and build it the way it deserves.","contact.cta":"Start a project"
    },
    ar:{
      "hero.kicker":"براندنج · هوية بصرية · توجيه إبداعي","hero.title":"نحوّل الأفكار لحضور.","hero.body":"استراتيجية وهوية وتوجيه إبداعي يتجمعوا في نظام بصري واضح يخلي البراند يتشاف ويتفتكر.","hero.cta":"اكتشف أمور",
      "about.kicker":"عن أمور","about.title":"وضوح في الفكرة. قوة في التنفيذ.","about.p1":"هوية مبنية على معنى، مش مجرد شكل.","about.p2":"توجيه إبداعي يحافظ على نفس شخصية البراند في كل نقطة ظهور.","about.p3":"أنظمة رقمية تربط الفكرة بالتشغيل والنمو.",
      "work.kicker":"أعمال مختارة","work.title":"مشاريع اتبنت عشان تشتغل، مش بس تبان حلوة.","work.body":"مشاريع حقيقية بين الهوية والمحتوى والتشغيل والأنظمة الرقمية.","work.loading":"جاري تحميل المشاريع…",
      "services.kicker":"الخدمات","services.title":"اتجاه واحد. تطبيقات متعددة.","services.s1t":"الهوية البصرية","services.s1b":"تسمية وهوية ونظام بصري مبنيين على فكرة واضحة.","services.s2t":"التوجيه الإبداعي","services.s2b":"محتوى وحملات واتساق بصري في كل ظهور للبراند.","services.s3t":"الأنظمة الرقمية","services.s3b":"أدوات وواجهات تشغيلية تحول التفكير الإبداعي لعملية شغل حقيقية.",
      "process.kicker":"الطريقة","process.title":"مسار واضح من الفكرة للتنفيذ.","process.body":"العملية بسيطة: نفهم، نحدد، نبني، ونراجع.","process.p1t":"نفهم","process.p1b":"نفهم المشكلة والجمهور والسياق الحقيقي.","process.p2t":"نحدد","process.p2b":"نحدد الفكرة والنبرة والاتجاه البصري قبل التصميم.","process.p3t":"نبني","process.p3b":"نحوّل الاتجاه لنظام متماسك في كل نقاط الظهور.","process.p4t":"نراجع","process.p4b":"نجرب ونبسط ونحتفظ فقط بما يقوي البراند.",
      "contact.kicker":"تواصل","contact.title":"عندك فكرة تستحق تطلع أقوى؟","contact.body":"ابعت الفكرة. نرتبها، نحدد اتجاهها، ونبنيها بالشكل اللي يليق بيها.","contact.cta":"ابدأ مشروع"
    }
  };
  let lang=localStorage.getItem("amur_lang")||"en";
  if(!["en","ar"].includes(lang))lang="en";
  const text=v=>BI?BI.text(v,lang):String(v||"");

  function applyLang(){
    document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.body.classList.toggle("ar",lang==="ar");
    $$("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;el.textContent=copy[lang][k]||copy.en[k]||el.textContent});
    const btn=$("#langBtn");if(btn)btn.textContent=lang==="en"?"AR":"EN";
    const nav={en:["About","Work","Services","Process","Contact"],ar:["عنّي","الأعمال","الخدمات","الطريقة","تواصل"]};
    $$(".nav-links a").forEach((a,i)=>a.textContent=nav[lang][i]||a.textContent);
    renderProjects(window.__AMUR_PROJECTS||[]);
  }

  function renderProjects(data){
    const grid=$("#projectsGrid");if(!grid)return;
    if(!data.length){grid.innerHTML=`<div class="lead">${lang==="ar"?"لا توجد مشاريع منشورة حاليًا.":"No published projects yet."}</div>`;return}
    grid.innerHTML=data.map((p,i)=>{
      const title=esc(text(p.title)||"AMUR Project"),sub=esc(text(p.subtitle)||""),cat=esc(text(p.category)||"Creative Work"),slug=encodeURIComponent(p.slug||"");
      return `<a class="work-card" href="./project.html?slug=${slug}" style="--project-accent:${esc(p.accent_color||"#b9dceb")}">
        ${p.cover_url?`<img class="work-card-bg" src="${esc(p.cover_url)}" alt="" loading="lazy">`:""}
        <div class="work-card-top"><span>${String(i+1).padStart(2,"0")} / ${cat}</span><span>${lang==="ar"?"دراسة مشروع":"CASE STUDY"} ↗</span></div>
        <div class="work-card-logo">${p.logo_url?`<img src="${esc(p.logo_url)}" alt="${title}" loading="lazy">`:`<strong>${title}</strong>`}</div>
        <div class="work-card-copy"><h3>${title}</h3><p>${sub}</p></div>
      </a>`
    }).join("");
  }

  async function loadProjects(){
    const grid=$("#projectsGrid");
    if(!sb){if(grid)grid.innerHTML=`<div class="lead">${lang==="ar"?"أضف ملف js/config.js لتشغيل المشاريع.":"Add js/config.js to load projects."}</div>`;return}
    const {data,error}=await sb.from("projects").select("*").eq("published",true).order("sort_order",{ascending:true});
    if(error){console.error(error);if(grid)grid.innerHTML=`<div class="lead">${lang==="ar"?"تعذر تحميل المشاريع.":"Unable to load projects."}</div>`;return}
    window.__AMUR_PROJECTS=data||[];renderProjects(window.__AMUR_PROJECTS);
  }

  function setupSceneObserver(){
    const links=$$(".nav-links a");
    const map=new Map(links.map(a=>[a.dataset.nav,a]));
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove("active"));map.get(e.target.dataset.scene)?.classList.add("active")}})
    },{threshold:.55});
    $$("[data-scene]").forEach(s=>io.observe(s));
  }

  $("#langBtn")?.addEventListener("click",()=>{lang=lang==="en"?"ar":"en";localStorage.setItem("amur_lang",lang);applyLang()});
  $("#year").textContent=new Date().getFullYear();
  applyLang();setupSceneObserver();loadProjects();
})();
