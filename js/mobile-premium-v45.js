(()=>{
  if(!matchMedia('(max-width:760px)').matches) return;

  document.documentElement.classList.add('amur-mobile-premium');

  const reveal=[...document.querySelectorAll('.scene,.contact,.px-step')];
  reveal.forEach(el=>el.classList.add('mobile-reveal'));

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(e.isIntersecting){e.target.classList.add('mobile-in');io.unobserve(e.target)}
      }
    },{threshold:.10,rootMargin:'0px 0px -7% 0px'});
    reveal.forEach(el=>io.observe(el));
  }else reveal.forEach(el=>el.classList.add('mobile-in'));

  // Safety: mobile scrolling must always win over draggable desktop artwork.
  document.querySelectorAll('#logoDrag,.logo-drag,.px-logo-grab-layer,.project-logo-drag,.px-product-viewer').forEach(el=>{
    el.style.pointerEvents='none';
    el.style.touchAction='pan-y';
  });
})();
