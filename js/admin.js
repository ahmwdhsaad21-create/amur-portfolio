(() => {
  const cfg=window.AMUR_CONFIG||{};
  const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  const $=id=>document.getElementById(id);
  const bi=v=>window.AMUR_BI?AMUR_BI.unpack(v):{ar:String(v||""),en:String(v||"")};
  const pack=(ar,en)=>window.AMUR_BI?AMUR_BI.pack(ar,en):String(ar||en||"");

  const DEFAULT_SECTION_DEFS=[
    {key:"idea",label:"الفكرة",eyebrow:"الفكرة",title:"الفكرة قبل الشكل."},
    {key:"identity",label:"الهوية",eyebrow:"الاسم والهوية",title:"اسم وهوية ليهم معنى."},
    {key:"space",label:"المكان",eyebrow:"الهوية في المكان",title:"الهوية دخلت المكان."},
    {key:"social",label:"السوشيال",eyebrow:"البراند وهو بيتكلم",title:"المحتوى جزء من الهوية."},
    {key:"system",label:"السيستم",eyebrow:"النظام الرقمي",title:"من البراند للتشغيل."},
    {key:"expansion",label:"التوسع",eyebrow:"التوسع",title:"الهوية قدرت تكبر."}
  ];

  let SECTION_DEFS=[...DEFAULT_SECTION_DEFS];

  function sectionDefAt(index){
    if(DEFAULT_SECTION_DEFS[index]) return {...DEFAULT_SECTION_DEFS[index]};
    const n=index+1;
    return {key:`custom_${n}`,label:`قسم ${n}`,eyebrow:`قسم ${n}`,title:`عنوان القسم ${n}`};
  }

  function setSectionCount(count,savedSections=[]){
    count=Math.max(1,Math.min(12,Number(count)||1));
    const saved=(savedSections||[])
      .filter(s=>s.section_key!=="merch")
      .sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));

    SECTION_DEFS=Array.from({length:count},(_,i)=>{
      const stored=saved[i];
      if(stored){
        return {
          key:stored.section_key,
          label:stored.eyebrow||stored.title||`قسم ${i+1}`,
          eyebrow:stored.eyebrow||`قسم ${i+1}`,
          title:stored.title||`عنوان القسم ${i+1}`
        };
      }
      return sectionDefAt(i);
    });

    if($("sectionCount"))$("sectionCount").value=count;
  }

  let projects=[];
  let currentProject=null;
  let products=[];

  const setStatus=t=>{if($("status"))$("status").textContent=t||""};
  const markState=t=>{if($("saveState"))$("saveState").textContent=t||""};

  function slugify(v){
    return String(v||"").trim().toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu,"-")
      .replace(/^-+|-+$/g,"");
  }

  function readableError(err){
    const m=String(err?.message||err||"");
    if(m.includes("hero_motion") || m.includes("project_products")){
      return "قاعدة البيانات لسه محتاجة تحديث V21. شغّل ملف supabase/v21_admin_and_products.sql مرة واحدة.";
    }
    if(m.includes("schema cache")){
      return "قاعدة البيانات محتاجة تحديث التحكمات الجديدة. شغّل ملف supabase/v26_review_controls.sql مرة واحدة ثم اعمل تحديث للصفحة.";
    }
    return m;
  }

  async function auth(){
    const {data}=await sb.auth.getSession();
    if(!data?.session){location.href="login.html";return false}
    $("who").textContent=data.session.user.email||"مدير";
    return true;
  }

  async function uploadFile(file,folder){
    const bucket=cfg.STORAGE_BUCKET||"portfolio";
    const clean=file.name.replace(/[^\w.\-]+/g,"-");
    const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${clean}`;
    const {error}=await sb.storage.from(bucket).upload(path,file,{upsert:false,cacheControl:"3600"});
    if(error)throw error;
    return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  function setupMainTabs(){
    document.querySelectorAll(".main-tab").forEach(btn=>{
      btn.onclick=()=>{
        document.querySelectorAll(".main-tab").forEach(x=>x.classList.toggle("active",x===btn));
        document.querySelectorAll(".main-section").forEach(sec=>sec.classList.toggle("active",sec.dataset.mainPanel===btn.dataset.main));
      };
    });
  }

  async function loadProjects(){
    const {data,error}=await sb.from("projects").select("*").order("sort_order",{ascending:true});
    if(error){setStatus("تعذر تحميل المشاريع: "+readableError(error));return}
    projects=data||[];
    $("projectsList").innerHTML=projects.map(p=>`
      <div class="project-item ${currentProject?.id===p.id?"active":""}" data-id="${p.id}">
        <strong>${bi(p.title).ar||bi(p.title).en||"بدون اسم"}</strong>
        <small>${p.published?"ظاهر للزوار":"مخفي"} · ترتيب ${p.sort_order??0}</small>
      </div>`).join("") || '<p class="muted">لسه مفيش مشاريع.</p>';
    document.querySelectorAll(".project-item").forEach(el=>el.onclick=()=>openProject(el.dataset.id));
  }

  function fillBase(p){
    $("projectId").value=p?.id||"";
    {const v=bi(p?.title);$("title").value=v.ar;$("titleEn").value=v.en;}
    $("slug").value=p?.slug||"";
    {const v=bi(p?.category);$("category").value=v.ar;$("categoryEn").value=v.en;}
    {const v=bi(p?.subtitle);$("subtitle").value=v.ar;$("subtitleEn").value=v.en;}
    $("coverUrl").value=p?.cover_url||"";
    $("logoUrl").value=p?.logo_url||"";
    $("accentColor").value=p?.accent_color||"#9d1717";
    $("mood").value=p?.mood||"dark";
    $("heroMotion").value=p?.hero_motion||"amur";
    $("heroStyle").value=p?.hero_style||"royal";
    $("heroLogoSize").value=p?.hero_logo_size||100;
    $("heroLogoSizeValue").textContent=`${$("heroLogoSize").value}%`;
    $("sortOrder").value=p?.sort_order??1;
    $("published").checked=p?.published??true;
    $("editorTitle").textContent=(p?(bi(p.title).ar||bi(p.title).en):"")||"مشروع جديد";
    $("logoPreview").innerHTML=p?.logo_url?`<img src="${p.logo_url}" alt="لوجو المشروع">`:'<span class="muted">لم يتم رفع لوجو بعد</span>';

    if($("productsEyebrow"))$("productsEyebrow").value="المنتجات";
    if($("productsSectionTitle"))$("productsSectionTitle").value="المنتجات";
    if($("productsSectionDescription"))$("productsSectionDescription").value="";
    if($("productsEyebrowEn"))$("productsEyebrowEn").value="Products";
    if($("productsSectionTitleEn"))$("productsSectionTitleEn").value="Products";
    if($("productsSectionDescriptionEn"))$("productsSectionDescriptionEn").value="";
  }


  function captureSectionDrafts(){
    const drafts=new Map();
    document.querySelectorAll(".content-panel").forEach(panel=>{
      const key=panel.dataset.key;
      drafts.set(key,{
        eyebrow:panel.querySelector(".sec-eyebrow")?.value||"",
        title:panel.querySelector(".sec-title")?.value||"",
        eyebrowEn:panel.querySelector(".sec-eyebrow-en")?.value||"",
        titleEn:panel.querySelector(".sec-title-en")?.value||"",
        body:panel.querySelector(".sec-body")?.value||"",
        bodyEn:panel.querySelector(".sec-body-en")?.value||"",
        enabled:panel.querySelector(".sec-enabled")?.checked!==false,
        images:[...panel.querySelectorAll(".image-row")].map(row=>({
          id:row.dataset.id||"",
          image_url:row.querySelector(".img-url")?.value||"",
          caption:row.querySelector(".img-caption")?.value||"",
          sort_order:Number(row.querySelector(".img-sort")?.value||1)
        }))
      });
    });
    return drafts;
  }

  function restoreSectionDrafts(drafts){
    if(!drafts)return;
    SECTION_DEFS.forEach(d=>{
      const draft=drafts.get(d.key);
      const panel=document.querySelector(`.content-panel[data-key="${d.key}"]`);
      if(!draft||!panel)return;
      panel.querySelector(".sec-eyebrow").value=draft.eyebrow;
      panel.querySelector(".sec-title").value=draft.title;
      panel.querySelector(".sec-eyebrow-en").value=draft.eyebrowEn||"";
      panel.querySelector(".sec-title-en").value=draft.titleEn||"";
      panel.querySelector(".sec-body").value=draft.body;
      panel.querySelector(".sec-body-en").value=draft.bodyEn||"";
      panel.querySelector(".sec-enabled").checked=draft.enabled;
      const host=panel.querySelector(".section-images");
      if(host)host.innerHTML="";
      (draft.images||[]).forEach(img=>addImageRow(d.key,img));
    });
  }

  function applySectionCount(){
    const count=Math.max(1,Math.min(12,Number($("sectionCount")?.value||1)));
    const drafts=captureSectionDrafts();
    const previous=[...SECTION_DEFS];

    SECTION_DEFS=Array.from({length:count},(_,i)=>previous[i]||sectionDefAt(i));
    renderContentTabs();
    restoreSectionDrafts(drafts);

    markState("غير محفوظ");
    setStatus(`تم تجهيز ${count} قسم. اضغط «حفظ محتوى المشروع» لتثبيت العدد.`);
  }

  function renderContentTabs(){
    $("sectionTabs").innerHTML=SECTION_DEFS.map((s,i)=>`
      <button type="button" class="btn content-tab ${i===0?"active":""}" data-key="${s.key}">${s.label}</button>
    `).join("");

    $("sectionPanels").innerHTML=SECTION_DEFS.map((s,i)=>`
      <section class="content-panel ${i===0?"active":""}" data-key="${s.key}">
        <div class="row">
          <div>
            <label>العنوان الصغير — عربي</label>
            <input class="sec-eyebrow" value="${bi(s.eyebrow).ar||s.eyebrow}">
          </div>
          <div>
            <label>عنوان الجزء — عربي</label>
            <input class="sec-title" value="${bi(s.title).ar||s.title}">
          </div>
        </div>
        <div class="row">
          <div><label>Small title — English</label><input class="sec-eyebrow-en" dir="ltr" value="${bi(s.eyebrow).en||''}"></div>
          <div><label>Section title — English</label><input class="sec-title-en" dir="ltr" value="${bi(s.title).en||''}"></div>
        </div>
        <div class="row">
          <div><label>النص — عربي</label><textarea class="sec-body"></textarea></div>
          <div><label>Body — English</label><textarea class="sec-body-en" dir="ltr"></textarea></div>
        </div>

        <div class="row">
          <div>
            <label>مقاس الصورة</label>
            <div class="muted" style="padding:12px;border:1px solid #242424;border-radius:10px">
              تلقائي حسب أبعاد الصورة المرفوعة من جهازك — لاند سكيب / مربع / بورتريه.
            </div>
          </div>
          <div class="checkline">
            <input class="sec-enabled" type="checkbox" checked>
            <label style="margin:0">إظهار الجزء داخل المشروع</label>
          </div>
        </div>

        <div style="height:1px;background:#222;margin:16px 0"></div>
        <strong style="font-size:13px">صور ${s.label}</strong>
        <p class="muted">
          ${s.key==="idea"
            ?"قسم الفكرة بصورة رئيسية واحدة فقط."
            :"صورة واحدة هتظهر عادي. لو رفعت أكتر من صورة هتظهر كرَصّة صور تفاعلية تلقائيًا."}
        </p>
        <div class="section-images" data-key="${s.key}"></div>
        <div class="actions">
          <button class="btn add-url" data-key="${s.key}" type="button">إضافة رابط صورة</button>
          <label class="btn" style="display:inline-flex;align-items:center;margin:0">
            رفع صور
            <input class="upload-section" data-key="${s.key}" type="file" multiple accept="image/*" hidden>
          </label>
        </div>
      </section>
    `).join("");

    document.querySelectorAll(".content-tab").forEach(btn=>{
      btn.onclick=()=>{
        document.querySelectorAll(".content-tab").forEach(x=>x.classList.toggle("active",x===btn));
        document.querySelectorAll(".content-panel").forEach(p=>p.classList.toggle("active",p.dataset.key===btn.dataset.key));
      };
    });

    document.querySelectorAll(".add-url").forEach(btn=>btn.onclick=()=>addImageRow(btn.dataset.key));
    document.querySelectorAll(".upload-section").forEach(inp=>inp.onchange=()=>uploadSectionFiles(inp.dataset.key,[...inp.files]));
  }

  function addImageRow(key,img={image_url:"",caption:"",sort_order:1,id:""}){
    const host=document.querySelector(`.section-images[data-key="${key}"]`);
    if(!host)return;

    const singleImageOnly=key==="idea";
    if(singleImageOnly && host.children.length){
      const existing=host.querySelector(".image-row");

      // Only the first saved image is editable/visible in Admin for these sections.
      if(img.id)return;

      if(existing){
        existing.querySelector(".img-url").value=img.image_url||"";
        existing.querySelector(".img-caption").value=img.caption||"";
        existing.querySelector(".img-sort").value=1;
        markState("غير محفوظ");
        return;
      }
    }

    const row=document.createElement("div");
    row.className="image-row";
    row.dataset.id=img.id||"";
    row.innerHTML=`
      <input class="img-url" dir="ltr" value="${String(img.image_url||"").replaceAll('"',"&quot;")}" placeholder="رابط الصورة">
      <input class="img-sort" type="number" value="${img.sort_order||1}" title="الترتيب">
      <input class="img-caption" value="${String(img.caption||"").replaceAll('"',"&quot;")}" placeholder="وصف اختياري للصورة">
      <button type="button" class="xbtn">×</button>`;
    row.querySelector("button").onclick=async()=>{
      if(row.dataset.id){
        const {error}=await sb.from("project_images").delete().eq("id",row.dataset.id);
        if(error)return setStatus("تعذر حذف الصورة: "+readableError(error));
      }
      row.remove();markState("غير محفوظ");
    };
    host.appendChild(row);
  }

  async function uploadSectionFiles(key,files){
    if(!currentProject){setStatus("احفظ المشروع الأول قبل رفع الصور.");return}
    try{
      const singleImageOnly=key==="idea";
      if(singleImageOnly && files.length>1)files=files.slice(0,1);

      setStatus(singleImageOnly?"جاري رفع الصورة الرئيسية...":"جاري رفع الصور...");
      for(const file of files){
        const url=await uploadFile(file,`projects/${currentProject.slug}/${key}`);
        addImageRow(key,{image_url:url,sort_order:document.querySelectorAll(`.section-images[data-key="${key}"] .image-row`).length+1});
      }
      markState("غير محفوظ");
      setStatus("تم رفع الصور. اضغط حفظ محتوى المشروع.");
    }catch(e){setStatus("فشل رفع الصور: "+readableError(e))}
  }

  async function loadSections(){
    const {data,error}=await sb.from("project_sections").select("*").eq("project_id",currentProject.id).order("sort_order");
    if(error){setStatus("تعذر تحميل محتوى المشروع: "+readableError(error));return}

    const all=data||[];
    const merch=all.find(s=>s.section_key==="merch");
    const savedSections=all
      .filter(s=>s.section_key!=="merch")
      .sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));

    const count=savedSections.length || Number($("sectionCount")?.value||6) || 6;
    setSectionCount(count,savedSections);
    renderContentTabs();

    document.querySelectorAll(".content-panel").forEach((panel,i)=>{
      const d=SECTION_DEFS[i];
      {const e=bi(d.eyebrow),t=bi(d.title);panel.querySelector(".sec-eyebrow").value=e.ar||d.eyebrow;panel.querySelector(".sec-eyebrow-en").value=e.en||"";panel.querySelector(".sec-title").value=t.ar||d.title;panel.querySelector(".sec-title-en").value=t.en||"";}
      panel.querySelector(".sec-body").value="";panel.querySelector(".sec-body-en").value="";
      panel.querySelector(".sec-enabled").checked=true;
    });

    if($("productsEyebrow")){const v=bi(merch?.eyebrow||"المنتجات");$("productsEyebrow").value=v.ar||"المنتجات";$("productsEyebrowEn").value=v.en||"Products";}
    if($("productsSectionTitle")){const v=bi(merch?.title||"المنتجات");$("productsSectionTitle").value=v.ar||"المنتجات";$("productsSectionTitleEn").value=v.en||"Products";}
    if($("productsSectionDescription")){const v=bi(merch?.body||"");$("productsSectionDescription").value=v.ar||"";$("productsSectionDescriptionEn").value=v.en||"";}

    savedSections.forEach(s=>{
      const panel=document.querySelector(`.content-panel[data-key="${s.section_key}"]`);
      if(!panel)return;
      {const e=bi(s.eyebrow),t=bi(s.title),b=bi(s.body);panel.querySelector(".sec-eyebrow").value=e.ar;panel.querySelector(".sec-eyebrow-en").value=e.en;panel.querySelector(".sec-title").value=t.ar;panel.querySelector(".sec-title-en").value=t.en;panel.querySelector(".sec-body").value=b.ar;panel.querySelector(".sec-body-en").value=b.en;}
      panel.querySelector(".sec-enabled").checked=!!s.enabled;
    });
  }

  async function loadImages(){
    document.querySelectorAll(".section-images").forEach(x=>x.innerHTML="");
    const {data,error}=await sb.from("project_images").select("*").eq("project_id",currentProject.id).order("sort_order");
    if(error){setStatus("تعذر تحميل الصور: "+readableError(error));return}
    (data||[]).forEach(img=>{
      if(!SECTION_DEFS.some(x=>x.key===img.section_key))return;
      addImageRow(img.section_key,img);
    });
  }

  function productCard(p={id:"",title:"تيشيرت",front_url:"",back_url:"",motion:"interactive",sort_order:1,enabled:true}){
    const pt=bi(p.title);
    const wrap=document.createElement("article");
    wrap.className="product-card";
    wrap.dataset.id=p.id||"";
    wrap.innerHTML=`
      <div class="product-head">
        <strong>${pt.ar||pt.en||"منتج"}</strong>
        <button class="btn danger remove-product" type="button">حذف المنتج</button>
      </div>
      <div class="product-fields">
        <div>
          <label>اسم المنتج — عربي</label>
          <input class="prod-title" value="${String(pt.ar||"تيشيرت").replaceAll('"',"&quot;")}">
          <label style="margin-top:8px">Product name — English</label>
          <input class="prod-title-en" dir="ltr" value="${String(pt.en||"").replaceAll('"',"&quot;")}">
        </div>
        <div>
          <label>ترتيب المنتج</label>
          <input class="prod-sort" type="number" value="${p.sort_order??1}">
        </div>
      </div>

      <div class="product-fields">
        <div>
          <label>صورة الوش</label>
          <input class="prod-front-file" type="file" accept="image/*">
          <input class="prod-front-url" dir="ltr" value="${String(p.front_url||"").replaceAll('"',"&quot;")}" placeholder="رابط صورة الوش" style="margin-top:6px">
        </div>
        <div>
          <label>صورة الضهر</label>
          <input class="prod-back-file" type="file" accept="image/*">
          <input class="prod-back-url" dir="ltr" value="${String(p.back_url||"").replaceAll('"',"&quot;")}" placeholder="رابط صورة الضهر" style="margin-top:6px">
        </div>
      </div>

      <div class="product-fields">
        <div>
          <label>طريقة الحركة</label>
          <select class="prod-motion">
            <option value="interactive" ${p.motion==="interactive"?"selected":""}>تفاعلي بالسحب + يرجع لوحده</option>
            <option value="auto" ${p.motion==="auto"?"selected":""}>يلف تلقائيًا</option>
            <option value="hover" ${p.motion==="hover"?"selected":""}>يلف عند المرور</option>
            <option value="static" ${p.motion==="static"?"selected":""}>ثابت</option>
          </select>
        </div>
        <div class="checkline">
          <input class="prod-enabled" type="checkbox" ${p.enabled!==false?"checked":""}>
          <label style="margin:0">إظهار المنتج</label>
        </div>
      </div>

      <div class="product-preview"></div>
    `;

    const preview=wrap.querySelector(".product-preview");
    const renderPreview=()=>{
      const front=wrap.querySelector(".prod-front-url").value.trim();
      const back=wrap.querySelector(".prod-back-url").value.trim();
      preview.innerHTML="";
      if(front)preview.insertAdjacentHTML("beforeend",`<img src="${front}" alt="وش">`);
      if(back)preview.insertAdjacentHTML("beforeend",`<img src="${back}" alt="ضهر">`);
      if(!front&&!back)preview.innerHTML='<span class="muted">ارفع الوش والضهر</span>';
    };

    wrap.querySelector(".prod-title").addEventListener("input",e=>{
      wrap.querySelector(".product-head strong").textContent=e.target.value||wrap.querySelector(".prod-title-en").value||"منتج";
      markState("غير محفوظ");
    });
    wrap.querySelector(".prod-front-url").addEventListener("input",renderPreview);
    wrap.querySelector(".prod-back-url").addEventListener("input",renderPreview);

    wrap.querySelector(".prod-front-file").onchange=async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try{
        setStatus("جاري رفع صورة الوش...");
        const url=await uploadFile(f,`products/${currentProject?.slug||"project"}`);
        wrap.querySelector(".prod-front-url").value=url;
        renderPreview();markState("غير محفوظ");
        setStatus("تم رفع صورة الوش.");
      }catch(err){setStatus("فشل رفع صورة الوش: "+readableError(err))}
    };

    wrap.querySelector(".prod-back-file").onchange=async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try{
        setStatus("جاري رفع صورة الضهر...");
        const url=await uploadFile(f,`products/${currentProject?.slug||"project"}`);
        wrap.querySelector(".prod-back-url").value=url;
        renderPreview();markState("غير محفوظ");
        setStatus("تم رفع صورة الضهر.");
      }catch(err){setStatus("فشل رفع صورة الضهر: "+readableError(err))}
    };

    wrap.querySelector(".remove-product").onclick=async()=>{
      if(wrap.dataset.id && currentProject){
        const {error}=await sb.from("project_products").delete().eq("id",wrap.dataset.id);
        if(error){setStatus("تعذر حذف المنتج: "+readableError(error));return}
      }
      wrap.remove();
      markState("غير محفوظ");
    };

    renderPreview();
    return wrap;
  }

  function addProduct(p){
    $("productList").appendChild(productCard(p));
  }

  async function loadProducts(){
    $("productList").innerHTML="";
    if(!currentProject)return;
    const {data,error}=await sb.from("project_products").select("*").eq("project_id",currentProject.id).order("sort_order");
    if(error){setStatus("تعذر تحميل المنتجات: "+readableError(error));return}
    products=data||[];
    products.forEach(addProduct);
    if(!products.length)$("productList").innerHTML='<p class="muted empty-products">لسه مفيش منتجات. اضغط «إضافة منتج».</p>';
  }

  async function saveProducts(){
    if(!currentProject){setStatus("احفظ المشروع الأول.");return}
    try{
      setStatus("جاري حفظ المنتجات...");

      const merchPayload={
        project_id:currentProject.id,
        section_key:"merch",
        eyebrow:pack($("productsEyebrow")?.value||"المنتجات",$("productsEyebrowEn")?.value||"Products"),
        title:pack($("productsSectionTitle")?.value||"المنتجات",$("productsSectionTitleEn")?.value||"Products"),
        body:pack($("productsSectionDescription")?.value||"",$("productsSectionDescriptionEn")?.value||""),
        image_ratio:"auto",
        layout:"products",
        sort_order:5,
        enabled:true
      };
      const {error:merchError}=await sb.from("project_sections").upsert(merchPayload,{onConflict:"project_id,section_key"});
      if(merchError)throw merchError;

      const cards=[...document.querySelectorAll(".product-card")];
      for(let i=0;i<cards.length;i++){
        const c=cards[i];
        const payload={
          project_id:currentProject.id,
          title:pack(c.querySelector(".prod-title").value||`منتج ${i+1}`,c.querySelector(".prod-title-en").value||`Product ${i+1}`),
          front_url:c.querySelector(".prod-front-url").value.trim()||null,
          back_url:c.querySelector(".prod-back-url").value.trim()||null,
          motion:c.querySelector(".prod-motion").value||"interactive",
          sort_order:Number(c.querySelector(".prod-sort").value||i+1),
          enabled:c.querySelector(".prod-enabled").checked
        };
        if(c.dataset.id){
          const {error}=await sb.from("project_products").update(payload).eq("id",c.dataset.id);
          if(error)throw error;
        }else{
          const {data,error}=await sb.from("project_products").insert(payload).select("id").single();
          if(error)throw error;
          c.dataset.id=data.id;
        }
      }
      markState("محفوظ");
      setStatus("تم حفظ المنتجات ✅");
    }catch(e){setStatus("تعذر حفظ المنتجات: "+readableError(e))}
  }

  async function openProject(id){
    currentProject=projects.find(p=>String(p.id)===String(id));
    if(!currentProject)return;
    fillBase(currentProject);
    await loadSections();
    await Promise.all([loadImages(),loadProducts()]);
    await loadProjects();
    markState("محفوظ");
    setStatus("");
  }

  async function saveBase(e){
    e.preventDefault();
    try{
      setStatus("جاري الحفظ...");
      const payload={
        title:pack($("title").value,$("titleEn").value),
        slug:$("slug").value.trim(),
        category:pack($("category").value,$("categoryEn").value),
        subtitle:pack($("subtitle").value,$("subtitleEn").value),
        cover_url:$("coverUrl").value.trim()||null,
        logo_url:$("logoUrl").value.trim()||null,
        accent_color:$("accentColor").value||"#9d1717",
        mood:$("mood").value||"dark",
        hero_motion:$("heroMotion").value||"amur",
        hero_style:$("heroStyle").value||"royal",
        hero_logo_size:Number($("heroLogoSize").value||100),
        sort_order:Number($("sortOrder").value||0),
        published:$("published").checked
      };

      let data,error;
      if(currentProject){
        ({data,error}=await sb.from("projects").update(payload).eq("id",currentProject.id).select("*").single());
      }else{
        ({data,error}=await sb.from("projects").insert(payload).select("*").single());
      }
      if(error)throw error;
      currentProject=data;
      fillBase(data);
      await loadProjects();
      markState("محفوظ");
      setStatus("تم حفظ بيانات المشروع ✅");
    }catch(e){
      setStatus("تعذر الحفظ: "+readableError(e));
    }
  }

  async function saveSections(){
    if(!currentProject){setStatus("احفظ المشروع الأول.");return}
    try{
      setStatus("جاري حفظ المحتوى...");

      const activeKeys=SECTION_DEFS.map(d=>d.key);
      const {data:oldSections,error:oldSectionsError}=await sb
        .from("project_sections")
        .select("section_key")
        .eq("project_id",currentProject.id);
      if(oldSectionsError)throw oldSectionsError;

      const omitted=(oldSections||[])
        .filter(s=>s.section_key!=="merch"&&!activeKeys.includes(s.section_key))
        .map(s=>s.section_key);

      if(omitted.length){
        const {error:disableError}=await sb
          .from("project_sections")
          .update({enabled:false})
          .eq("project_id",currentProject.id)
          .in("section_key",omitted);
        if(disableError)throw disableError;
      }

      for(let i=0;i<SECTION_DEFS.length;i++){
        const d=SECTION_DEFS[i];
        const panel=document.querySelector(`.content-panel[data-key="${d.key}"]`);
        const payload={
          project_id:currentProject.id,
          section_key:d.key,
          eyebrow:pack(panel.querySelector(".sec-eyebrow").value,panel.querySelector(".sec-eyebrow-en").value),
          title:pack(panel.querySelector(".sec-title").value,panel.querySelector(".sec-title-en").value),
          body:pack(panel.querySelector(".sec-body").value,panel.querySelector(".sec-body-en").value),
          image_ratio:"auto",
          layout:"editorial",
          sort_order:i+1,
          enabled:panel.querySelector(".sec-enabled").checked
        };
        const {error}=await sb.from("project_sections").upsert(payload,{onConflict:"project_id,section_key"});
        if(error)throw error;
      }

      for(const d of SECTION_DEFS){
        const rows=[...document.querySelectorAll(`.section-images[data-key="${d.key}"] .image-row`)];
        for(let i=0;i<rows.length;i++){
          const row=rows[i],url=row.querySelector(".img-url").value.trim();
          if(!url)continue;
          const payload={
            project_id:currentProject.id,
            section_key:d.key,
            image_url:url,
            caption:row.querySelector(".img-caption").value.trim(),
            sort_order:Number(row.querySelector(".img-sort").value||i+1)
          };
          if(row.dataset.id){
            const {error}=await sb.from("project_images").update(payload).eq("id",row.dataset.id);
            if(error)throw error;
          }else{
            const {data,error}=await sb.from("project_images").insert(payload).select("id").single();
            if(error)throw error;
            row.dataset.id=data.id;
          }
        }
      }
      markState("محفوظ");
      setStatus("تم حفظ محتوى المشروع ✅");
    }catch(e){setStatus("تعذر حفظ المحتوى: "+readableError(e))}
  }

  async function deleteProject(){
    if(!currentProject||!confirm("متأكد إنك عايز تحذف المشروع كله؟"))return;
    const {error}=await sb.from("projects").delete().eq("id",currentProject.id);
    if(error){setStatus("تعذر حذف المشروع: "+readableError(error));return}
    currentProject=null;
    fillBase(null);
    setSectionCount(6,[]);
    renderContentTabs();
    $("productList").innerHTML="";
    await loadProjects();
    setStatus("تم حذف المشروع.");
  }

  $("heroLogoSize").addEventListener("input",()=>{
    $("heroLogoSizeValue").textContent=`${$("heroLogoSize").value}%`;
    markState("غير محفوظ");
  });

  $("title").addEventListener("input",()=>{if(!currentProject)$("slug").value=slugify($("title").value)});
  $("projectForm").onsubmit=saveBase;
  $("saveSectionsBtn").onclick=saveSections;
  $("applySectionCountBtn").onclick=applySectionCount;
  $("sectionCount").addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();applySectionCount();}
  });
  $("saveProductsBtn").onclick=saveProducts;
  $("deleteProjectBtn").onclick=deleteProject;
  $("addProductBtn").onclick=()=>{
    document.querySelector(".empty-products")?.remove();
    addProduct({title:`تيشيرت ${document.querySelectorAll(".product-card").length+1}`,sort_order:document.querySelectorAll(".product-card").length+1});
    markState("غير محفوظ");
  };

  $("newProjectBtn").onclick=()=>{
    currentProject=null;
    fillBase(null);
    renderContentTabs();
    $("productList").innerHTML='<p class="muted empty-products">احفظ المشروع الأول، وبعدها أضف المنتجات.</p>';
    markState("غير محفوظ");
    setStatus("");
  };

  $("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.href="login.html"};

  $("coverFile").onchange=async()=>{
    const f=$("coverFile").files?.[0];if(!f)return;
    try{
      setStatus("جاري رفع صورة الخلفية...");
      const url=await uploadFile(f,"covers");
      $("coverUrl").value=url;
      setStatus("تم رفع صورة الخلفية.");
      markState("غير محفوظ");
    }catch(e){setStatus("فشل رفع الصورة: "+readableError(e))}
  };

  $("logoUrl").addEventListener("input",()=>{
    const u=$("logoUrl").value.trim();
    $("logoPreview").innerHTML=u?`<img src="${u}" alt="لوجو المشروع">`:'<span class="muted">لم يتم رفع لوجو بعد</span>';
  });

  $("logoFile").onchange=async()=>{
    const f=$("logoFile").files?.[0];if(!f)return;
    try{
      setStatus("جاري رفع اللوجو...");
      const url=await uploadFile(f,"logos");
      $("logoUrl").value=url;
      $("logoPreview").innerHTML=`<img src="${url}" alt="لوجو المشروع">`;
      setStatus("تم رفع اللوجو.");
      markState("غير محفوظ");
    }catch(e){setStatus("فشل رفع اللوجو: "+readableError(e))}
  };

  setupMainTabs();
  renderContentTabs();
  auth().then(ok=>{if(ok)loadProjects()});
})();