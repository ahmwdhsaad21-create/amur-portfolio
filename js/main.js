

/* ===============================

   V18 — STABILITY LAYER

   =============================== */

function amurPreload(urls, timeout=4500){

  const unique=[...new Set((urls||[]).filter(Boolean))];

  if(!unique.length)return Promise.resolve();



  const jobs=unique.map(url=>new Promise(resolve=>{

    const img=new Image();

    let done=false;

    const finish=()=>{ if(done)return; done=true; resolve(); };

    img.onload=finish;

    img.onerror=finish;

    img.decoding="async";

    img.src=url;

    if(img.complete) finish();

    setTimeout(finish,timeout);

  }));



  return Promise.allSettled(jobs);

}



function amurWireImages(scope=document){

  scope.querySelectorAll("img").forEach(img=>{

    if(img.dataset.amurWired)return;

    img.dataset.amurWired="1";



    const ready=()=>{

      img.classList.add("amur-img-ready");

      img.closest(".amur-media-shell")?.classList.add("media-ready");

    };

    const failed=()=>{

      img.classList.add("amur-img-failed");

      img.closest(".amur-media-shell")?.classList.add("media-failed");

    };



    if(img.complete){

      if(img.naturalWidth>0) ready();

      else failed();

    }else{

      img.addEventListener("load",ready,{once:true});

      img.addEventListener("error",failed,{once:true});

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

const header=document.getElementById("siteHeader"),year=document.getElementById("year");

if(year)year.textContent=new Date().getFullYear();

addEventListener("scroll",()=>header?.classList.toggle("scrolled",scrollY>24),{passive:true});



/* Ambient mouse field */

const field=document.getElementById("mouseField");

if(field&&matchMedia("(pointer:fine)").matches){

  let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty;

  addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY},{passive:true});

  (function loop(){

    x+=(tx-x)*.04;y+=(ty-y)*.04;

    field.style.transform=`translate3d(${x-450}px,${y-170}px,0) rotate(${(-8+(x/innerWidth-.5)*5)}deg)`;

    requestAnimationFrame(loop);

  })();

}



/* Icon source + one-shot heavy physics — deferred until ABOUT */

function resolveIcon(img){

  const names=(img.dataset.files||"").split("|").filter(Boolean);let i=0;

  function next(){if(i>=names.length){img.style.display="none";return}img.src=`./assets/icon/${names[i++]}`}

  img.addEventListener("error",next);next();

}

const iconStage=document.getElementById("iconStage");

const icons=[...document.querySelectorAll(".physics-icon")];

icons.forEach(resolveIcon);

let iconPhysicsStarted=false;



function startAboutIconPhysics(){

  if(iconPhysicsStarted || !icons.length) return;

  iconPhysicsStarted=true;

  iconStage?.classList.add("ready");



  const slots=[.08,.21,.34,.49,.64,.78,.89];

  const delays=[0,140,300,70,220,390,470];

  const bodies=icons.map((el,i)=>{

    const size=innerWidth<700?68:108;

    el.style.width=el.style.height=size+"px";

    return{

      el,size,

      x:Math.max(10,(innerWidth-size-20)*slots[i%slots.length]),

      y:-size*(.9+(i%3)*.34),

      vx:(i%2?-.09:.09),

      vy:0,

      r:i*16,

      spin:(i%2?-1:1)*(.22+i*.018),

      delay:delays[i%delays.length],

      started:false,b:0,settled:0,o:1

    };

  });



  const start=performance.now();let prev=start;

  (function step(now){

    const dt=Math.min((now-prev)/16.67,1.45);prev=now;

    let alive=0;

    bodies.forEach(o=>{

      if(o.o<=.001){o.el.style.opacity=0;return}

      alive++;

      if(!o.started){if(now-start<o.delay)return;o.started=true}

      const floor=innerHeight-o.size-18,maxX=innerWidth-o.size-12;

      if(!o.settled){

        o.vy+=.14*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.r+=o.spin*dt;

        if(o.x<10){o.x=10;o.vx=Math.abs(o.vx)*.52}

        if(o.x>maxX){o.x=maxX;o.vx=-Math.abs(o.vx)*.52}

        if(o.y>=floor){

          o.y=floor;o.b++;

          const imp=Math.abs(o.vy);

          if(o.b>=2||imp<.78){o.vy=o.vx=o.spin=0;o.settled=now}

          else{o.vy=-imp*.34;o.vx*=.86;o.spin*=.52}

        }

      }else{

        const t=now-o.settled;

        if(t>700){

          const p=Math.min(1,(t-700)/1600);

          o.o=1-(1-Math.pow(1-p,3));

        }

      }

      o.el.style.opacity=o.o;

      o.el.style.transform=`translate3d(${o.x}px,${o.y}px,0) rotate(${o.r}deg)`;

    });

    if(alive)requestAnimationFrame(step);

    else{

      iconStage?.classList.remove("ready");

      iconStage?.classList.add("finished");

    }

  })(start);

}



/* Logo 360 free rotation + inertia */

const drag=document.getElementById("logoDrag"),rotor=document.getElementById("logoRotor");

if(drag&&rotor){

  let rx=0,ry=0,vx=0,vy=0,down=false,lx=0,ly=0,lt=performance.now(),released=0;

  drag.addEventListener("pointerdown",e=>{down=true;released=0;lx=e.clientX;ly=e.clientY;lt=performance.now();drag.setPointerCapture?.(e.pointerId)});

  drag.addEventListener("pointermove",e=>{

    if(!down)return;

    const n=performance.now(),dt=Math.max(8,n-lt),dx=e.clientX-lx,dy=e.clientY-ly;

    ry+=dx*.72;rx-=dy*.58;vy=dx/dt*15;vx=-dy/dt*15;lx=e.clientX;ly=e.clientY;lt=n;

  });

  const up=e=>{if(!down)return;down=false;released=performance.now();try{drag.releasePointerCapture?.(e.pointerId)}catch{}};

  drag.addEventListener("pointerup",up);drag.addEventListener("pointercancel",up);

  const short=a=>{const n=((a%360)+360)%360;return n>180?n-360:n};

  (function anim(now){

    if(!down){

      rx+=vx;ry+=vy;vx*=.94;vy*=.94;

      if(released&&now-released>850&&Math.abs(vx)<.05&&Math.abs(vy)<.05){

        rx-=short(rx)*.055;ry-=short(ry)*.055;

      }

    }

    rotor.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;

    requestAnimationFrame(anim);

  })(performance.now());

}



/* Magnetic links */

if(matchMedia("(pointer:fine)").matches){

  document.querySelectorAll(".magnetic").forEach(el=>{

    el.addEventListener("pointermove",e=>{

      const r=el.getBoundingClientRect();

      el.style.transform=`translate3d(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.14}px,0)`;

    });

    el.addEventListener("pointerleave",()=>el.style.transform="");

  });

}



/* MASTER EASING — declared before the pinned story to avoid TDZ crashes */
const premiumEase=t=>{
  t=clamp(t,0,1);
  if(t<.8){
    const x=t/.8;
    return .82*(1-Math.pow(1-x,3));
  }
  const x=(t-.8)/.2;
  return .82+.18*(1-Math.pow(1-x,5));
};

/* MASTER PINNED STORY — Active Theory style */

const story=document.querySelector(".story");

const scenes=[...document.querySelectorAll(".scene")];

const processCards=[...document.querySelectorAll(".process-card")];

const timelineFill=document.getElementById("timelineFill");

const portrait=document.getElementById("aboutPortrait");

const brushA=document.querySelector(".brush-a");

const brushB=document.querySelector(".brush-b");

const cgrid=document.querySelector(".construction-grid");



function setSceneVisual(scene,scale,opacity,blur,z){

  scene.style.transform=`scale(${scale}) translateZ(${z}px)`;

  scene.style.opacity=opacity;

  scene.style.filter=`blur(${blur}px)`;

  scene.classList.toggle("active",opacity>.45);

}



function updateStory(){

  if(!story||!scenes.length)return;



  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  // timeline lengths (sum = 1)

  // hero hold, H>A, about hold, A>W, work intro/hold, W>S, services hold, S>P, process

  const cuts=[0,.07,.15,.25,.33,.53,.61,.71,.79,1];



  const local=(a,b)=>clamp((p-a)/(b-a),0,1);

  const xfade=(from,to,t)=>{

    const e=(typeof premiumEase==="function"?premiumEase(t):ease(t));

    setSceneVisual(scenes[from],1-.28*e,1-e,14*e,-160*e);

    setSceneVisual(scenes[to],.72+.28*e,e,14*(1-e),-160*(1-e));

  };



  scenes.forEach(s=>setSceneVisual(s,.72,0,14,-160));



  // HERO HOLD

  if(p<cuts[1]){

    setSceneVisual(scenes[0],1,1,0,0);

  }

  // HERO -> ABOUT

  else if(p<cuts[2]){

    xfade(0,1,local(cuts[1],cuts[2]));

  }

  // ABOUT HOLD

  else if(p<cuts[3]){

    setSceneVisual(scenes[1],1,1,0,0);

    if(portrait){

      const q=ease(local(cuts[2],cuts[3]));

      portrait.style.transform=`translate3d(0,${(1-q)*90}px,0) scale(${.76+.24*q})`;

      portrait.style.opacity=1;

    }

  }

  // ABOUT -> WORK

  else if(p<cuts[4]){

    const q=local(cuts[3],cuts[4]);

    xfade(1,2,q);

    if(portrait){

      const e=ease(q);

      portrait.style.transform=`translate3d(0,${-70*e}px,0) scale(${1-.26*e})`;

      portrait.style.opacity=1-e;

    }

  }

  // WORK — long readable hold

  else if(p<cuts[5]){

    setSceneVisual(scenes[2],1,1,0,0);

  }

  // WORK -> SERVICES

  else if(p<cuts[6]){

    xfade(2,3,local(cuts[5],cuts[6]));

  }

  // SERVICES HOLD

  else if(p<cuts[7]){

    setSceneVisual(scenes[3],1,1,0,0);

  }

  // SERVICES -> PROCESS

  else if(p<cuts[8]){

    xfade(3,4,local(cuts[7],cuts[8]));

  }

  // PROCESS pinned internal sequence

  else{

    setSceneVisual(scenes[4],1,1,0,0);



    const pp=local(cuts[8],cuts[9]);

    const stepFloat=Math.min(processCards.length-.0001,pp*processCards.length);

    const idx=Math.min(processCards.length-1,Math.floor(stepFloat));

    const frac=(typeof premiumEase==="function"?premiumEase(stepFloat-idx):ease(stepFloat-idx));



    processCards.forEach((card,i)=>{

      card.classList.remove("active");

      card.style.opacity=0;

      card.style.filter="blur(12px)";

      card.style.transform="scale(.68) translateZ(-160px)";

    });



    const current=processCards[idx];

    const next=processCards[Math.min(idx+1,processCards.length-1)];



    if(idx===processCards.length-1){

      current.classList.add("active");

      current.style.opacity=1;

      current.style.filter="blur(0)";

      current.style.transform="scale(1) translateZ(0)";

    }else{

      current.style.opacity=1-frac;

      current.style.filter=`blur(${12*frac}px)`;

      current.style.transform=`scale(${1-.32*frac}) translateZ(${-160*frac}px)`;



      next.classList.add("active");

      next.style.opacity=frac;

      next.style.filter=`blur(${12*(1-frac)}px)`;

      next.style.transform=`scale(${.68+.32*frac}) translateZ(${-160*(1-frac)}px)`;

    }



    if(timelineFill)timelineFill.style.width=`${pp*100}%`;

  }



  // Hero background only reacts while hero exists.

  const heroProgress=clamp(p/cuts[2],0,1);

  if(brushA)brushA.style.transform=`translate3d(${heroProgress*44}px,${heroProgress*66}px,0) rotate(-10deg) scale(${1+heroProgress*.04})`;

  if(brushB)brushB.style.transform=`translate3d(${heroProgress*-30}px,${heroProgress*42}px,0) rotate(7deg)`;

  if(cgrid)cgrid.style.transform=`translate3d(0,${heroProgress*25}px,0) scale(${1+heroProgress*.02})`;

}

addEventListener("scroll",()=>requestAnimationFrame(updateStory),{passive:true});

addEventListener("resize",()=>requestAnimationFrame(updateStory),{passive:true});

updateStory();



/* Supabase editorial work list */

const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");


function amurLang(){return document.documentElement.lang==="ar"?"ar":"en"}
function amurBi(v){return window.AMUR_BI?AMUR_BI.text(v,amurLang()):String(v??"")}
function amurUi(en,ar){return amurLang()==="ar"?ar:en}

async function loadProjects(){

  const grid=document.getElementById("projectsGrid"),cfg=window.AMUR_CONFIG;

  if(!grid)return;

  if(typeof supabase==="undefined"||!cfg?.SUPABASE_URL||!cfg?.SUPABASE_ANON_KEY){

    grid.innerHTML=`<p class="status">${amurUi('Unable to connect to selected work right now.','تعذر ربط الأعمال حاليًا.')}</p>`;return;

  }

  grid.innerHTML=`

    <div class="work-stable-loader" aria-hidden="true">

      <span></span><span></span><span></span>

    </div>`;

  try{

    const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);

    const {data,error}=await sb.from("projects").select("*").order("sort_order",{ascending:true});

    if(error)throw error;

    if(!data?.length){grid.innerHTML=`<p class="status">${amurUi('No published work yet.','لا توجد أعمال منشورة حاليًا.')}</p>`;return}



    const criticalAssets=data.flatMap(p=>[p.logo_url,p.cover_url]).filter(Boolean);

    await Promise.race([

      amurPreload(criticalAssets,3800),

      new Promise(r=>setTimeout(r,4000))

    ]);



    grid.innerHTML=`

      <div class="work-horizontal-track" id="workHorizontalTrack">

        ${data.map((p,i)=>{

          const title=esc(amurBi(p.title)||"AMUR Project");

          const sub=esc(amurBi(p.subtitle)||amurUi("A case study built around the idea, system and impact.","دراسة مشروع مبنية على الفكرة، النظام، والأثر."));

          const cat=esc(amurBi(p.category)||amurUi("Creative Work","عمل إبداعي"));

          const slug=encodeURIComponent(p.slug||"");

          const accent=esc(p.accent_color||"#b9dceb");

          const mood=esc(p.mood||"dark");

          const bg=p.cover_url

            ? `<img class="work-h-bg" src="${esc(p.cover_url)}" alt="" loading="eager" decoding="async">`

            : "";

          const logo=p.logo_url

            ? `<img class="work-h-logo" src="${esc(p.logo_url)}" alt="${title}" loading="eager" decoding="async">`

            : `<div class="work-h-placeholder">${title}</div>`;



          return `

            <a class="work-logo-scene mood-${mood}" href="./project.html?slug=${slug}" data-work-card="${i}" style="--project-accent:${accent}">

              <div class="work-logo-atmosphere">

                ${bg}

                <span class="work-logo-darken"></span>

                <span class="work-logo-halo"></span>

                <span class="work-logo-lines"></span>

              </div>



              <div class="work-logo-top">

                <span>${String(i+1).padStart(2,"0")} / ${cat}</span>

                <b>${amurUi("CASE STUDY ↗","دراسة مشروع ↗")}</b>

              </div>



              <div class="work-logo-center">

                ${p.logo_url ? `

                  <div class="project-logo-drag work-logo-rotor-host" data-brand-rotor>

                    <div class="project-logo-rotor">

                      <span class="project-logo-face front"><img src="${esc(p.logo_url)}" alt="${title}" loading="eager" decoding="async"></span>

                      <span class="project-logo-face back"><img src="${esc(p.logo_url)}" alt="" loading="eager" decoding="async"></span>

                    </div>

                  </div>` : logo}

              </div>



              <div class="work-logo-bottom">

                <h3>${title}</h3>

                <p>${sub}</p>

              </div>

            </a>`;

        }).join("")}

      </div>

      <div class="work-horizontal-progress" aria-hidden="true">

        <i id="workHorizontalProgress"></i>

      </div>`;

    requestAnimationFrame(()=>{

      amurWireImages(grid);

      if(typeof initProjectBrandRotors==="function") initProjectBrandRotors(document);

      updateHorizontalWork();

    });

  }catch(e){

    console.error(e);grid.innerHTML=`<p class="status">${amurUi('Unable to load selected work right now.','تعذر تحميل الأعمال حاليًا.')}</p>`;

  }

}

loadProjects();





/* ===============================

   V2 — SCENE NAVIGATION + BACKGROUND + IDEA GATHER

   =============================== */

const navSceneLinks=[...document.querySelectorAll("[data-jump]")];

const contactJump=document.querySelector("[data-contact-jump]");

const ideaCluster=document.getElementById("ideaCluster");

const ideaPieces=ideaCluster ? [...ideaCluster.querySelectorAll(".idea-piece")] : [];

const workHead=document.querySelector(".scene-work .work-head");

const workList=document.querySelector(".scene-work .work-list");

const globalBrushes=[...document.querySelectorAll(".global-brush")];

const globalLines=[...document.querySelectorAll(".global-line")];

const globalOrbs=[...document.querySelectorAll(".global-orb")];



function storyScrollForUnit(unit){

  if(!story) return 0;

  const maxScroll=story.offsetHeight-innerHeight;

  // Exact scene anchors in V3 timeline:

  const anchors={0:.02,1:.19,2:.40,3:.61,4:.78};

  const p=anchors[unit] ?? 0;

  return story.offsetTop + p*maxScroll;

}



navSceneLinks.forEach(link=>{

  link.addEventListener("click",e=>{

    e.preventDefault();

    const unit=Number(link.dataset.jump||0);

    scrollTo({top:storyScrollForUnit(unit),behavior:"smooth"});

  });

});



contactJump?.addEventListener("click",e=>{

  e.preventDefault();

  document.getElementById("contact")?.scrollIntoView({behavior:"smooth"});

});



function updateActiveNav(unit){

  const nearest = unit < .55 ? 0 : unit < 1.55 ? 1 : unit < 2.55 ? 2 : unit < 3.55 ? 3 : 4;

  document.body.dataset.scene=String(nearest);

  navSceneLinks.forEach(a=>a.classList.toggle("active",Number(a.dataset.jump)===nearest));

}



/* one-time scattered -> gather animation inside WORK scene */

function updateIdeaGather(p){

  if(!ideaCluster || !ideaPieces.length) return;



  // WORK comes fully on at ~.33 and stays until ~.49.

  // Gather quickly, then disappear so the actual projects can sit cleanly and be read.

  const gather=(typeof premiumEase==="function"?premiumEase(clamp((p-.325)/.045,0,1)):ease(clamp((p-.325)/.045,0,1)));

  const clusterFade=clamp((p-.382)/.035,0,1);



  const scatter=[

    [-210,-120,-20,1.15],

    [220,-105,15,.9],

    [-145,115,-10,1.0],

    [205,95,12,1.0],

    [-260,25,-26,.9],

    [270,20,20,.85],

    [0,160,0,.8]

  ];



  ideaCluster.style.opacity=String((p>.31?1:0)*(1-clusterFade));



  ideaPieces.forEach((el,i)=>{

    const s=scatter[i%scatter.length];

    const x=s[0]*(1-gather),y=s[1]*(1-gather),r=s[2]*(1-gather);

    const scale=.60+.40*gather;

    el.style.opacity=String((1-clusterFade)*clamp((p-.31)/.025,0,1));

    el.style.filter=`blur(${(1-gather)*7}px)`;

    el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${scale})`;

  });



  // Content becomes perfectly clear and remains parked for the whole work hold.

  const content=(typeof premiumEase==="function"?premiumEase(clamp((p-.355)/.055,0,1)):ease(clamp((p-.355)/.055,0,1)));



  if(workHead){

    workHead.style.opacity=content;

    workHead.style.filter=`blur(${(1-content)*8}px)`;

    workHead.style.transform=`translate3d(0,${(1-content)*34}px,0) scale(${.96+.04*content})`;

  }

  if(workList){

    const c2=(typeof premiumEase==="function"?premiumEase(clamp((p-.37)/.06,0,1)):ease(clamp((p-.37)/.06,0,1)));

    workList.style.opacity=c2;

    workList.style.filter=`blur(${(1-c2)*8}px)`;

    workList.style.transform=`translate3d(0,${(1-c2)*42}px,0) scale(${.965+.035*c2})`;

  }

}



function updateLivingBackground(u){

  globalBrushes.forEach((el,i)=>{

    const sx=(i%2?-1:1);

    el.style.transform=`translate3d(${u*18*sx}px,${u*(9+i*3)}px,0) rotate(${[-9,7,-2][i]||0}deg)`;

    el.style.opacity=String(.045 + .012*Math.sin(u*.9+i));

  });

  globalLines.forEach((el,i)=>{

    el.style.transform=`translate3d(${u*(i? -12:14)}px,${u*(i? 7:5)}px,0) rotate(${i?4:-5}deg)`;

  });

  globalOrbs.forEach((el,i)=>{

    el.style.transform=`translate3d(${u*(i? -16:12)}px,${u*(i? -10:8)}px,0) scale(${1+u*.008})`;

  });

}



/* extend master story with nav/background/about-icon/work-gather hooks */

let v2Tick=false;

function updateV2(){

  v2Tick=false;

  if(!story) return;



  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  // Convert p to a scene identity only for UI/nav/background mood.

  const sceneIndex = p < .11 ? 0 : p < .29 ? 1 : p < .53 ? 2 : p < .71 ? 3 : 4;

  document.body.dataset.scene=String(sceneIndex);

  navSceneLinks.forEach(a=>a.classList.toggle("active",Number(a.dataset.jump)===sceneIndex));



  updateLivingBackground(p*8);

  updateIdeaGather(p);



  // Trigger icons only in About; once only.

  if(p>=.12 && p<=.30) startAboutIconPhysics();

}

function requestV2(){

  if(!v2Tick){v2Tick=true;requestAnimationFrame(updateV2)}

}

addEventListener("scroll",requestV2,{passive:true});

addEventListener("resize",requestV2,{passive:true});

requestV2();





/* ===============================

   V4 POLISH HOOKS

   =============================== */

const sceneCountEl=document.getElementById("sceneCount");

const workBeat=document.getElementById("workBeat");



/* smoother scene curve uses the master premiumEase declared above */



/* override scene transition math with premium easing */

const originalSetSceneVisual=setSceneVisual;

setSceneVisual=(scene,scale,opacity,blur,z)=>{

  originalSetSceneVisual(scene,scale,opacity,blur,z);

};



/* sync header scene counter */

function updateSceneCounter(){

  if(!story || !sceneCountEl) return;

  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;

  const idx=p<.11?0:p<.29?1:p<.53?2:p<.71?3:4;

  sceneCountEl.textContent=`${String(idx+1).padStart(2,"0")} / 05`;

}



/* Make project idea gather visibly staggered and then fully settle */

function updateWorkPolish(){

  if(!story || !ideaPieces.length) return;

  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  // Stagger each creative element very slightly

  ideaPieces.forEach((el,i)=>{

    const start=.318+i*.0065;

    const end=start+.052;

    const g=premiumEase(clamp((p-start)/(end-start),0,1));

    const fade=clamp((p-.382)/.035,0,1);

    const scatter=[

      [-210,-120,-20],

      [220,-105,15],

      [-145,115,-10],

      [205,95,12],

      [-260,25,-26],

      [270,20,20],

      [0,160,0]

    ][i%7];

    const x=scatter[0]*(1-g),y=scatter[1]*(1-g),r=scatter[2]*(1-g);

    el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${.58+.42*g})`;

    el.style.opacity=String(clamp((p-(start-.015))/.03,0,1)*(1-fade));

    el.style.filter=`blur(${(1-g)*7}px)`;

  });



  if(workBeat){

    const show=p>.405 && p<.495;

    workBeat.classList.toggle("ready",show);

  }

}



/* About portrait — stronger "small from depth -> full presence" */

function updateAboutPortraitPolish(){

  if(!story || !portrait) return;

  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  // Stronger only during About window

  const enter=premiumEase(clamp((p-.105)/.095,0,1));

  const leave=premiumEase(clamp((p-.255)/.075,0,1));



  if(p>=.095 && p<=.335){

    const scale=(.56+.47*enter)*(1-.20*leave);

    const y=150*(1-enter)-72*leave;

    const x=28*(1-enter);

    const rot=2.6*(1-enter)-1.2*leave;

    portrait.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${rot}deg)`;

    portrait.style.opacity=String(clamp(enter*(1-.9*leave),0,1));

  }

}



/* background layers breathe more clearly, still subtle */

function updateBackgroundPolish(){

  if(!story) return;

  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  const gb=[...document.querySelectorAll(".global-brush")];

  const gl=[...document.querySelectorAll(".global-line")];

  gb.forEach((el,i)=>{

    const dir=i%2?-1:1;

    const drift=(p*120)*(i+1)*.32;

    el.style.transform=`translate3d(${drift*dir}px,${p*(22+i*12)}px,0) rotate(${[-9,7,-2][i]||0}deg) scale(${1+p*.025})`;

  });

  gl.forEach((el,i)=>{

    el.style.opacity=String(.30+.12*Math.sin(p*Math.PI*2+i));

  });

}



let v4Tick=false;

function updateV4(){

  v4Tick=false;

  updateSceneCounter();

  updateWorkPolish();

  updateAboutPortraitPolish();

  updateBackgroundPolish();

}

function requestV4(){

  if(!v4Tick){

    v4Tick=true;

    requestAnimationFrame(updateV4);

  }

}

addEventListener("scroll",requestV4,{passive:true});

addEventListener("resize",requestV4,{passive:true});

requestV4();





/* ===============================

   V5 — SERVICES + PROCESS INTERNAL MOTION

   =============================== */

const serviceRows=[...document.querySelectorAll(".service-row[data-service]")];

const serviceDots=[...document.querySelectorAll(".service-dot")];

const processDots=[...document.querySelectorAll(".process-dots b")];

const depthRings=[...document.querySelectorAll(".depth-ring")];



function setServiceState(index, frac=0){

  if(!serviceRows.length) return;

  serviceRows.forEach((row,i)=>{

    row.classList.remove("active");

    row.style.opacity=0;

    row.style.filter="blur(12px)";

    row.style.transform="scale(.68) translateZ(-160px)";

  });



  const current=serviceRows[index];

  const next=serviceRows[Math.min(index+1,serviceRows.length-1)];



  if(index===serviceRows.length-1){

    current.classList.add("active");

    current.style.opacity=1;

    current.style.filter="blur(0)";

    current.style.transform="scale(1) translateZ(0)";

  }else{

    current.style.opacity=1-frac;

    current.style.filter=`blur(${11*frac}px)`;

    current.style.transform=`scale(${1-.30*frac}) translateZ(${-145*frac}px)`;



    next.classList.add("active");

    next.style.opacity=frac;

    next.style.filter=`blur(${11*(1-frac)}px)`;

    next.style.transform=`scale(${.70+.30*frac}) translateZ(${-145*(1-frac)}px)`;

  }



  serviceDots.forEach((d,i)=>d.classList.toggle("active",i===Math.min(index+(frac>.55?1:0),serviceDots.length-1)));

}



function updateServicesAndProcess(){

  if(!story) return;



  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const passed=clamp(-rect.top,0,maxScroll);

  const p=maxScroll>0?passed/maxScroll:0;



  /* SERVICES local progress starts exactly with the Services scene. */

  const servicesStart=.61, servicesEnd=.71;
  const sp=clamp((p-servicesStart)/(servicesEnd-servicesStart),0,.9999);

  if(p>=servicesStart && p<=servicesEnd && serviceRows.length){

    const sf=Math.min(serviceRows.length-.0001,sp*serviceRows.length);

    const idx=Math.min(serviceRows.length-1,Math.floor(sf));

    const frac=(typeof premiumEase==="function"?premiumEase(sf-idx):ease(sf-idx));

    setServiceState(idx,frac);

  }



  /* PROCESS local progress starts exactly with the Process scene. */

  const processStart=.79, processEnd=1;
  if(p>=processStart && depthRings.length){

    const pp=clamp((p-processStart)/(processEnd-processStart),0,1);

    depthRings.forEach((ring,i)=>{

      const speed=(i+1)*.65;

      const scale=1+pp*.14*speed;

      const rot=(i%2?-1:1)*pp*(10+i*5);

      ring.style.transform=`scale(${scale}) rotate(${rot}deg)`;

      ring.style.opacity=String(.44-(pp*.08*i));

    });



    const stepFloat=Math.min(3.9999,pp*4);

    const idx=Math.min(3,Math.floor(stepFloat));

    const frac=stepFloat-idx;

    processDots.forEach((d,i)=>d.classList.toggle("active",i===Math.min(idx+(frac>.55?1:0),3)));

  }

}



let v5Tick=false;

function requestV5(){

  if(!v5Tick){

    v5Tick=true;

    requestAnimationFrame(()=>{

      v5Tick=false;

      updateServicesAndProcess();

    });

  }

}

addEventListener("scroll",requestV5,{passive:true});

addEventListener("resize",requestV5,{passive:true});

requestV5();





/* ===============================

   V6 — FINAL CONTACT SCENE

   =============================== */

const contact=document.getElementById("contact");

const contactInner=document.getElementById("contactInner");

const contactPieces=[...document.querySelectorAll(".contact-piece")];

const contactGiant=document.getElementById("contactGiant");

const contactRings=[...document.querySelectorAll(".contact-ring")];

const contactLines=[...document.querySelectorAll(".contact-line")];



function updateContactScene(){

  if(!contact) return;



  const r=contact.getBoundingClientRect();

  const vh=window.innerHeight;



  // Contact starts small/deep and settles as it enters.

  const enterRaw=clamp((vh-r.top)/(vh*.82),0,1);

  const enter=(typeof premiumEase==="function"?premiumEase(enterRaw):ease(enterRaw));



  // slight exit softness if user scrolls beyond it

  const exit=clamp((-r.top-r.height*.62)/(r.height*.26),0,1);



  contactPieces.forEach((el,i)=>{

    const delay=i*.08;

    const p=clamp((enter-delay)/(1-delay),0,1);

    const e=(typeof premiumEase==="function"?premiumEase(p):ease(p));



    const scale=.78+.22*e;

    const y=86*(1-e)-28*exit;

    const opacity=e*(1-.78*exit);



    el.style.transform=`translate3d(0,${y}px,0) scale(${scale})`;

    el.style.opacity=opacity;

    el.style.filter=`blur(${(1-e)*10 + exit*4}px)`;

  });



  if(contactGiant){

    const s=.74+.36*enter;

    contactGiant.style.transform=`translateX(-50%) translateY(${(1-enter)*40}px) scale(${s})`;

    contactGiant.style.opacity=String(.018+.055*enter);

  }



  contactRings.forEach((ring,i)=>{

    const dir=i%2?-1:1;

    ring.style.transform=`translate(-50%,-50%) scale(${.84+enter*(.18+i*.05)}) rotate(${dir*enter*(7+i*4)}deg)`;

    ring.style.opacity=String(.18+.26*enter);

  });



  contactLines.forEach((line,i)=>{

    const dir=i%2?-1:1;

    line.style.transform=`translateX(${dir*(1-enter)*80}px) rotate(${i?5:-7}deg)`;

    line.style.opacity=String(.18+.42*enter);

  });

}



/* Mobile-aware story pacing:

   desktop stays cinematic/heavy, phones get shorter scroll travel without changing sequence. */

function applyResponsiveStoryHeight(){

  if(!story) return;

  if(innerWidth<=430) story.style.height="1120vh";

  else if(innerWidth<=700) story.style.height="1180vh";

  else if(innerWidth<=1050) story.style.height="1360vh";

  else story.style.height="1420vh";

}

applyResponsiveStoryHeight();



let v6Tick=false;

function requestV6(){

  if(v6Tick) return;

  v6Tick=true;

  requestAnimationFrame(()=>{

    v6Tick=false;

    updateContactScene();

  });

}

addEventListener("scroll",requestV6,{passive:true});

addEventListener("resize",()=>{

  applyResponsiveStoryHeight();

  requestV6();

},{passive:true});

requestV6();





/* ===============================

   V10 — WORK HORIZONTAL PINNED SCROLL

   =============================== */

function updateHorizontalWork(){
  const track=document.getElementById("workHorizontalTrack");
  if(!track) return;
  const cards=[...track.querySelectorAll(".work-logo-scene")];
  if(!cards.length) return;

  // V32: all projects stay visible side-by-side. No story-scroll translation.
  track.style.transform="none";
  cards.forEach(card=>card.classList.add("is-active"));

  const viewport=document.querySelector(".scene-work .work-list");
  const progress=document.getElementById("workHorizontalProgress");
  if(!viewport || !progress) return;
  const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  const ratio=max?Math.abs(viewport.scrollLeft)/max:1;
  progress.style.width=`${Math.max(8,Math.min(100,ratio*100))}%`;
}

let v10WorkTick=false;

function requestHorizontalWork(){

  if(v10WorkTick)return;

  v10WorkTick=true;

  requestAnimationFrame(()=>{

    v10WorkTick=false;

    updateHorizontalWork();

  });

}

addEventListener("scroll",requestHorizontalWork,{passive:true});

addEventListener("resize",requestHorizontalWork,{passive:true});

setTimeout(requestHorizontalWork,350);





/* ===============================

   V12 — 360 PROJECT BRAND LOGOS

   =============================== */

function initProjectBrandRotors(scope=document){

  const hosts=[...scope.querySelectorAll("[data-brand-rotor]")].filter(el=>!el.dataset.rotorReady);



  hosts.forEach(host=>{

    host.dataset.rotorReady="1";

    const rotor=host.querySelector(".project-logo-rotor");

    if(!rotor)return;



    let rx=0,ry=0,vx=0,vy=0,down=false,lx=0,ly=0,lt=performance.now(),released=0,idle=0;



    host.addEventListener("pointerdown",e=>{

      down=true;

      released=0;

      lx=e.clientX;ly=e.clientY;lt=performance.now();

      host.classList.add("dragging");

      host.setPointerCapture?.(e.pointerId);

    });



    host.addEventListener("pointermove",e=>{

      if(!down)return;

      const n=performance.now();

      const dt=Math.max(8,n-lt);

      const dx=e.clientX-lx,dy=e.clientY-ly;



      ry+=dx*.72;

      rx-=dy*.58;

      vy=dx/dt*15;

      vx=-dy/dt*15;



      lx=e.clientX;ly=e.clientY;lt=n;

    });



    const up=e=>{

      if(!down)return;

      down=false;

      released=performance.now();

      host.classList.remove("dragging");

      try{host.releasePointerCapture?.(e.pointerId)}catch{}

    };



    host.addEventListener("pointerup",up);

    host.addEventListener("pointercancel",up);



    const short=a=>{

      const n=((a%360)+360)%360;

      return n>180?n-360:n;

    };



    (function anim(now){

      if(!down){

        rx+=vx;ry+=vy;

        vx*=.94;vy*=.94;



        if(released && now-released>850 && Math.abs(vx)<.05 && Math.abs(vy)<.05){

          rx-=short(rx)*.055;

          ry-=short(ry)*.055;

        }



        idle+=.012;

      }



      const floatY=Math.sin(idle)*2.5;

      rotor.style.transform=`translate3d(0,${floatY}px,0) rotateX(${rx}deg) rotateY(${ry}deg)`;

      requestAnimationFrame(anim);

    })(performance.now());

  });

}



function syncWorkIconVisibility(){

  if(!story)return;

  const iconStage=document.getElementById("iconStage");

  if(!iconStage)return;

  const rect=story.getBoundingClientRect();

  const maxScroll=story.offsetHeight-innerHeight;

  const p=maxScroll>0?clamp(-rect.top,0,maxScroll)/maxScroll:0;

  const inWork=p>=.305 && p<=.545;

  iconStage.classList.toggle("force-hidden",inWork);

}

addEventListener("scroll",()=>requestAnimationFrame(syncWorkIconVisibility),{passive:true});

addEventListener("resize",()=>requestAnimationFrame(syncWorkIconVisibility),{passive:true});

syncWorkIconVisibility();


/* =========================================================
   RETURN TO PROJECTS — pinned WORK scene hash resolver
   ========================================================= */
function amurOpenProjectsFromHash(){
  if(location.hash !== "#projectsGrid") return;

  const go = ()=>{
    if(typeof storyScrollForUnit !== "function") return;

    // WORK is scene unit 2 in the pinned AMUR story.
    const target = storyScrollForUnit(2);

    // Jump directly, because a normal anchor cannot position a pinned scene correctly.
    window.scrollTo({ top: target, behavior: "auto" });

    // Re-run visual state after the browser has landed there.
    requestAnimationFrame(()=>{
      try{ updateStory(); }catch(_){}
      try{ updateV2(); }catch(_){}
      try{ updateHorizontalWork(); }catch(_){}
      try{ updateWorkPolish(); }catch(_){}
      try{ updateSceneCounter(); }catch(_){}
    });
  };

  // Run after responsive story height is applied, then once more after assets/layout settle.
  requestAnimationFrame(()=>requestAnimationFrame(go));
  setTimeout(go, 180);
  setTimeout(go, 650);
}

window.addEventListener("load", amurOpenProjectsFromHash);
window.addEventListener("pageshow", amurOpenProjectsFromHash);
window.addEventListener("hashchange", amurOpenProjectsFromHash);

// Also handle cases where this script executes after the load event.
if(document.readyState === "complete" || document.readyState === "interactive"){
  setTimeout(amurOpenProjectsFromHash, 0);
}


/* ===============================
   V32 — BILINGUAL UI / EN DEFAULT
   =============================== */
const AMUR_I18N = {
  en: {
    navAbout:"ABOUT", navWork:"WORK", navServices:"SERVICES", navProcess:"PROCESS", navContact:"CONTACT",
    hero1:"We turn ideas", hero2:"into presence.",
    heroP:"Strategy, identity and creative direction shaped into a clear visual system that makes a brand seen and remembered.",
    heroCta:"DISCOVER AMUR <b>↙</b>",
    aboutTitle:"I build brands from the idea, turning vision into a system with character and presence.",
    about1:"Identity built on meaning, not just appearance.",
    about2:"Creative direction that keeps the brand consistent at every touchpoint.",
    about3:"Digital systems that connect the idea to operation and growth.",
    workTitle:"Work built to make a difference.",
    workP:"The problem, the idea, the system and the impact — not just images.",
    servicesTitle:"Clarity in the idea. Power in the execution.",
    s1:"We define the personality, message and position the brand should own.",
    s2:"A coherent, clear identity built to grow.",
    s3:"A unified voice and visual direction for content and campaigns.",
    s4:"Systems that connect the idea to operation and follow-through.",
    processTitle:"Four steps. A clearer decision.",
    processP:"From understanding to execution — without noise.",
    p1h:"Understand before we design.", p1p:"The project, market, audience and the real problem.",
    p2h:"Define the direction.", p2p:"Personality, message, idea and the position the brand should own.",
    p3h:"Turn the decision into a system.", p3p:"A coherent visual identity that is clear and usable.",
    p4h:"Build it to grow.", p4p:"Use, operation, expansion and flexibility without losing character.",
    contactTitle:"Got an idea that deserves more?", contactP:"Send the idea. We organize it, define its direction, and build it the way it deserves.", contactCta:"START <b>↗</b>",
    studio:"CREATIVE STUDIO · CAIRO", pill:"BRANDING · VISUAL IDENTITY · CREATIVE DIRECTION", scroll:"SCROLL TO ENTER", aboutKicker:"ABOUT / FOUNDER", founder:"Founder & Creative Director — AMUR", workKicker:"SELECTED WORK", loading:"Loading selected work…", servicesKicker:"WHAT I DO", processKicker:"PROCESS", contactKicker:"CONTACT", rare:"RARE BY NATURE.", distinct:"DISTINCT BY DESIGN.", footer:"RARE BY NATURE · DISTINCT BY DESIGN",
    sn1:"STRATEGY",sh1:"Brand Strategy",sn2:"IDENTITY",sh2:"Visual Identity",sn3:"DIRECTION",sh3:"Creative Direction",sn4:"SYSTEMS",sh4:"Digital Systems",
    pr1:"01 / DISCOVER",pr2:"02 / DEFINE",pr3:"03 / DESIGN",pr4:"04 / DEVELOP"
  },
  ar: {
    navAbout:"عنّي", navWork:"الأعمال", navServices:"الخدمات", navProcess:"الطريقة", navContact:"تواصل",
    hero1:"نحوّل الفكرة", hero2:"إلى حضور.",
    heroP:"استراتيجية، هوية، وتوجيه إبداعي يتحولوا لنظام بصري واضح يخلّي البراند يُرى ويُتذكر.",
    heroCta:"اكتشف AMUR <b>↙</b>",
    aboutTitle:"أبني البراند من الفكرة، وأحوّل الرؤية إلى نظام له شخصية وحضور.",
    about1:"هوية مبنية على معنى، مش مجرد شكل.",
    about2:"توجيه إبداعي يحافظ على الشخصية في كل نقطة ظهور.",
    about3:"أنظمة رقمية تربط الفكرة بالتشغيل والنمو.",
    workTitle:"مشاريع اتبنت عشان تعمل فرق.",
    workP:"المشكلة، الفكرة، النظام، والأثر — مش مجرد صور.",
    servicesTitle:"وضوح في الفكرة. قوة في التنفيذ.",
    s1:"نحدد الشخصية والرسالة والمكان اللي البراند لازم يحتله.",
    s2:"هوية متماسكة، واضحة، وقابلة للنمو.",
    s3:"نبرة وشكل موحّد للمحتوى والحملات.",
    s4:"أنظمة تربط الفكرة بالتشغيل والمتابعة.",
    processTitle:"أربع خطوات. قرار أوضح.", processP:"من الفهم إلى التنفيذ — من غير ضوضاء.",
    p1h:"نفهم قبل ما نصمّم.", p1p:"المشروع، السوق، الجمهور، والمشكلة الحقيقية.",
    p2h:"نحسم الاتجاه.", p2p:"الشخصية، الرسالة، الفكرة، والمكان اللي البراند لازم يحتله.",
    p3h:"نحوّل القرار إلى نظام.", p3p:"هوية بصرية متماسكة، واضحة، وقابلة للتطبيق.",
    p4h:"نجهّزه للنمو.", p4p:"استخدام، تشغيل، توسع، ومرونة بدون فقدان الشخصية.",
    contactTitle:"عندك فكرة تستحق تطلع أقوى؟", contactP:"ابعت الفكرة. نرتبها، نحدد اتجاهها، ونبنيها بشكل يليق بيها.", contactCta:"نبدأ <b>↗</b>",
    studio:"استوديو إبداعي · القاهرة", pill:"براندنج · هوية بصرية · توجيه إبداعي", scroll:"اسحب للدخول", aboutKicker:"عنّي / المؤسس", founder:"المؤسس والمدير الإبداعي — AMUR", workKicker:"أعمال مختارة", loading:"جاري تحميل الأعمال…", servicesKicker:"الخدمات", processKicker:"الطريقة", contactKicker:"تواصل", rare:"نادر بطبيعته.", distinct:"مميّز بالتصميم.", footer:"نادر بطبيعته · مميّز بالتصميم",
    sn1:"استراتيجية",sh1:"استراتيجية البراند",sn2:"الهوية",sh2:"الهوية البصرية",sn3:"التوجيه",sh3:"التوجيه الإبداعي",sn4:"الأنظمة",sh4:"الأنظمة الرقمية",
    pr1:"01 / اكتشاف",pr2:"02 / تحديد",pr3:"03 / تصميم",pr4:"04 / تطوير"
  }
};

function amurSetLang(lang){
  lang = lang === "ar" ? "ar" : "en";
  try{ localStorage.setItem("amur-lang",lang); }catch(e){}
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  document.documentElement.dataset.lang=lang;
  document.body.classList.toggle("lang-ar",lang==="ar");
  document.body.classList.toggle("lang-en",lang==="en");
  const t=AMUR_I18N[lang];
  const all=(sel)=>[...document.querySelectorAll(sel)];
  const set=(sel,key,html=false)=>{const el=document.querySelector(sel);if(el){el[html?"innerHTML":"textContent"]=t[key]}};
  const nav=all(".nav-links a");
  ["navAbout","navWork","navServices","navProcess","navContact"].forEach((k,i)=>{if(nav[i])nav[i].textContent=t[k]});
  const heroSpans=all(".hero-copy h1 span"); if(heroSpans[0])heroSpans[0].textContent=t.hero1;if(heroSpans[1])heroSpans[1].textContent=t.hero2;
  set(".hero-copy p","heroP"); set(".hero-actions .line-link","heroCta",true);
  set(".about-copy h3","aboutTitle");
  const ap=all(".about-points p"); ["about1","about2","about3"].forEach((k,i)=>{if(ap[i]){const n=ap[i].querySelector("span")?.outerHTML||"";ap[i].innerHTML=n+t[k]}});
  set(".work-head h2","workTitle",true); set(".work-head p","workP");
  set(".services-head h2","servicesTitle",true);
  const sr=all(".service-row p"); ["s1","s2","s3","s4"].forEach((k,i)=>{if(sr[i])sr[i].textContent=t[k]});
  set(".process-copy h2","processTitle",true); set(".process-copy p","processP");
  const pc=all(".process-card"); [["p1h","p1p"],["p2h","p2p"],["p3h","p3p"],["p4h","p4p"]].forEach((ks,i)=>{if(pc[i]){const h=pc[i].querySelector("h3"),p=pc[i].querySelector("p");if(h)h.textContent=t[ks[0]];if(p)p.textContent=t[ks[1]];}});
  set(".contact-copy h2","contactTitle",true); set(".contact-copy p","contactP"); set(".contact-copy .line-link","contactCta",true);

  set(".nav-caption","studio"); set(".glass-pill","pill"); set(".scroll-cue span","scroll");
  const kickers=all(".scene-kicker b"); if(kickers[0])kickers[0].textContent=t.aboutKicker;if(kickers[1])kickers[1].textContent=t.workKicker;if(kickers[2])kickers[2].textContent=t.servicesKicker;if(kickers[3])kickers[3].textContent=t.processKicker;
  const ck=document.querySelector(".scene-kicker.contact-piece b");if(ck)ck.textContent=t.contactKicker;
  set(".about-name p","founder");
  const sigSm=all(".signature small,.contact-signature small");sigSm.forEach(x=>x.textContent=t.rare); const sigSt=all(".signature strong,.contact-signature strong");sigSt.forEach(x=>x.textContent=t.distinct);
  const footerSpans=all("footer .footer-row span");if(footerSpans[1])footerSpans[1].textContent=t.footer;
  const srh=all(".service-row h3"),srs=all(".service-row small"); [["sn1","sh1"],["sn2","sh2"],["sn3","sh3"],["sn4","sh4"]].forEach((ks,i)=>{if(srs[i])srs[i].textContent=t[ks[0]];if(srh[i])srh[i].textContent=t[ks[1]]});
  const pcs=all(".process-card small");["pr1","pr2","pr3","pr4"].forEach((k,i)=>{if(pcs[i])pcs[i].textContent=t[k]});
  const btn=document.getElementById("langToggle"); if(btn){btn.textContent=lang==="en"?"AR":"EN";btn.setAttribute("aria-label",lang==="en"?"Switch to Arabic":"Switch to English")}
  if(window.__amurProjectsLoadedOnce){loadProjects();}else{window.__amurProjectsLoadedOnce=true;}
}

function initAmurLanguage(){
  let lang="en";try{lang=localStorage.getItem("amur-lang")||"en"}catch(e){}
  amurSetLang(lang);
  document.getElementById("langToggle")?.addEventListener("click",()=>amurSetLang(document.documentElement.lang==="en"?"ar":"en"));
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initAmurLanguage,{once:true}); else initAmurLanguage();

// Keep the mobile work rail progress synced with touch / horizontal scrolling.
document.addEventListener("scroll",e=>{if(e.target?.classList?.contains("work-list")) updateHorizontalWork();},{passive:true,capture:true});
