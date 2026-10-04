(()=>{
  if(!matchMedia('(max-width:760px)').matches) return;

  document.documentElement.classList.add('amur-mobile-premium');

  const reveal=[...document.querySelectorAll('.scene,.contact,.px-step')];
  reveal.forEach(el=>{
    el.classList.add('mobile-reveal','mobile-scroll-motion');
  });

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('mobile-in');
          io.unobserve(e.target);
        }
      }
    },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    reveal.forEach(el=>io.observe(el));
  }else reveal.forEach(el=>el.classList.add('mobile-in'));

  // Mobile scrolling always wins over desktop drag interactions.
  document.querySelectorAll('#logoDrag,.logo-drag,.px-logo-grab-layer,.project-logo-drag,.px-product-viewer').forEach(el=>{
    el.style.pointerEvents='none';
    el.style.touchAction='pan-y';
  });

  const portrait=document.getElementById('aboutPortrait');
  if(portrait) portrait.classList.add('mobile-portrait-motion');

  let ticking=false;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  function updateScrollMotion(){
    ticking=false;
    const vh=Math.max(window.innerHeight,1);

    for(const el of reveal){
      const r=el.getBoundingClientRect();
      // Progress only when a scene is leaving through the top.
      const leave=clamp((-r.top)/(Math.max(r.height*.62,1)),0,1);
      // Very subtle entrance lift when coming from below.
      const enter=clamp((vh-r.top)/(Math.max(vh*.42,1)),0,1);
      const scale=1-(leave*.055);
      const opacity=1-(leave*.56);
      const shift=(1-enter)*12 - leave*8;
      el.style.setProperty('--m-scale',scale.toFixed(4));
      el.style.setProperty('--m-opacity',opacity.toFixed(3));
      el.style.setProperty('--m-shift',shift.toFixed(1)+'px');
    }

    if(portrait){
      const r=portrait.getBoundingClientRect();
      const center=r.top+r.height/2;
      const delta=clamp((center-vh*.52)/(vh*.7),-1,1);
      const visible=clamp(1-Math.abs(delta)*.38,.7,1);
      const y=clamp(delta*18,-18,18);
      const scale=1-clamp(Math.abs(delta)*.035,0,.035);
      portrait.style.setProperty('--portrait-y',y.toFixed(1)+'px');
      portrait.style.setProperty('--portrait-scale',scale.toFixed(4));
      portrait.style.setProperty('--portrait-opacity',visible.toFixed(3));
    }
  }

  function requestTick(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(updateScrollMotion);
  }

  addEventListener('scroll',requestTick,{passive:true});
  addEventListener('resize',requestTick,{passive:true});
  requestTick();
})();
