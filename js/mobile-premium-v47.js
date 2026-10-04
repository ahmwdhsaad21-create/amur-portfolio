(()=>{
  if(!matchMedia('(max-width:760px)').matches) return;
  document.documentElement.classList.add('amur-mobile-v47');

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let scenes=[]; let cards=[]; let steps=[]; let portrait=null; let ticking=false;

  function collect(){
    scenes=[...document.querySelectorAll('.scene,.contact')];
    cards=[...document.querySelectorAll('.scene-work .work-logo-scene')];
    steps=[...document.querySelectorAll('.single-project-experience-page .px-step')];
    portrait=document.getElementById('aboutPortrait');
    scenes.forEach(el=>el.classList.add('v47-scroll-scene'));
    cards.forEach(el=>el.classList.add('v47-card-motion'));
    steps.forEach(el=>el.classList.add('v47-project-step'));
    if(portrait) portrait.classList.add('v47-portrait');
  }

  function update(){
    ticking=false;
    const vh=Math.max(innerHeight,1);

    scenes.forEach(el=>{
      const r=el.getBoundingClientRect();
      const leaving=clamp((-r.top)/(Math.max(r.height*.72,1)),0,1);
      const approaching=clamp((vh-r.top)/(vh*.55),0,1);
      const scale=1-leaving*.075;
      const opacity=1-leaving*.72;
      const y=(1-approaching)*18-leaving*10;
      el.style.setProperty('--v47-scale',scale.toFixed(4));
      el.style.setProperty('--v47-opacity',opacity.toFixed(3));
      el.style.setProperty('--v47-y',y.toFixed(1)+'px');
    });

    cards.forEach((el,i)=>{
      const r=el.getBoundingClientRect();
      const d=Math.abs((r.top+r.height/2)-vh*.56)/vh;
      const proximity=clamp(1-d*1.35,0,1);
      el.style.setProperty('--v47-card-scale',(0.982+proximity*.018).toFixed(4));
      el.style.setProperty('--v47-card-opacity',(0.72+proximity*.28).toFixed(3));
      el.style.setProperty('--v47-card-y',((1-proximity)*8).toFixed(1)+'px');
    });

    steps.forEach(el=>{
      const r=el.getBoundingClientRect();
      const leaving=clamp((-r.top+74)/(Math.max(r.height*.7,1)),0,1);
      const approaching=clamp((vh-r.top)/(vh*.48),0,1);
      el.style.setProperty('--v47-step-scale',(1-leaving*.055).toFixed(4));
      el.style.setProperty('--v47-step-opacity',(1-leaving*.64).toFixed(3));
      el.style.setProperty('--v47-step-y',(((1-approaching)*16)-(leaving*7)).toFixed(1)+'px');
    });

    if(portrait){
      const r=portrait.getBoundingClientRect();
      const center=r.top+r.height/2;
      const delta=clamp((center-vh*.54)/(vh*.58),-1,1);
      const closeness=1-Math.min(1,Math.abs(delta));
      portrait.style.setProperty('--v47-portrait-y',(delta*26).toFixed(1)+'px');
      portrait.style.setProperty('--v47-portrait-scale',(0.94+closeness*.075).toFixed(4));
      portrait.style.setProperty('--v47-portrait-opacity',(0.72+closeness*.28).toFixed(3));
      portrait.style.setProperty('--v47-portrait-rotate',(-delta*1.4).toFixed(2)+'deg');
    }
  }

  function tick(){if(ticking)return;ticking=true;requestAnimationFrame(update)}
  function refresh(){collect();tick()}

  // Projects/project steps are loaded asynchronously from Supabase.
  const mo=new MutationObserver(()=>refresh());
  mo.observe(document.body,{childList:true,subtree:true});
  addEventListener('scroll',tick,{passive:true});
  addEventListener('resize',refresh,{passive:true});
  refresh();
})();
