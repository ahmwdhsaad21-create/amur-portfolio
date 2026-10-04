
/* ===============================
   V18 — PROJECT STABILITY
   =============================== */
function pxPreload(urls, timeout=4500){
  const unique=[...new Set((urls||[]).filter(Boolean))];
  if(!unique.length)return Promise.resolve();

  return Promise.allSettled(unique.map(url=>new Promise(resolve=>{
    const img=new Image();
    let done=false;
    const finish=()=>{if(done)return;done=true;resolve();};
    img.onload=finish;
    img.onerror=finish;
    img.decoding="async";
    img.src=url;
    if(img.complete)finish();
    setTimeout(finish,timeout);
  })));
}

function pxWireImages(scope=document){
  scope.querySelectorAll("img").forEach(img=>{
    if(img.dataset.pxWired)return;
    img.dataset.pxWired="1";
    const ready=()=>img.classList.add("px-img-ready");
    const fail=()=>img.classList.add("px-img-failed");
    if(img.complete){
      if(img.naturalWidth>0)ready(); else fail();
    }else{
      img.addEventListener("load",ready,{once:true});
      img.addEventListener("error",fail,{once:true});
    }
  });
}

Promise.race([
  document.fonts?.ready || Promise.resolve(),
  new Promise(r=>setTimeout(r,1200))
]).finally(()=>{
  document.documentElement.classList.remove("amur-booting");
  document.documentElement.classList.add("amur-ready");
});

const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

function pxSimpleMobile(){ return matchMedia("(max-width:760px)").matches; }

const cfg=window.AMUR_CONFIG||{};
const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const slug=new URLSearchParams(location.search).get("slug");

const esc=s=>String(s??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

let project=null;
let projectProducts=[];
let projectSections=[];
let projectImages=[];
let steps=[];
let stepEls=[];

function pxLang(){return document.documentElement.lang==="ar"?"ar":"en"}
function pxBi(v){return window.AMUR_BI?AMUR_BI.text(v,pxLang()):String(v??"")}
function pxUi(en,ar){return pxLang()==="ar"?ar:en}

function imageFigure(img, cls=""){
  return `<figure class="px-image ${cls}">
    <img src="${esc(img.image_url||"")}" alt="" loading="lazy">
    ${img.caption?`<figcaption>${esc(pxBi(img.caption))}</figcaption>`:""}
  </figure>`;
}

function sectionStep(sec, imgs, index){
  const key=sec.section_key||"";
  const title=esc(pxBi(sec.title)||"");
  const rawBody=String(pxBi(sec.body)||"").trim();

  const looksTechnical=/\b(alter\s+table|create\s+table|supabase\s+sql\s+editor|add\s+column|update\s+public\.|amur\s+v\d+)\b/i.test(rawBody);
  const safeBody=looksTechnical ? "" : rawBody;

  const body=esc(safeBody).replace(/\n/g,"<br>");
  const eyebrow=esc(pxBi(sec.eyebrow)||key.toUpperCase());
  const no=String(index+2).padStart(2,"0");
  const ratio="auto";
  const hasBody=Boolean(safeBody);
  const longCopy=safeBody.length>650;

  const copy=`
    <div class="px-grid-copy ${hasBody?"has-body":"no-body"} ${longCopy?"long-copy":""}">
      <div class="px-grid-kicker"><span>${no}</span><b>${eyebrow}</b></div>
      <h2 class="px-grid-title">${title}</h2>
      ${hasBody?`<div class="px-grid-body">${body}</div>`:""}
    </div>`;

  if(key==="merch" || key==="merch_auto"){
    const items=projectProducts||[];
    return `
      <article class="px-step px-products-grid" data-step-key="merch_auto">
        <div class="px-products-grid-head">
          <div class="px-grid-kicker"><span>${no}</span><b>${eyebrow||pxUi("Products","المنتجات")}</b></div>
          <h2>${title||pxUi("Products","المنتجات")}</h2>
          ${hasBody?`<div class="px-products-grid-description">${body}</div>`:""}
        </div>

        <div class="px-products-grid-row ${items.length<=3?"fit-three":"many"}" data-product-wall>
          ${items.map((item,i)=>`
            <article class="px-product-grid-item">
              <div class="px-product-viewer active"
                   data-product-viewer
                   data-product-item="${i}"
                   data-motion="${esc(item.motion||"interactive")}">
                <div class="px-product-stage">
                  <div class="px-product-rotor">
                    ${item.front_url?`<div class="px-product-face px-product-front"><img src="${esc(item.front_url)}" alt="${pxUi("Front of ","وش ")}${esc(pxBi(item.title)||pxUi("product","المنتج"))}"></div>`:""}
                    ${item.back_url?`<div class="px-product-face px-product-back"><img src="${esc(item.back_url)}" alt="${pxUi("Back of ","ضهر ")}${esc(pxBi(item.title)||pxUi("product","المنتج"))}"></div>`:""}
                  </div>
                </div>
              </div>
              <div class="px-product-grid-name">
                <span>${String(i+1).padStart(2,"0")}</span>
                <b>${esc(pxBi(item.title)||`${pxUi("Product","منتج")} ${i+1}`)}</b>
              </div>
            </article>
          `).join("")}
        </div>
      </article>`;
  }

  let media = "";
  const singleImageOnly = key==="idea";

  if(singleImageOnly){
    if(imgs[0]) media=imageFigure(imgs[0],`px-grid-image auto-ratio`);
  }else if(imgs.length>=2){
    media=`
      <div class="px-media-deck ratio-auto" data-media-deck data-total="${imgs.length}">
        ${imgs.map((img,i)=>`
          <button class="px-media-card ${i===0?"active":""}" type="button"
                  data-media-card data-index="${i}">
            <img src="${esc(img.image_url||"")}" alt="${esc(pxBi(img.caption)||`${eyebrow} ${i+1}`)}" loading="lazy" draggable="false">
          </button>
        `).join("")}
        <div class="px-media-count"><b>01</b><span>/ ${String(imgs.length).padStart(2,"0")}</span></div>
      </div>`;
  }else if(imgs[0]){
    media=imageFigure(imgs[0],`px-grid-image auto-ratio`);
  }

  const hasMedia=Boolean(media);

  return `
    <article class="px-step px-grid-section ${hasMedia?"has-media":"no-media"} ${hasBody?"has-body":"no-body"} px-grid-${esc(key)} ratio-${ratio}" data-step-key="${esc(key)}">
      <div class="px-layout-grid ratio-auto ${hasMedia?"has-media":"no-media"} ${hasBody?"has-body":"no-body"}">
        ${hasMedia?`<div class="px-grid-visual">${media}</div>`:""}
        ${copy}
      </div>
    </article>`;
}

function introStep(p){
  const logo=p.logo_url?`
    <div class="project-logo-drag px-logo-host" data-brand-rotor>
      <div class="project-logo-rotor">
        <span class="project-logo-face front"><img draggable="false" src="${esc(p.logo_url)}" alt="${esc(p.title||"Project logo")}"></span>
        <span class="project-logo-face back"><img draggable="false" src="${esc(p.logo_url)}" alt=""></span>
      </div>
      <div class="px-logo-grab-layer" data-logo-grab aria-hidden="true"></div>
    </div>`:"";

  return `
    <article class="px-step px-step-intro" data-step-key="intro">
      <div class="px-project-name">${esc(pxBi(p.title)||"")}</div>
      <div class="px-intro-mark">${logo}</div>
      <div class="px-intro-caption"><span>${pxUi("01 / BRAND WORLD","01 / عالم البراند")}</span></div>
    </article>`;
}

async function loadProject(){
  if(!slug)return;

  const {data:p,error}=await sb
    .from("projects")
    .select("*")
    .eq("slug",slug)
    .single();

  if(error){
    console.error(error);
    document.getElementById("pxStage").innerHTML=`<div class="px-load-error">${pxUi('Unable to load this project.','تعذر تحميل المشروع')}</div>`;
    return;
  }

  project=p;

  await Promise.race([
    pxPreload([p.logo_url,p.cover_url].filter(Boolean),3800),
    new Promise(r=>setTimeout(r,4000))
  ]);

  document.title=`${pxBi(p.title)||"AMUR"} — AMUR`;
  document.documentElement.style.setProperty("--project-accent",p.accent_color||"#9d1717");
  document.body.dataset.projectMood=p.mood||"dark";
  document.body.dataset.heroMotion=p.hero_motion||"amur";
  document.body.dataset.heroStyle=p.hero_style||"royal";
  const heroLogoSize=Math.min(145,Math.max(70,Number(p.hero_logo_size||100)));
  document.documentElement.style.setProperty("--hero-logo-scale",String(heroLogoSize/100));

  document.getElementById("pxCategory").textContent=pxBi(p.category)||pxUi("AMUR / PROJECT","AMUR / مشروع");

  const cover=document.getElementById("pxCover");
  if(p.cover_url)cover.style.backgroundImage=`url("${p.cover_url}")`;

  const [
    {data:sections,error:se},
    {data:images,error:ie},
    {data:products,error:pe}
  ]=await Promise.all([
    sb.from("project_sections")
      .select("*")
      .eq("project_id",p.id)
      .eq("enabled",true)
      .order("sort_order"),
    sb.from("project_images")
      .select("*")
      .eq("project_id",p.id)
      .order("sort_order"),
    sb.from("project_products")
      .select("*")
      .eq("project_id",p.id)
      .eq("enabled",true)
      .order("sort_order")
  ]);

  if(se)console.error(se);
  if(ie)console.error(ie);
  if(pe)console.error(pe);

  const merchMeta=(sections||[]).find(s=>s.section_key==="merch")||null;

  const secs=(sections||[])
    .filter(s=>s.section_key!=="merch" && s.enabled!==false)
    .sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));

  const imgs=images||[];
  projectProducts=products||[];
  projectSections=sections||[];
  projectImages=imgs;

  // Start loading the whole case study before the user reaches later stages.
  pxPreload([...imgs.map(x=>x.image_url),...projectProducts.flatMap(x=>[x.front_url,x.back_url])].filter(Boolean),5000);

  const ordered=[];
  const productSection={
    section_key:"merch_auto",
    eyebrow:merchMeta?.eyebrow||pxUi("Products","المنتجات"),
    title:merchMeta?.title||pxUi("Products","المنتجات"),
    body:merchMeta?.body||"",
    image_ratio:"portrait",
    enabled:true
  };

  secs.forEach(sec=>{
    ordered.push(sec);
    if(sec.section_key==="social" && projectProducts.length){
      ordered.push(productSection);
    }
  });

  if(projectProducts.length && !ordered.some(s=>s.section_key==="merch_auto")){
    ordered.push(productSection);
  }

  const html=[
    introStep(p),
    ...ordered.map((sec,i)=>{
      const sectionImages=imgs.filter(img=>(img.section_key||"gallery")===sec.section_key);
      return sectionStep(sec,sectionImages,i);
    })
  ];

  const stage=document.getElementById("pxStage");
  stage.innerHTML=html.join("");

  steps=[{section_key:"intro"},...ordered];
  stepEls=[...document.querySelectorAll(".px-step")];
  pxWireImages(stage);

  const exp=document.getElementById("projectExperience");
  setExperienceHeight();

  initProjectBrandRotors(document);
  initMediaDecks(document);
  initAutoMediaRatios(document);
  initProductViewers(document);
  requestAnimationFrame(()=>fitFixedCopy(document));
  updateExperience();
}

function rerenderLoadedProject(){
  if(!project)return;
  document.title=`${pxBi(project.title)||"AMUR"} — AMUR`;
  const cat=document.getElementById("pxCategory");if(cat)cat.textContent=pxBi(project.category)||pxUi("AMUR / PROJECT","AMUR / مشروع");
  const sections=projectSections||[];
  const merchMeta=sections.find(s=>s.section_key==="merch")||null;
  const secs=sections.filter(s=>s.section_key!=="merch"&&s.enabled!==false).sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));
  const ordered=[];
  const productSection={section_key:"merch_auto",eyebrow:merchMeta?.eyebrow||pxUi("Products","المنتجات"),title:merchMeta?.title||pxUi("Products","المنتجات"),body:merchMeta?.body||"",image_ratio:"portrait",enabled:true};
  secs.forEach(sec=>{ordered.push(sec);if(sec.section_key==="social"&&projectProducts.length)ordered.push(productSection)});
  if(projectProducts.length&&!ordered.some(s=>s.section_key==="merch_auto"))ordered.push(productSection);
  const stage=document.getElementById("pxStage");
  if(!stage)return;
  stage.innerHTML=[introStep(project),...ordered.map((sec,i)=>sectionStep(sec,projectImages.filter(img=>(img.section_key||"gallery")===sec.section_key),i))].join("");
  steps=[{section_key:"intro"},...ordered];stepEls=[...document.querySelectorAll(".px-step")];
  pxWireImages(stage);initProjectBrandRotors(document);initMediaDecks(document);initAutoMediaRatios(document);initProductViewers(document);requestAnimationFrame(()=>fitFixedCopy(document));updateExperience();
}

/* AMUR-like free rotation + inertia + calm return */
function initProjectBrandRotors(scope=document){
  if(pxSimpleMobile()) return;
  const hosts=[...scope.querySelectorAll("[data-brand-rotor]")].filter(el=>!el.dataset.rotorReady);

  hosts.forEach(host=>{
    host.dataset.rotorReady="1";

    const rotor=host.querySelector(".project-logo-rotor");
    const grab=host.querySelector("[data-logo-grab]") || host;
    if(!rotor)return;

    grab.style.pointerEvents="auto";
    grab.style.touchAction="none";
    grab.style.userSelect="none";
    grab.style.webkitUserSelect="none";
    grab.style.cursor="grab";

    host.querySelectorAll("img,.project-logo-face").forEach(el=>{
      el.style.pointerEvents="none";
      el.style.userSelect="none";
      el.style.webkitUserSelect="none";
      try{el.draggable=false}catch(_){}
    });

    let rx=0,ry=0,vx=0,vy=0;
    let down=false,pointerId=null;
    let lx=0,ly=0,lt=performance.now();
    let released=0;
    let idle=0;

    const short=a=>{
      const n=((a%360)+360)%360;
      return n>180?n-360:n;
    };

    const onDown=e=>{
      if(e.pointerType==="mouse" && e.button!==0)return;
      e.preventDefault();

      down=true;
      released=0;
      pointerId=e.pointerId;
      lx=e.clientX;
      ly=e.clientY;
      lt=performance.now();
      vx=0;
      vy=0;

      grab.classList.add("dragging");
      try{grab.setPointerCapture(pointerId)}catch(_){}
    };

    const onMove=e=>{
      if(!down || e.pointerId!==pointerId)return;
      e.preventDefault();

      const n=performance.now();
      const dt=Math.max(8,n-lt);
      const dx=e.clientX-lx;
      const dy=e.clientY-ly;

      ry+=dx*.72;
      rx-=dy*.58;
      vy=dx/dt*15;
      vx=-dy/dt*15;

      lx=e.clientX;
      ly=e.clientY;
      lt=n;
    };

    const onUp=e=>{
      if(!down)return;
      down=false;
      released=performance.now();
      grab.classList.remove("dragging");
      try{grab.releasePointerCapture(pointerId)}catch(_){}
      pointerId=null;
    };

    grab.addEventListener("pointerdown",onDown,{passive:false});
    grab.addEventListener("pointermove",onMove,{passive:false});
    grab.addEventListener("pointerup",onUp);
    grab.addEventListener("pointercancel",onUp);
    grab.addEventListener("lostpointercapture",()=>{
      if(down){
        down=false;
        released=performance.now();
        grab.classList.remove("dragging");
      }
    });
    grab.addEventListener("dragstart",e=>e.preventDefault());

    (function anim(now){
      if(!down){
        rx+=vx;
        ry+=vy;
        vx*=.94;
        vy*=.94;

        if(released && now-released>850 && Math.abs(vx)<.05 && Math.abs(vy)<.05){
          rx-=short(rx)*.055;
          ry-=short(ry)*.055;
        }

        idle+=.009;
      }

      const settled=!down && Math.abs(vx)<.08 && Math.abs(vy)<.08;
      const idleX=settled ? Math.sin(idle*.82)*1.0 : 0;
      const idleY=settled ? Math.cos(idle*.67)*1.25 : 0;
      const idleFloat=settled ? Math.sin(idle)*3 : 0;

      rotor.style.transform=
        `translate3d(0,${idleFloat}px,0) rotateX(${rx+idleX}deg) rotateY(${ry+idleY}deg)`;

      requestAnimationFrame(anim);
    })(performance.now());
  });
}

function getNaturalRatioType(img){
  if(!img || !img.naturalWidth || !img.naturalHeight)return "landscape";
  const r=img.naturalWidth/img.naturalHeight;
  if(r>=1.55)return "wide";
  if(r>=1.12)return "landscape";
  if(r<=0.82)return "portrait";
  return "square";
}

function applyAutoRatio(img,grid){
  if(!img || !grid)return;

  const apply=()=>{
    const type=getNaturalRatioType(img);

    grid.classList.remove(
      "ratio-auto","ratio-wide","ratio-landscape",
      "ratio-square","ratio-portrait","ratio-fill"
    );
    grid.classList.add(`ratio-${type}`);

    const visual=grid.querySelector(".px-grid-visual");
    if(visual)visual.dataset.autoRatio=type;

    const figure=img.closest(".px-grid-image");
    if(figure){
      figure.classList.remove(
        "ratio-auto","ratio-wide","ratio-landscape",
        "ratio-square","ratio-portrait","ratio-fill"
      );
      figure.classList.add(`ratio-${type}`);
    }

    const deck=img.closest(".px-media-deck");
    if(deck){
      deck.classList.remove(
        "ratio-auto","ratio-wide","ratio-landscape",
        "ratio-square","ratio-portrait","ratio-fill"
      );
      deck.classList.add(`ratio-${type}`);
    }
  };

  if(img.complete && img.naturalWidth)apply();
  else img.addEventListener("load",apply,{once:true});
}

function initAutoMediaRatios(scope=document){
  scope.querySelectorAll(".px-layout-grid").forEach(grid=>{
    const deck=grid.querySelector("[data-media-deck]");
    if(deck){
      const active=
        deck.querySelector('[data-media-card][data-offset="0"] img') ||
        deck.querySelector("[data-media-card] img");
      if(active)applyAutoRatio(active,grid);
      return;
    }

    const img=grid.querySelector(".px-grid-visual img");
    if(img)applyAutoRatio(img,grid);
  });
}

function initMediaDecks(scope=document){
  scope.querySelectorAll("[data-media-deck]").forEach(deck=>{
    if(deck.dataset.ready)return;
    deck.dataset.ready="1";

    const cards=[...deck.querySelectorAll("[data-media-card]")];
    const count=deck.querySelector(".px-media-count b");
    if(!cards.length)return;

    let active=0;

    deck.style.pointerEvents="auto";

    cards.forEach(card=>{
      card.style.pointerEvents="auto";
      card.querySelectorAll("img").forEach(img=>{
        img.draggable=false;
        img.style.pointerEvents="none";
        img.style.userSelect="none";
      });
    });

    const render=()=>{
      cards.forEach((card,i)=>{
        const offset=(i-active+cards.length)%cards.length;
        card.dataset.offset=String(offset);
        card.classList.toggle("active",offset===0);
        card.style.setProperty("--deck-offset",String(Math.min(offset,6)));
      });

      if(count)count.textContent=String(active+1).padStart(2,"0");

      const activeImg=cards[active]?.querySelector("img");
      const grid=deck.closest(".px-layout-grid");
      if(activeImg && grid)applyAutoRatio(activeImg,grid);
    };

    cards.forEach(card=>{
      card.addEventListener("click",e=>{
        e.preventDefault();
        e.stopPropagation();

        const clicked=Number(card.dataset.index||0);
        active = clicked===active ? (active+1)%cards.length : clicked;
        render();
      });
    });

    render();
  });
}

function initProductCollections(scope=document){ return; }

function initProductViewers(scope=document){
  if(pxSimpleMobile()) return;
  const viewers=[...scope.querySelectorAll("[data-product-viewer]")].filter(v=>!v.dataset.ready);

  viewers.forEach(viewer=>{
    viewer.dataset.ready="1";
    const rotor=viewer.querySelector(".px-product-rotor");
    if(!rotor)return;

    viewer.style.touchAction="none";
    viewer.style.userSelect="none";
    viewer.querySelectorAll("img").forEach(img=>{
      img.draggable=false;
      img.style.pointerEvents="none";
      img.style.userSelect="none";
      img.style.webkitUserDrag="none";
    });
    viewer.querySelectorAll(".px-product-face").forEach(face=>{
      face.style.pointerEvents="none";
    });

    const motion=viewer.dataset.motion||"interactive";
    let angle=0,target=0,vel=0;
    let down=false,pointerId=null,lx=0,lt=0,released=0;

    const render=()=>{rotor.style.transform=`rotateY(${angle}deg)`};

    if(motion==="static"){render();return}

    if(motion==="hover"){
      viewer.addEventListener("pointerenter",()=>target=180);
      viewer.addEventListener("pointerleave",()=>target=0);
    }

    if(motion==="interactive"){
      const downFn=e=>{
        if(e.pointerType==="mouse" && e.button!==0)return;
        e.preventDefault();
        down=true;
        pointerId=e.pointerId;
        lx=e.clientX;
        lt=performance.now();
        vel=0;
        released=0;
        viewer.classList.add("dragging");
        try{viewer.setPointerCapture(pointerId)}catch(_){}
      };

      const moveFn=e=>{
        if(!down || e.pointerId!==pointerId)return;
        e.preventDefault();
        const now=performance.now();
        const dx=e.clientX-lx;
        const dt=Math.max(8,now-lt);
        angle+=dx*.92;
        vel=(dx/dt)*12;
        lx=e.clientX;
        lt=now;
      };

      const upFn=e=>{
        if(!down)return;
        down=false;
        released=performance.now();
        viewer.classList.remove("dragging");
        try{viewer.releasePointerCapture(pointerId)}catch(_){}
        pointerId=null;
      };

      viewer.addEventListener("pointerdown",downFn,{passive:false});
      viewer.addEventListener("pointermove",moveFn,{passive:false});
      viewer.addEventListener("pointerup",upFn);
      viewer.addEventListener("pointercancel",upFn);
      viewer.addEventListener("lostpointercapture",()=>{
        if(down){
          down=false;
          released=performance.now();
          viewer.classList.remove("dragging");
        }
      });
      viewer.addEventListener("dragstart",e=>e.preventDefault());
    }

    let autoT=0;
    (function animate(now){
      if(motion==="auto"){
        autoT+=.008;
        angle=(Math.sin(autoT)*.5+.5)*180;
      }else if(motion==="hover"){
        angle+=(target-angle)*.085;
      }else if(motion==="interactive"&&!down){
        angle+=vel;
        vel*=.91;
        if(released && now-released>480 && Math.abs(vel)<.07){
          const snap=Math.round(angle/180)*180;
          angle+=(snap-angle)*.095;
        }
      }
      render();
      requestAnimationFrame(animate);
    })(performance.now());
  });
}

function fitFixedCopy(scope=document){
  scope.querySelectorAll(".px-grid-copy").forEach(copy=>{
    copy.style.removeProperty("transform");
    copy.style.removeProperty("font-size");
    const body=copy.querySelector(".px-grid-body");
    if(!body)return;
    body.style.removeProperty("font-size");
  });
}

function setExperienceHeight(){
  const exp=document.getElementById("projectExperience");
  if(!exp || !steps.length)return;
  if(pxSimpleMobile()){ exp.style.height="auto"; return; }
  const mobile=matchMedia("(max-width:760px)").matches;
  const perStep=mobile?118:122;
  exp.style.height=`${Math.max(360,steps.length*perStep)}vh`;
}

function setStep(el,scale,opacity,blur,z,y){
  if(!el)return;
  el.style.transform=`translate3d(0,${y}px,${z}px) scale(${scale})`;
  el.style.opacity=opacity;
  el.style.filter=`blur(${blur}px)`;
  el.style.pointerEvents=opacity>.55?"auto":"none";
}

function updateExperience(){
  const exp=document.getElementById("projectExperience");
  if(!exp||!stepEls.length)return;
  if(pxSimpleMobile()){
    stepEls.forEach(el=>{el.style.transform="none";el.style.opacity="1";el.style.filter="none";el.style.pointerEvents="auto";});
    return;
  }

  const r=exp.getBoundingClientRect();
  const max=Math.max(1,exp.offsetHeight-innerHeight);
  const passed=clamp(-r.top,0,max);
  const p=passed/max;

  const units=stepEls.length;
  const f=Math.min(units-.0001,p*units);
  const idx=Math.min(units-1,Math.floor(f));
  const frac=ease(f-idx);

  stepEls.forEach(el=>setStep(el,.72,0,14,-180,46));

  const cur=stepEls[idx];
  const next=stepEls[Math.min(idx+1,units-1)];

  if(idx===units-1){
    setStep(cur,1,1,0,0,0);
  }else{
    setStep(cur,1-.28*frac,1-frac,12*frac,-170*frac,-34*frac);
    setStep(next,.72+.28*frac,frac,12*(1-frac),-170*(1-frac),46*(1-frac));
  }

  const counter=document.getElementById("pxCounter");
  counter.textContent=`${String(idx+1).padStart(2,"0")} / ${String(units).padStart(2,"0")}`;

  const fill=document.getElementById("pxProgressFill");
  fill.style.width=`${p*100}%`;

  // World follows the story subtly, without circular glow
  const cover=document.getElementById("pxCover");
  if(cover)cover.style.transform=`scale(${1.07+.025*p}) translate3d(0,${-18*p}px,0)`;

  const floor=document.querySelector(".px-chess-floor");
  if(floor)floor.style.transform=`perspective(760px) rotateX(67deg) translateY(${10-18*p}px)`;

  const rim=document.querySelector(".px-rim");
  if(rim)rim.style.opacity=String(.22+.24*Math.sin(p*Math.PI));
}

/* ambient mouse light */
const field=document.getElementById("mouseField");
if(field&&matchMedia("(pointer:fine)").matches){
  let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;
  addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  (function loop(){
    x+=(tx-x)*.04;y+=(ty-y)*.04;
    field.style.transform=`translate3d(${x-450}px,${y-170}px,0)`;
    requestAnimationFrame(loop);
  })();
}

/* magnetic */
if(matchMedia("(pointer:fine)").matches){
  document.querySelectorAll(".magnetic").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate3d(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.14}px,0)`;
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
}

let ticking=false;
function requestUpdate(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(()=>{
    ticking=false;
    updateExperience();
  });
}
addEventListener("scroll",requestUpdate,{passive:true});
addEventListener("resize",requestUpdate,{passive:true});

loadProject();

window.addEventListener("resize",()=>{fitFixedCopy(document);setExperienceHeight();});

/* ===============================
   V32 — PROJECT PAGE LANGUAGE UI
   =============================== */
function projectSetLang(lang){
  lang = lang === "ar" ? "ar" : "en";
  try{ localStorage.setItem("amur-lang",lang); }catch(e){}
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  document.documentElement.dataset.lang=lang;
  document.body.classList.toggle("lang-ar",lang==="ar");
  document.body.classList.toggle("lang-en",lang==="en");

  const back=document.querySelector(".project-back");
  const caption=document.querySelector(".px-nav-meta .nav-caption");
  const exitLabel=document.getElementById("projectExitLabel");
  const exitTitle=document.getElementById("projectExitTitle");
  const exitBack=document.getElementById("projectExitBack");
  const hint=document.querySelector(".px-hint span");
  const btn=document.getElementById("langToggle");
  if(lang==="en"){
    if(back) back.textContent="BACK TO WORK ↗";
    if(caption) caption.textContent="CASE STUDY";
    if(exitLabel) exitLabel.textContent="END OF PROJECT";
    if(exitTitle) exitTitle.innerHTML="FROM IDEA<br>TO OPERATION.";
    if(exitBack) exitBack.textContent="BACK TO ALL WORK ↗";
    if(hint) hint.textContent="SCROLL TO EXPLORE";
    if(btn) btn.textContent="AR";
    if(btn) btn.setAttribute("aria-label","Switch to Arabic");
  }else{
    if(back) back.textContent="رجوع للأعمال ↗";
    if(caption) caption.textContent="دراسة مشروع";
    if(exitLabel) exitLabel.textContent="نهاية المشروع";
    if(exitTitle) exitTitle.innerHTML="من الفكرة<br>لحد التشغيل.";
    if(exitBack) exitBack.textContent="رجوع لكل الأعمال ↗";
    if(hint) hint.textContent="اسحب لاستكشاف المشروع";
    if(btn) btn.textContent="EN";
    if(btn) btn.setAttribute("aria-label","التحويل إلى الإنجليزية");
  }
  if(project) rerenderLoadedProject();
}
function initProjectLanguage(){
  let lang="en";try{lang=localStorage.getItem("amur-lang")||"en"}catch(e){}
  projectSetLang(lang);
  document.getElementById("langToggle")?.addEventListener("click",()=>projectSetLang(document.documentElement.lang==="en"?"ar":"en"));
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initProjectLanguage,{once:true}); else initProjectLanguage();
