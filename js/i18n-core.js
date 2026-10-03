(function(){
  const PREFIX="[[AMUR_BI]]";
  const hasAr=s=>/[\u0600-\u06ff]/.test(String(s||""));

  const AR_EN=new Map([
    ["المنتجات","Products"],["الفكرة","The Idea"],["الهوية","Identity"],["المكان","Space"],["السوشيال","Social Media"],["السيستم","Digital System"],["التوسع","Expansion"],
    ["الفكرة قبل الشكل.","The idea before the form."],["اسم وهوية ليهم معنى.","A name and identity with meaning."],["الهوية دخلت المكان.","The identity entered the space."],["المحتوى جزء من الهوية.","Content became part of the identity."],["من البراند للتشغيل.","From brand to operation."],["الهوية قدرت تكبر.","An identity built to scale."],
    ["من فكرة مستوحاة من الشطرنج إلى براند قتالي متكامل، من الهوية والمكان لحد المحتوى والسيستم التشغيلي","From a chess-inspired idea to a complete fighting brand — from identity and space to content and an operational system."],
    ["بدأت فكرة CHECKMATE من محاولة بناء هوية مرتبطة بعالم الـMMA، لكن من زاوية مختلفة:\nالتركيز، التكتيك، قراءة الخصم، واختيار اللحظة الصح للحسم.\nبدل ما نستخدم الملك كرمز للقوة من البداية، اخترنا العسكري — أضعف قطعة في رقعة الشطرنج.\nالعسكري بيبدأ بخطوة محدودة، لكنه لو قدر يعدّي الرقعة كلها بعد صراعات ومواجهات كتير، يوصل للحظة يقدر فيها يتحول لقوة أكبر.\nومن هنا جه رمز العسكري المتوج.","CHECKMATE started as an attempt to build an MMA identity from a different angle: focus, tactics, reading the opponent, and choosing the right moment to finish. Instead of using the king as an obvious symbol of power, we chose the pawn — the weakest piece on the chessboard. A pawn starts with limited movement, but after crossing the whole board through challenge and conflict, it reaches a point where it can become something stronger. That journey became the crowned-pawn symbol."],
    ["من فكرة لهوية كاملة.","From an idea to a complete identity."],
    ["بعد ما اتحددت فكرة CHECKMATE، بدأ تحويلها لهوية بصرية كاملة.\nالاسم نفسه جاي من لحظة الحسم في الشطرنج، لكن الشخصية البصرية اتبنت على رحلة الـPawn؛ قطعة تبدأ بسيطة، لكن مع التقدم تقدر توصل لأقوى مرحلة.\n\nاللوجو جمع بين الـPawn والتاج، مع طابع قتالي واضح يناسب عالم الـMMA، بحيث يكون الرمز سهل التمييز وله شخصية قوية.\n\nبعد كده اتبنى النظام البصري على الأحمر، الأسود، والأوف وايت، مع خطوط وعناصر جرافيكية حادة تعكس القوة، الحركة، والانضباط.","Once the CHECKMATE concept was defined, it was translated into a complete visual identity. The name comes from the decisive moment in chess, while the visual character was built around the pawn's journey — a simple piece that can progress to its strongest stage. The logo combines the pawn and crown with an aggressive MMA character, creating a distinctive and memorable mark. The wider visual system uses red, black and off-white with sharp graphic elements that communicate strength, movement and discipline."],
    ["الهوية في المكان","Identity in Space"],["الهوية دخلت المكان.","The identity moved into the space."],
    ["بعد ما اتبنت الهوية، بدأ تطبيقها فعليًا داخل الأكاديمية.\nالهدف كان إن CHECKMATE مايبقاش مجرد لوجو، لكن يبقى له حضور واضح في المكان نفسه.\n\nاتطبقت الهوية على البنرات، الجدران، العناصر البصرية داخل الفروع، وكل نقطة يمر بيها اللاعب أو ولي الأمر، بحيث يفضل نفس الإحساس القتالي ونفس الشخصية البصرية موجودة في كل التفاصيل.","After the identity was built, it was applied throughout the academy. The goal was for CHECKMATE to feel like more than a logo — it needed a clear physical presence. The identity was carried across banners, walls and visual touchpoints in the branches, keeping the same fighting character throughout the space."],
    ["البراند وهو بيتكلم","The Brand in Motion"],["المحتوى جزء من الهوية.","Content became part of the identity."],
    ["بعد ما اتحددت شخصية CHECKMATE بصريًا، كان لازم نفس الشخصية تفضل واضحة في المحتوى.\nاتعمل اتجاه بصري موحّد للسوشيال ميديا يحافظ على قوة البراند، ويخلي كل بوست أو حملة جزء من نفس العالم.\n\nالمحتوى تنوع بين الإعلانات، التمارين، الأطفال، الجرابلينج، الشادو، افتتاح الفروع، والعروض، لكن من غير ما الهوية تفقد شكلها أو شخصيتها.","Once CHECKMATE's visual character was established, the same personality had to remain consistent in content. A unified social-media direction was created so every post and campaign felt part of the same world. The content covered promotions, training, kids, grappling, shadow work, branch openings and offers without losing the brand's visual character."],
    ["من الهوية للمنتج","From Identity to Product"],["البراند خرج من الشاشة.","The brand moved beyond the screen."],
    ["بعد ما اتبنت الهوية وبدأت تظهر في المكان وعلى السوشيال، كان طبيعي إنها تمتد للمنتجات كمان.\n\nتم تصميم مجموعة تيشيرتات تحافظ على نفس شخصية CHECKMATE؛ استخدام واضح للرموز، الألوان، والطابع القتالي، بحيث يبقى كل منتج جزء من البراند نفسه مش مجرد قطعة عليها لوجو.","Once the identity was established across the space and social media, it naturally extended into products. A T-shirt collection was designed around the same CHECKMATE character, using its symbols, colors and fighting attitude so every piece felt like part of the brand rather than merchandise with a logo added to it."],
    ["من الهوية للتشغيل","From Identity to Operations"],["البراند بقى نظام شغال.","The brand became a working system."],
    ["CHECKMATE ماوقفتش عند الهوية والمحتوى، لكن امتدت لتجربة التشغيل نفسها.\n\nتم تطوير نظام خاص بالأكاديمية لإدارة الأعضاء، الباقات، الحضور، التحصيل، المصروفات والإيجارات، بحيث تبقى العمليات اليومية منظمة وواضحة في مكان واحد.\n\nالفكرة كانت إن الهوية ماتكونش مجرد شكل بصري، لكن تتحول لنظام يساعد الأكاديمية فعليًا في الإدارة والنمو.","CHECKMATE did not stop at identity and content; it extended into the operating experience itself. A dedicated academy management system was developed for members, packages, attendance, payments, expenses and rentals, bringing daily operations into one clear place. The goal was for the brand to become a practical system that supports management and growth, not just a visual identity."],
    ["النتيجة","Outcome"],["من فكرة… لبراند بيتحرك لوحده.","From an idea to a brand built to move."],
    ["CHECKMATE بدأت كفكرة، وبعدها اتحولت لهوية، مكان، محتوى، منتجات، ونظام تشغيل.\n\nكل جزء اتبنى عشان يخدم نفس الشخصية ونفس الرؤية، لحد ما المشروع بقى أكتر من مجرد أكاديمية؛ بقى براند له شكل، صوت، وطريقة شغل واضحة.\n\nودي كانت الفكرة من البداية:\nنبني حاجة تقدر تكبر من غير ما تفقد هويتها.","CHECKMATE started as an idea, then became an identity, a space, content, products and an operating system. Every part was built around the same character and vision until the project became more than an academy — it became a brand with a clear look, voice and way of working. The idea from the beginning was simple: build something that can grow without losing its identity."],

    ["عن المشروع","About the Project"],["نقل احترافي لكل رحلة.","Professional transport for every journey."],
    ["ELALAMY TRAVEL & TRANSPORTATION شركة متخصصة في خدمات النقل والرحلات، بتقدم حلول نقل متنوعة تشمل رحلات الـVIP، النقل من وإلى المطار، نقل الموظفين، ونقل رجال الأعمال، بالإضافة للمشاركة في فعاليات ومؤتمرات كبيرة بأسطول الشركة.\n\nهدف البراند هو تقديم تجربة نقل تعتمد على الراحة، الالتزام، والثقة، مع مستوى خدمة يناسب الأفراد والشركات والفعاليات الرسمية.","ELALAMY TRAVEL & TRANSPORTATION specializes in transport and travel services, offering VIP trips, airport transfers, employee transportation and executive transport, in addition to supporting major events and conferences with its fleet. The brand is built around comfort, reliability and trust, with a service level suited to individuals, companies and official events."],
    ["قبل إعادة البناء","Before the Rebuild"],["حضور أقل من حجم الخدمة.","A presence smaller than the service behind it."],
    ["رغم تنوع خدمات ELALAMY وخبرتها في النقل والرحلات، كان الظهور البصري أضعف من مستوى الخدمة نفسها.\nالهوية القديمة ماكانتش بتعكس بشكل كافي الاحترافية، الثقة، وتنوع الخدمات اللي بتقدمها الشركة، وده خلّى البراند محتاج حضور أوضح وأكثر تميزًا.","Despite ELALAMY's range of services and experience in transport and travel, its visual presence was weaker than the service itself. The old identity did not communicate the professionalism, trust and breadth of the company clearly enough, so the brand needed a stronger and more distinctive presence."],
    ["إعادة البناء","The Rebuild"],["هوية تليق بحجم العالمي.","An identity that matches ELALAMY's scale."],
    ["بدأت إعادة بناء الهوية بهدف خلق شكل بصري أبسط، أقوى، وأسهل في التمييز، ويعكس بشكل أوضح طبيعة الشركة في النقل والرحلات.\n\nتم تطوير لوجو جديد وشخصية بصرية أكثر مرونة، بحيث تشتغل بنفس القوة على العربيات، المطبوعات، والسوشيال ميديا، وتدي البراند حضور احترافي ومتناسق في كل نقطة ظهور.","The identity was rebuilt to create a simpler, stronger and more recognizable visual system that better reflects the company's transport and travel services. A new logo and more flexible visual character were developed to work consistently across print, social media and the brand's wider presence."],
    ["الحضور الرقمي","Digital Presence"],["شكل واحد في كل ظهور.","One visual language across every appearance."],
    ["بعد تطوير الهوية، بدأ تطبيقها على المحتوى الرقمي عشان يبقى ظهور ELALAMY أكثر اتساقًا واحترافية.\n\nتم بناء اتجاه بصري موحّد للسوشيال ميديا، مع تصميمات تعكس طبيعة الخدمة وتبرز عناصر الثقة، الراحة، والتنظيم، مع الحفاظ على شخصية واضحة للبراند في كل منشور وحملة.","After the identity was developed, it was carried into digital content to make ELALAMY's presence more consistent and professional. A unified social-media direction was created around trust, comfort and organization while keeping a clear brand character across posts and campaigns."],
    ["حضور أوضح. وهوية أقوى.","Clearer presence. Stronger identity."],
    ["إعادة بناء ELALAMY ماكانتش مجرد تغيير لوجو، لكن خطوة لإعادة تقديم الشركة بشكل يليق بحجم خدماتها وخبرتها.\n\nمن الهوية الجديدة، للمطبوعات، للسوشيال ميديا، بقى البراند أكثر وضوحًا واتساقًا، مع أساس بصري يقدر يكمل ويتطور مع نمو الشركة.","Rebuilding ELALAMY was not simply a logo change; it was a step toward presenting the company in a way that matches its scale and experience. From the new identity to print and social media, the brand became clearer and more consistent, with a visual foundation designed to evolve as the company grows."],

    ["حضور أقوى لجيم كان محتاج يتشاف.","A stronger presence for a gym that needed to be seen."],
    ["Expert Gym كان جيم مختلط بيقدم تجربة تدريب متكاملة، لكن ظهوره البصري على السوشيال ماكانش بيعكس مستوى المكان بالشكل الكافي.\n\nبدأ الشغل بإعادة ترتيب شكل البراند على السوشيال، وتطوير الهوية وطريقة عرض المحتوى، بهدف إن الجيم يبقى أوضح، أقوى، وأسهل في التمييز من أول نظرة.","Expert Gym was a mixed gym offering a complete training experience, but its visual presence on social media did not reflect the quality of the place. The work started by reorganizing the brand's social presence, developing the identity and improving how content was presented so the gym could feel clearer, stronger and easier to recognize at a glance."],
    ["قبل التطوير","Before the Development"],["مكان كويس… بحضور أضعف من مستواه.","A good place with a presence below its level."],
    ["Expert Gym كان عنده مكان وتجربة تدريب كويسة، لكن الهوية وطريقة الظهور على السوشيال ماكانوش بيعكسوا ده بالشكل الكافي.\n\nالمحتوى كان محتاج اتجاه بصري أوضح، وتنظيم أقوى، وطريقة عرض تخلي الصفحة تبان بشكل احترافي ومتناسق من أول نظرة.","Expert Gym had a solid space and training experience, but the identity and social presence did not communicate that quality clearly enough. The content needed a stronger visual direction, better organization and a more professional, consistent presentation."],
    ["شكل أقوى. وهوية أوضح.","Stronger look. Clearer identity."],
    ["بدأ تطوير Expert Gym من إعادة ترتيب الشكل البصري للبراند، بحيث يبقى أوضح، أنضف، وأسهل في التمييز.\n\nاتغيرت طريقة استخدام اللوجو، الألوان، الخطوط، وطريقة تصميم المحتوى، عشان يبقى عند الجيم شكل موحّد يبان من أول نظرة ويحافظ على نفس الشخصية في كل ظهور.","The development of Expert Gym started by reorganizing its visual identity to make it clearer, cleaner and easier to recognize. The use of the logo, colors, typography and content design was refined to create a unified look with a consistent personality across every appearance."],
    ["المحتوى بدأ يتكلم بنفس صوت البراند.","The content started speaking in the brand's voice."],
    ["بعد ما اتظبطت الهوية، بدأ الشغل على شكل الصفحة والمحتوى نفسه، بحيث كل بوست يبقى جزء من نفس الشخصية البصرية.\n\nاتعمل اتجاه أوضح للسوشيال من حيث الألوان، الخطوط، توزيع العناصر، وطريقة عرض العروض والمحتوى التدريبي، وده خلّى ظهور Expert Gym أقوى وأكثر تنظيمًا.","Once the identity was refined, the page and content were rebuilt so every post felt part of the same visual character. A clearer social-media direction was created through color, typography, layout and the presentation of offers and training content, giving Expert Gym a stronger and more organized presence."],
    ["هوية أوضح. حضور أقوى.","Clearer identity. Stronger presence."],
    ["Expert Gym انتهى، لكن الهوية فضلت واضحة لآخر لحظة.","Expert Gym ended, but the identity stayed clear until the final moment."],

    ["قسم الفكرة بصورة رئيسية واحدة فقط.","The Idea section uses one main image only."],
    ["صورة واحدة هتظهر عادي. لو رفعت أكتر من صورة هتظهر كرَصّة صور تفاعلية تلقائيًا.","One image displays normally. Two or more images become an interactive stack automatically."]
  ]);

  const EN_AR=new Map([...AR_EN].map(([a,e])=>[e,a]));

  // Normalize legacy content so tiny punctuation/spacing edits in Supabase
  // still resolve to the bilingual copy already defined above.
  const normalize=s=>String(s??"")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g,"")
    .replace(/[“”„‟«»]/g,'"')
    .replace(/[’‘`]/g,"'")
    .replace(/[.…،؛:;!?؟()\[\]{}\-–—_/\\|]+/g," ")
    .replace(/\s+/g," ")
    .trim()
    .toLowerCase();

  const AR_EN_NORM=new Map([...AR_EN].map(([a,e])=>[normalize(a),e]));
  const EN_AR_NORM=new Map([...EN_AR].map(([e,a])=>[normalize(e),a]));

  function closestKnown(s,lang){
    const source=normalize(s);
    if(source.length<24)return "";
    const entries=lang==="en"?[...AR_EN.entries()]:[...EN_AR.entries()];
    const aTokens=new Set(source.split(" ").filter(x=>x.length>2));
    let best="",bestScore=0;
    for(const [from,to] of entries){
      const n=normalize(from);
      if(!n)continue;
      if(source===n)return to;
      if(source.includes(n) || n.includes(source)){
        const ratio=Math.min(source.length,n.length)/Math.max(source.length,n.length);
        if(ratio>.72 && ratio>bestScore){bestScore=ratio;best=to;}
        continue;
      }
      const bTokens=new Set(n.split(" ").filter(x=>x.length>2));
      if(!aTokens.size||!bTokens.size)continue;
      let inter=0; for(const t of aTokens) if(bTokens.has(t)) inter++;
      const score=inter/Math.max(aTokens.size,bTokens.size);
      if(score>.76 && score>bestScore){bestScore=score;best=to;}
    }
    return best;
  }

  function legacy(s,lang){
    s=String(s??"").trim();
    if(!s)return "";
    const map=lang==="en"?AR_EN:EN_AR;
    if(map.has(s))return map.get(s);

    const normMap=lang==="en"?AR_EN_NORM:EN_AR_NORM;
    const direct=normMap.get(normalize(s));
    if(direct)return direct;

    // Try trimmed individual lines before broader fuzzy matching.
    const lines=s.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    if(lines.length>1){
      const translated=lines.map(x=>map.get(x)||normMap.get(normalize(x))||closestKnown(x,lang));
      if(translated.every(Boolean)) return translated.join("\n");
    }

    const near=closestKnown(s,lang);
    if(near)return near;

    // Never expose an internal placeholder to visitors. Unknown legacy copy
    // stays readable in its source language until an EN/AR version is saved.
    return s;
  }

  function unpack(v){
    const s=String(v??"");
    if(s.startsWith(PREFIX)){
      try{const x=JSON.parse(s.slice(PREFIX.length));return {ar:String(x.ar||""),en:String(x.en||"")};}catch(_){ }
    }
    if(hasAr(s))return {ar:s,en:legacy(s,"en")};
    return {ar:legacy(s,"ar"),en:s};
  }
  function pack(ar,en){
    ar=String(ar||"").trim();en=String(en||"").trim();
    if(!ar&&!en)return "";
    return PREFIX+JSON.stringify({ar,en});
  }
  function text(v,lang){
    const b=unpack(v);lang=lang==="ar"?"ar":"en";
    return b[lang]||b[lang==="ar"?"en":"ar"]||"";
  }
  window.AMUR_BI={PREFIX,unpack,pack,text,legacy,hasAr};
})();
