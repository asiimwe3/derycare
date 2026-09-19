/* ═══ DeryCare marketplace engine — products, cart, checkout, orders, WhatsApp ═══ */
const WA = "256762306675";
const UGX = n => "UGX " + n.toLocaleString("en-UG");
const $ = id => document.getElementById(id);

/* ── Supabase backend (orders & bookings persist server-side) ── */
const SB_URL = "https://emldbjqegftrngxypeca.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjQzNTIsImV4cCI6MjA5MzkwMDM1Mn0.cofNEj5g3n9ls2HTXFXQG1_IXPUdLINDtYr820u2MtM";
async function sbInsert(table, row){
  try{
    const r = await fetch(SB_URL + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        "apikey": SB_ANON,
        "Authorization": "Bearer " + SB_ANON,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });
    if(!r.ok){ console.warn("Supabase insert failed:", r.status, await r.text()); return false; }
    console.info("Saved to DeryCare backend:", table);
    return true;
  }catch(e){ console.warn("Backend unreachable; order continues via WhatsApp"); return false; }
}

/* ── Categories ── */
const CATS = [
  { id:"home",   label:"Home Cleaning", ico:"🏠", img:"multi-surface.png" },
  { id:"laundry",label:"Laundry",       ico:"👕", img:"laundry.png" },
  { id:"shoe",   label:"Shoe Care",    ico:"👟", img:"shoe-polish.png" },
  { id:"floor",  label:"Floor Care",   ico:"🧼", img:"floor.png" },
  { id:"bath",   label:"Bathroom Care", ico:"🚿", img:"toilet.png" },
  { id:"kitchen",label:"Kitchen Care",  ico:"🍽️", img:"dishwash.png" },
  { id:"disin",  label:"Disinfectants", ico:"🧪", img:"toilet.png" },
  { id:"hands",  label:"Hand Hygiene",  ico:"🧼", img:"handwash.png" },
  { id:"bulk",   label:"Bulk Products", ico:"🛢️", img:"floor.png" },
  { id:"equip",  label:"Cleaning Equipment", ico:"🧹", img:null }
];
const SHOP_CATS = [
  "Disinfectants","Liquid Soap","Cleaning Chemicals","Brooms & Brushes","Buckets & Mops",
  "Tissue & Paper Products","Laundry Products","Shoe Care","Home Hygiene","Business Cleaning Supplies"
];

/* ── Products (real DeryCare catalogue; bulk sizes have real unit savings) ── */
const PRODUCTS = [
  { id:"msc", name:"Multi-Surface Cleaner", cat:"Home Hygiene", cats:["home","kitchen","disin","bulk"], brand:"DeryCare", rating:4.8, reviews:24,
    benefit:"Cleans · Shines · Freshens — for a cleaner, healthier home",
    desc:"DeryCare Multi-Surface Cleaner is a versatile everyday cleaner for floors, tables, counters, tiles and more. Developed for Ugandan homes and businesses: one product, many surfaces, one clean standard.",
    howto:"Dilute as needed for the surface (light cleaning: capful in 5L of water). Apply with a cloth or mop, then wipe or leave to air-dry. No rinsing required for most surfaces.",
    safety:"Keep out of reach of children. Avoid contact with eyes. Do not mix with other chemicals. For external cleaning use only.",
    img:"multi-surface.png", color:"#3fae5a",
    sizes:[["500ml",12000],["1L",19000],["5L",72000],["20L",228000]], stock: true, tags:["featured","bestseller","household"] },
  { id:"floor", name:"Floor Cleaner", cat:"Home Hygiene", cats:["floor","home","bulk"], brand:"DeryCare", rating:4.7, reviews:18, prev:7000,
    benefit:"Deep clean with a fresh, long-lasting fragrance",
    desc:"DeryCare Floor Cleaner lifts dirt and stains from tiles, cement and wooden floors, leaving a fresh fragrance and a streak-free shine.",
    howto:"Mix with water per the label's guide (approx. 2 caps per 5L for daily mopping). Mop evenly and allow to dry.",
    safety:"Keep out of reach of children. Avoid contact with eyes. Do not ingest.",
    img:"floor.png", color:"#1b6fd6",
    sizes:[["500ml",5500],["1L",8500],["5L",31000],["20L",98000]], stock: true, tags:["featured","household"] },
  { id:"glass", name:"Glass Cleaner", cat:"Home Hygiene", cats:["home"], brand:"DeryCare", rating:4.6, reviews:11, prev:6000,
    benefit:"Streak-free, crystal-clear shine for glass and mirrors",
    desc:"DeryCare Glass Cleaner dissolves grease, dust and fingerprints on windows, mirrors, screens and glass tables for a crystal-clear finish.",
    howto:"Spray on the surface and wipe with a clean, dry cloth or lint-free towel. For best results use one wet pass, one dry pass.",
    safety:"Keep out of reach of children. Avoid contact with eyes. Use in a ventilated area.",
    img:"glass.png", color:"#3fb6d6",
    sizes:[["500ml",5000],["1L",8000]], stock: true, tags:["featured","new"] },
  { id:"toilet", name:"Toilet Cleaner", cat:"Disinfectants", cats:["bath","home","bulk","disin"], brand:"DeryCare", rating:4.8, reviews:21,
    benefit:"Removes stains · Kills germs · Long-lasting freshness",
    desc:"DeryCare Toilet Cleaner clings to the bowl, removes tough stains and kills germs, leaving a fresh, clean scent.",
    howto:"Apply around the bowl under the rim, leave for a few minutes, scrub with a brush and flush. Use regularly for best results.",
    safety:"Corrosive. Keep out of reach of children. Do not mix with bleach or other chemicals.",
    img:"toilet.png", color:"#7a3fc9",
    sizes:[["500ml",6000],["1L",9500],["5L",33000],["20L",99000]], stock: true, tags:["featured","bestseller","household"] },
  { id:"dish", name:"Dishwashing Liquid", cat:"Liquid Soap", cats:["kitchen","home","bulk"], brand:"DeryCare", rating:4.9, reviews:31, prev:12500,
    benefit:"Powerful grease removal with a fresh lemon scent",
    desc:"DeryCare Dishwashing Liquid cuts through grease fast while staying gentle on hands. A little goes a long way.",
    howto:"Add a small amount to warm water, wash, then rinse. For heavy grease, apply directly to the sponge.",
    safety:"Keep out of reach of children. Avoid contact with eyes. Not for drinking.",
    img:"dishwash.png", color:"#eab308",
    sizes:[["500ml",10000],["1L",16500],["5L",58000],["20L",175000]], stock: true, tags:["featured","bestseller","household"] },
  { id:"handwash", name:"Hand Wash", cat:"Liquid Soap", cats:["hands","home","bath","bulk"], brand:"DeryCare", rating:4.8, reviews:27,
    benefit:"Gentle on skin · Kills germs · Soft & fresh",
    desc:"DeryCare Hand Wash cleans and protects with a soft fragrance the whole family will love. Available in a handy 250ml size.",
    howto:"Wet hands, apply, lather for at least 20 seconds, then rinse with clean water.",
    safety:"For external use only. Keep out of reach of children. Avoid contact with eyes.",
    img:"handwash.png", color:"#e0559b",
    sizes:[["250ml",1000],["500ml",12000],["1L",19000],["5L",64000],["20L",192000]], stock: true, tags:["featured","bestseller","new","household"] },
  { id:"shoe", name:"Shoe Polish", cat:"Shoe Care", cats:["shoe"], brand:"DeryCare", rating:4.7, reviews:15,
    benefit:"Restores · Protects · Shines",
    desc:"DeryCare Shoe Polish cleans, restores colour and protects leather shoes for a lasting professional shine.",
    howto:"Clean the shoe, apply a thin layer with a brush or cloth, allow to dry briefly, then buff to a shine.",
    safety:"For leather shoes. Keep out of reach of children. Do not ingest.",
    img:"shoe-polish.png", color:"#22252a",
    sizes:[["75ml",8000],["100ml",10500]], stock: true, tags:["featured","household"] },
  { id:"laundry", name:"Laundry Detergent", cat:"Laundry Products", cats:["laundry","bulk"], brand:"DeryCare", rating:4.8, reviews:26, prev:18000,
    benefit:"Bright clothes with an ocean-fresh scent",
    desc:"DeryCare Laundry Detergent removes dirt and stains while keeping colours bright — for hand washing and machine washing.",
    howto:"Follow the label guide for your load size. For tough stains, pre-soak before washing.",
    safety:"Keep out of reach of children. Avoid contact with eyes. Do not ingest.",
    img:"laundry.png", color:"#2f6fd0",
    sizes:[["1L",15000],["5L",60000],["20L",198000]], stock: true, tags:["featured","bestseller","household"] }
];

/* ── Cart & saved items (localStorage) ── */
let cart = JSON.parse(localStorage.getItem("derycart") || "[]");
let saved = JSON.parse(localStorage.getItem("derysaved") || "[]");
let orders = JSON.parse(localStorage.getItem("deryorders") || "[]");
let wish = JSON.parse(localStorage.getItem("derywish") || "[]");
function persist(){ localStorage.setItem("derycart", JSON.stringify(cart)); localStorage.setItem("derysaved", JSON.stringify(saved)); localStorage.setItem("deryorders", JSON.stringify(orders)); localStorage.setItem("derywish", JSON.stringify(wish)); syncBadges(); }
function toggleWish(pid){
  const i = wish.indexOf(pid);
  if(i === -1){ wish.push(pid); toast("Added to wishlist ♥"); } else { wish.splice(i,1); toast("Removed from wishlist"); }
  persist();
  document.querySelectorAll(`[data-wish="${pid}"]`).forEach(b => b.classList.toggle("on", wish.includes(pid)));
}
function syncBadges(){
  const n = cart.reduce((s,l) => s + l.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => { el.textContent = n > 9 ? "9+" : n; el.classList.toggle("show", n > 0); });
}
function getP(id){ return PRODUCTS.find(p => p.id === id); }
function addToCart(pid, sizeLabel, qty){
  const p = getP(pid); if(!p) return;
  const size = sizeLabel || p.sizes[0][0];
  const line = cart.find(l => l.id === pid && l.size === size);
  if(line) line.qty += (qty||1); else cart.push({ id: pid, size, qty: qty||1 });
  persist(); toast(`${p.name} (${size}) added to cart`); refreshPage();
}
function buyNow(pid, sizeLabel){ addToCart(pid, sizeLabel, 1); location.href = "checkout.html"; }
function setQty(i, d){ cart[i].qty += d; if(cart[i].qty < 1) cart.splice(i,1); persist(); refreshPage(); }
function rm(i){ cart.splice(i,1); persist(); refreshPage(); }
function saveForLater(i){ const l = cart.splice(i,1)[0]; if(!saved.find(s => s.id === l.id && s.size === l.size)) saved.push(l); persist(); refreshPage(); }
function moveToCart(i){ const l = saved.splice(i,1)[0]; const ex = cart.find(c => c.id === l.id && c.size === l.size); if(ex) ex.qty += l.qty; else cart.push(l); persist(); refreshPage(); }
function rmSaved(i){ saved.splice(i,1); persist(); refreshPage(); }
function cartTotal(){ return cart.reduce((s,l) => { const p = getP(l.id); const pr = p ? (p.sizes.find(s => s[0] === l.size) || p.sizes[0])[1] : 0; return s + pr * l.qty; }, 0); }
function linePrice(l){ const p = getP(l.id); if(!p) return 0; return (p.sizes.find(s => s[0] === l.size) || p.sizes[0])[1]; }

/* ── Order numbers & statuses ── */
const ORDER_STATUSES = ["Pending Payment","Payment Processing","Paid","Processing","Ready for Delivery","Out for Delivery","Delivered","Cancelled","Refunded"];
function newOrderNumber(){
  const y = new Date().getFullYear();
  let n = parseInt(localStorage.getItem("deryorderseq") || "0", 10) + 1;
  localStorage.setItem("deryorderseq", String(n));
  return "DC-" + y + "-" + String(n).padStart(6, "0");
}

/* ── WhatsApp helpers (context-aware pre-filled messages) ── */
function waMsg(text){ open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank"); }
const waChat = () => waMsg("Hello DeryCare! I have a question.");
function waProduct(pid, size){
  const p = getP(pid); if(!p) return;
  waMsg(`Hello DeryCare! I am interested in ${p.name}${size ? " (" + size + ")" : ""}. Please share more details. Thank you!`);
}
function waCheckout(){
  if(!cart.length){ toast("Your cart is empty"); return; }
  let m = "Hello DeryCare! I would like to order:\n\n";
  cart.forEach(l => m += `• ${getP(l.id).name} (${l.size}) x${l.qty} — ${UGX(linePrice(l)*l.qty)}\n`);
  m += `\nTotal: ${UGX(cartTotal())}\nOrder number: ${newOrderNumber()}\n\nName:\nDelivery location:`;
  waMsg(m);
}
function waOrderSupport(){ waMsg(`Hello DeryCare! I need support with my order (order number: …).`); }
function waBulk(){ waMsg("Hello DeryCare! I would like a bulk / wholesale quote. Products and quantities:"); }
function waBooking(service){ waMsg(`Hello DeryCare! I would like to book ${service || "a cleaning service"}.\n\nName:\nLocation:\nPreferred date:`); }
function waJobApply(role){ waMsg(`Hello DeryCare! I would like to apply for the ${role} position.\n\nName:\nLocation:\nExperience:`); }

/* ── Floating WhatsApp: context-aware message ── */
function waFloatMsg(){
  const page = location.pathname.split("/").pop() || "index.html";
  if(page === "cart.html" || page === "checkout.html") return waOrderSupport();
  if(page === "business.html") return waBulk();
  if(page === "services.html" || page === "book.html") return waBooking();
  if(page === "product.html") return waMsg("Hello DeryCare! I have a question about a product.");
  if(page === "shop.html") return waMsg("Hello DeryCare! I am looking for a cleaning product: ");
  return waChat();
}

/* ── Shared chrome: announcement, nav, bottom bar, float, toast ── */
const NAV = [
  ["index.html","Home"],["shop.html","Shop"],["services.html","Services"],
  ["business.html","Business"],["jobs.html","Careers"],["about.html","About"],["contact.html","Contact"]
];
function chrome(active){
  const links = NAV.map(([href,label]) => `<a href="${href}" class="${href===active?'active':''}">${label}</a>`).join("");
  const mlinks = NAV.map(([href,label]) => `<a href="${href}">${label}</a>`).join("") +
    `<a href="account.html">Account</a><a href="cart.html">Cart</a>`;
  document.body.insertAdjacentHTML("afterbegin", `
  <div id="announce">🚚 <b>Products delivered across Uganda</b> &nbsp;|&nbsp; 🧹 <b>Cleaning across Western Uganda</b> &nbsp;|&nbsp; 💼 <b>We're hiring — <a href="jobs.html" style="color:#fff;text-decoration:underline">apply on WhatsApp</a></b></div>
  <header><div class="wrap">
    <nav class="nav">
      <a class="brand" href="index.html"><img src="assets/img/brand/logo.png" alt="DeryCare — Clean Living. Made Simple."></a>
      <form class="nav-search" onsubmit="event.preventDefault(); location.href='shop.html?q='+encodeURIComponent(this.q.value);">
        <input name="q" type="search" placeholder="Search products & services…" aria-label="Search products and services">
        <button type="submit" aria-label="Search">🔍</button>
      </form>
      <div class="nav-links">${links}</div>
      <div class="nav-cta">
        <a class="btn btn-primary btn-sm" href="shop.html">Shop Products</a>
        <a class="btn btn-green btn-sm" href="book.html">📅 Book Cleaning</a>
        <button class="btn btn-wa btn-sm nav-wa" onclick="waChat()" aria-label="WhatsApp">💬</button>
        <a class="icon-btn" href="account.html" aria-label="Account">👤</a>
        <a class="icon-btn" href="cart.html" aria-label="Cart">🛒<span class="cart-count">0</span></a>
      </div>
      <button id="menuBtn" aria-label="Menu">☰</button>
    </nav>
    <div id="mobileNav">${mlinks}</div>
  </div></header>
  <div id="bottomBar">
    <a href="index.html" class="${active==='index.html'?'on':''}"><span class="bb-ico">🏠</span>Home</a>
    <a href="shop.html#cats" class="${active==='shop.html'?'on':''}"><span class="bb-ico">🗂️</span>Categories</a>
    <a href="shop.html" class="${active==='shop.html'?'on':''}"><span class="bb-ico">🧴</span>Shop</a>
    <a href="cart.html" class="${active==='cart.html'?'on':''}"><span class="bb-ico">🛒<span class="cart-count">0</span></span>Cart</a>
    <a href="account.html" class="${active==='account.html'?'on':''}"><span class="bb-ico">👤</span>Account</a>
  </div>
  <button id="waFloat" aria-label="Chat with DeryCare on WhatsApp" onclick="waFloatMsg()">
    <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.4 0 .6l-.4.6-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2.3 1.1c.3.2.6.3.6.4.1.2.1.7-.1 1.3Z"/></svg>
  </button>
  <div class="toast" id="toast"></div>`);
  $("menuBtn").onclick = () => $("mobileNav").classList.toggle("open");
  syncBadges();
}
let toastTimer;
function toast(msg){
  const t = $("toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1900);
}
function refreshPage(){ if(typeof renderShop === "function") renderShop(); if(typeof renderCart === "function") renderCart(); if(typeof renderProduct === "function") renderProduct(); }

/* ── Cards ── */
function ratingHTML(p){
  const r = p.rating || null;
  if(!r) return `<div class="p-rating">⭐ <i>New</i></div>`;
  return `<div class="p-rating">⭐ <b>${r.toFixed(1)}</b> <span>(${p.reviews})</span></div>`;
}
function priceHTML(p, size, price){
  const prev = p.prev || null;
  const disc = prev ? Math.round((1 - price/prev) * 100) : null;
  return `<div class="p-price">${UGX(price)} ${prev ? `<span class="p-old">${UGX(prev)}</span>` : ""} <small>/ ${size}</small></div>`;
}
function discBadge(p){
  const prev = p.prev || null;
  if(!prev) return null;
  const price = p.sizes[0][1];
  return Math.round((1 - price/prev) * 100) + "% OFF";
}
function unitML(label){
  const m = label.match(/^([\d.]+)\s*(ml|ML|l|L)$/);
  if(!m) return null;
  return parseFloat(m[1]) * (m[2].toLowerCase() === "l" ? 1000 : 1);
}
function bulkDeal(p){
  /* Real deal: per-litre price of the largest size vs smallest. */
  const s = p.sizes; if(s.length < 2) return null;
  const first = s[0], last = s[s.length-1];
  const uf = unitML(first[0]), ul = unitML(last[0]);
  if(!uf || !ul) return null;
  const perFirst = first[1]/uf, perLast = last[1]/ul;
  const save = Math.round((1 - perLast/perFirst) * 100);
  return save >= 15 ? `Save up to ${save}% on ${last[0]}` : null;
}
function pCard(p, sizeIdx = 0){
  const [size, price] = p.sizes[sizeIdx];
  const deal = bulkDeal(p);
  const disc = discBadge(p);
  return `<div class="p-card">
    ${disc ? `<span class="p-badge deal">-${disc}</span>` : deal ? `<span class="p-badge deal">${deal}</span>` : `<span class="p-badge">In Stock</span>`}
    <button class="wish-btn ${wish.includes(p.id) ? "on" : ""}" data-wish="${p.id}" onclick="event.preventDefault();toggleWish('${p.id}')" aria-label="Add to wishlist">♥</button>
    <a href="product.html?id=${p.id}"><div class="p-img"><img src="assets/img/products/${p.img}" alt="${p.name}" loading="lazy"></div></a>
    <div class="p-body">
      <span class="p-brand">${p.brand}</span>
      <a href="product.html?id=${p.id}" class="p-name">${p.name}</a>
      ${ratingHTML(p)}
      ${priceHTML(p, size, price)}
      <div class="p-stock in-stock">✓ In stock · ${p.sizes.length} size${p.sizes.length>1?"s":""}</div>
      <div class="p-delivery">🚚 Delivery available</div>
      <div class="p-actions">
        <span class="qty-mini"><button onclick="cqStep(this,-1)">−</button><b class="qnum">1</b><button onclick="cqStep(this,1)">+</button></span>
        <button class="btn btn-primary" onclick="addToCartCard('${p.id}','${size}',this)">Add to Cart</button>
      </div>
      <button class="btn btn-green btn-block" style="margin-top:6px" onclick="buyNowCard('${p.id}','${size}',this)">Buy Now</button>
    </div></div>`;
}
function cqStep(btn, d){
  const q = btn.parentElement.querySelector(".qnum");
  q.textContent = Math.max(1, parseInt(q.textContent, 10) + d);
}
function cq(btn){ return Math.max(1, parseInt(btn.closest(".p-card").querySelector(".qnum").textContent, 10)); }
function addToCartCard(pid, size, btn){ addToCart(pid, size, cq(btn)); }
function buyNowCard(pid, size, btn){ addToCart(pid, size, cq(btn)); location.href = "checkout.html"; }
function pCardList(p){
  const [size, price] = p.sizes[0];
  return `<div class="p-card" style="flex-direction:row;align-items:center">
    <a href="product.html?id=${p.id}" style="flex:none"><div class="p-img" style="height:120px;width:130px"><img src="assets/img/products/${p.img}" alt="${p.name}" loading="lazy"></div></a>
    <div class="p-body" style="padding:12px 14px">
      <span class="p-brand">${p.brand}</span>
      <a href="product.html?id=${p.id}" class="p-name">${p.name}</a>
      <div class="p-benefit" style="display:block">${p.benefit}</div>
      ${ratingHTML(p)}
      ${priceHTML(p, size, price)}
      <div class="p-delivery">🚚 Delivery available</div>
      <div class="p-actions" style="max-width:360px">
        <span class="qty-mini"><button onclick="cqStep(this,-1)">−</button><b class="qnum">1</b><button onclick="cqStep(this,1)">+</button></span>
        <button class="btn btn-primary" onclick="addToCartCard('${p.id}','${size}',this)">Add to Cart</button>
        <button class="btn btn-green" onclick="buyNowCard('${p.id}','${size}',this)">Buy Now</button>
      </div>
    </div></div>`;
}

/* ── Shop page ── */
let currentNeed = "all", currentQuery = "", currentSort = "popular", gridView = true, onlyInStock = false;
function renderShop(){
  const grid = $("shopGrid"); if(!grid) return;
  let list = PRODUCTS.filter(p => currentNeed === "all" || p.cats.includes(currentNeed) || p.cat === currentNeed);
  if(currentQuery){ const q = currentQuery.toLowerCase();
    list = list.filter(p => (p.name + " " + p.benefit + " " + p.cat).toLowerCase().includes(q)); }
  if(onlyInStock) list = list.filter(p => p.stock);
  if(currentSort === "price-asc") list = [...list].sort((a,b) => a.sizes[0][1]-b.sizes[0][1]);
  if(currentSort === "price-desc") list = [...list].sort((a,b) => b.sizes[0][1]-a.sizes[0][1]);
  if(currentSort === "name") list = [...list].sort((a,b) => a.name.localeCompare(b.name));
  if(currentSort === "newest") list = [...list].sort((a,b) => (b.tags.includes("new") ? 1 : 0) - (a.tags.includes("new") ? 1 : 0));
  grid.className = currentNeed === "all" && !currentQuery ? "p-grid" + (gridView ? "" : " list") : "p-grid" + (gridView ? "" : " list");
  grid.innerHTML = (gridView ? list.map(p => pCard(p)) : list.map(p => pCardList(p))).join("") ||
    `<div class="card center" style="grid-column:1/-1"><h3>No products found${currentQuery ? ` for "${currentQuery}"` : ""}</h3>
      <p class="mt8">New categories are being stocked. <a href="javascript:waChat()">Ask us on WhatsApp</a> — we may have it.</p></div>`;
}
function pickNeed(id){
  currentNeed = id;
  document.querySelectorAll("#catChips .chip").forEach(c => c.classList.toggle("on", c.dataset.need === id));
  renderShop();
}

/* ── Product detail page ── */
let pdProduct = null, pdSizeIdx = 0, pdQty = 1;
function renderProduct(){
  const box = $("pdBox"); if(!box) return;
  const p = pdProduct; if(!p){ box.innerHTML = `<div class="card"><h3>Product not found.</h3><p class="mt8"><a href="shop.html">Back to shop</a></p></div>`; return; }
  const [size, price] = p.sizes[pdSizeIdx];
  const related = PRODUCTS.filter(x => x.id !== p.id && (x.cat === p.cat || x.cats.some(c => p.cats.includes(c)))).slice(0,4);
  const fbt = PRODUCTS.filter(x => x.id !== p.id).slice(0,2);
  const fbtTotal = price + fbt.reduce((s,x) => s + x.sizes[0][1], 0);
  box.innerHTML = `
  <div class="pd-layout">
    <div class="pd-gallery"><img src="assets/img/products/${p.img}" alt="${p.name}"></div>
    <div class="pd-info">
      <span class="chip chip-static" style="border-color:var(--green);color:var(--green-dark)">${p.cat}</span>
      <h1>${p.name}</h1>
      <div class="p-rating">⭐ <b>${(p.rating||4.7).toFixed(1)}</b> <span>(${p.reviews||0} reviews)</span> · <b style="color:var(--green-dark)">✓ In stock</b></div>
      <div class="pd-price mt8">${UGX(price)} ${p.prev ? `<span class="p-old">${UGX(p.prev)}</span>` : ""} <small style="font-weight:600;color:var(--muted)"> / ${size}</small></div>
      <p class="mt8">${p.benefit}</p>
      <div class="mt16"><label class="bold small" style="display:block;margin-bottom:6px">Choose size</label>
        <div class="size-opts">${p.sizes.map((s,i) => `<button class="chip ${i===pdSizeIdx?'on':''}" onclick="pdSizeIdx=${i};pdQty=1;renderProduct()">${s[0]} · ${UGX(s[1])}</button>`).join("")}</div>
      </div>
      <div class="qty-row mt16"><label class="bold small">Quantity</label>
        <div class="qty-box"><button onclick="pdQty=Math.max(1,pdQty-1);renderProduct()">−</button><b>${pdQty}</b><button onclick="pdQty++;renderProduct()">+</button></div>
        <span class="small">Total: <b>${UGX(price*pdQty)}</b></span>
      </div>
      <div class="pd-buy">
        <button class="btn btn-primary" onclick="addToCart('${p.id}','${size}',${pdQty})">🛒 Add to Cart</button>
        <button class="btn btn-green" onclick="buyNow('${p.id}','${size}')">Buy Now</button>
        <button class="btn btn-wa" onclick="waProduct('${p.id}','${size}')">💬 Ask on WhatsApp</button>
      </div>
      <div class="mt16 small">🚚 <b>Delivery:</b> Nationwide, 1–3 days in Western Uganda &nbsp;·&nbsp; 📍 Kyenjojo base</div>
    </div>
  </div>
  <div class="mt32">
    <div class="tabs">
      <button class="tab on" onclick="showTab(0,this)">Description</button>
      <button class="tab" onclick="showTab(1,this)">How to Use</button>
      <button class="tab" onclick="showTab(2,this)">Safety</button>
      <button class="tab" onclick="showTab(3,this)">Delivery & Returns</button>
    </div>
    <div class="tab-body on"><p class="lead">${p.desc}</p></div>
    <div class="tab-body"><p class="lead">${p.howto}</p></div>
    <div class="tab-body"><p class="lead">${p.safety}</p></div>
    <div class="tab-body"><p class="lead">Orders are confirmed on WhatsApp after checkout. We deliver across Uganda (1–3 days in Western Uganda). Not satisfied? We will replace or refund — just reach us on WhatsApp.</p></div>
  </div>
  <div class="section-alt mt32" style="padding:26px;border-radius:var(--radius)">
    <h3>Frequently bought together</h3>
    <div class="bundle mt16">
      <div class="bundle-item"><img src="assets/img/products/${p.img}" alt="${p.name}"><div><b class="small">${p.name}</b><div class="small">${size}</div></div></div>
      ${fbt.map(x => `<span class="b-plus">+</span><div class="bundle-item"><img src="assets/img/products/${x.img}" alt="${x.name}"><div><b class="small">${x.name}</b><div class="small">${x.sizes[0][0]}</div></div></div>`).join("")}
    </div>
    <div class="mt16" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <b>Bundle total: ${UGX(fbtTotal)}</b>
      <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}','${size}',1);${fbt.map(x => `addToCart('${x.id}','${x.sizes[0][0]}',1);`).join("")} location.href='cart.html'">Add all to Cart</button>
    </div>
  </div>
  <div class="mt32">
    <div class="sec-head"><h2>Related Products</h2><a class="link" href="shop.html">See all →</a></div>
    <div class="p-grid">${related.map(x => pCard(x)).join("")}</div>
  </div>`;
}
function showTab(i, btn){
  document.querySelectorAll(".tab").forEach((t,j) => t.classList.toggle("on", t === btn));
  document.querySelectorAll(".tab-body").forEach((b,j) => b.classList.toggle("on", j === i));
}

/* ── Cart page ── */
function renderCart(){
  const box = $("cartBox"); if(!box) return;
  if(!cart.length){
    box.innerHTML = `<div class="card center"><h3>Your cart is empty</h3>
      <p class="lead mt8" style="margin-inline:auto">Add cleaning essentials and they will appear here.</p>
      <div class="mt16"><a class="btn btn-primary" href="shop.html">🛒 Shop Products</a></div></div>`;
    return;
  }
  box.innerHTML = `
  <div class="cart-layout">
    <div class="grid" style="align-content:start">
      ${cart.map((l,i) => { const p = getP(l.id); return `
      <div class="cart-row">
        <a href="product.html?id=${l.id}"><img src="assets/img/products/${p.img}" alt="${p.name}"></a>
        <div style="flex:1">
          <a class="bold" href="product.html?id=${l.id}">${p.name}</a>
          <div class="small">${l.size} · ${UGX(linePrice(l))} each</div>
          <div class="mt8"><button class="link-btn" onclick="saveForLater(${i})">Save for later</button> &nbsp; <button class="link-btn" onclick="rm(${i})">Remove</button></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <div class="cart-qty"><button onclick="setQty(${i},-1)">−</button><b>${l.qty}</b><button onclick="setQty(${i},1)">+</button></div>
          <b>${UGX(linePrice(l)*l.qty)}</b>
        </div>
      </div>`; }).join("")}
    </div>
    <div class="summary">
      <h3>Order Summary</h3>
      <div class="sum-row"><span>Subtotal</span><b>${UGX(cartTotal())}</b></div>
      <div class="sum-row"><span>Delivery</span><span class="small">Quoted at confirmation</span></div>
      <div class="sum-row total"><span>Total</span><b>${UGX(cartTotal())}</b></div>
      <div class="mt16" style="display:grid;gap:10px">
        <a class="btn btn-primary btn-block" href="checkout.html">Proceed to Checkout</a>
        <button class="btn btn-wa btn-block" onclick="waCheckout()">💬 Quick Order via WhatsApp</button>
        <a class="btn btn-outline btn-block" href="shop.html">Continue Shopping</a>
      </div>
      <p class="small mt16 center">Pay online with MTN MoMo, Airtel Money or card at checkout — or order via WhatsApp.</p>
    </div>
  </div>
  ${saved.length ? `
  <div class="mt32"><h3>Saved for Later (${saved.length})</h3>
  <div class="grid mt16">${saved.map((l,i) => { const p = getP(l.id); return `
    <div class="cart-row">
      <img src="assets/img/products/${p.img}" alt="${p.name}">
      <div style="flex:1"><b>${p.name}</b><div class="small">${l.size} · ${UGX(linePrice(l))}</div></div>
      <div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" onclick="moveToCart(${i})">Move to Cart</button><button class="btn btn-outline btn-sm" onclick="rmSaved(${i})">Remove</button></div>
    </div>`; }).join("")}</div></div>` : ""}`;
}

/* ── Checkout ── */
let ckStep = 1, ckDelivery = "standard", ckPay = "online";
let apiBaseCache = null;
async function apiBase(){
  if(apiBaseCache !== null) return apiBaseCache;
  try{
    const r = await fetch("api/health");
    if(r.ok){ const j = await r.json(); if(j && j.ok){ apiBaseCache = ""; return ""; } }
  }catch(e){}
  apiBaseCache = "https://derycare.vercel.app"; /* updated to the real Vercel URL after deploy */
  return apiBaseCache;
}
const DELIVERY_FEES = { standard: 5000, express: 12000, pickup: 0 }; /* TODO: confirm real fees with DeryCare */
const DISTRICTS = ["Kyenjojo","Fort Portal","Kasese","Hoima","Kibaale","Kagadi","Bundibugyo","Mbarara","Kabale","Kabarole","Kamwenge","Kyegegwa","Ibanda","Bushenyi","Ntoroko","Kampala","Entebbe","Jinja","Gulu","Mbale","Other"];
function ckFee(){ return DELIVERY_FEES[ckDelivery] || 0; }
function renderCheckout(){
  const box = $("ckBox"); if(!box) return;
  if(!cart.length){ box.innerHTML = `<div class="card center"><h3>Nothing to check out</h3><a class="btn btn-primary mt16" href="shop.html" style="margin-top:12px">Shop Products</a></div>`; return; }
  const pill = (n, label) => `<span class="step-pill ${ckStep===n?'on':ckStep>n?'done':''}"><span class="n">${ckStep>n?'✓':n}</span>${label}</span>`;
  box.innerHTML = `
  <div class="steps">${pill(1,"Information")} → ${pill(2,"Delivery")} → ${pill(3,"Payment")}</div>
  <div class="cart-layout">
    <div id="ckForm">
      ${ckStep === 1 ? `
      <div class="form">
        <h3>Customer Information</h3>
        <div><label for="ckName">Full name</label><input id="ckName" placeholder="e.g. Sarah Nakato"></div>
        <div class="f-row">
          <div><label for="ckPhone">Phone (WhatsApp)</label><input id="ckPhone" placeholder="e.g. 0770 000 000"></div>
          <div><label for="ckEmail">Email (optional)</label><input id="ckEmail" type="email" placeholder="you@email.com"></div>
        </div>
        <div><label for="ckAddr">Delivery address</label><input id="ckAddr" placeholder="Village / Street / Landmark"></div>
        <div class="f-row">
          <div><label for="ckDistrict">District</label><select id="ckDistrict">${DISTRICTS.map(d => `<option>${d}</option>`).join("")}</select></div>
          <div><label for="ckTown">City / Town</label><input id="ckTown" placeholder="e.g. Kyenjojo Town"></div>
        </div>
        <div><label for="ckNotes">Additional delivery instructions</label><textarea id="ckNotes" rows="2" placeholder="Optional"></textarea></div>
        <button class="btn btn-primary btn-block" onclick="ckNext()">Continue to Delivery →</button>
      </div>` : ""}
      ${ckStep === 2 ? `
      <div class="form">
        <h3>Delivery Method</h3>
        <label class="del-opt" onclick="ckDelivery='standard';renderCheckout()"><input type="radio" name="d" ${ckDelivery==='standard'?'checked':''}>
          <span><b>Standard delivery</b><br><span class="small">1–3 days in Western Uganda, nationwide thereafter</span></span><span class="del-fee">${UGX(DELIVERY_FEES.standard)}</span></label>
        <label class="del-opt" onclick="ckDelivery='express';renderCheckout()"><input type="radio" name="d" ${ckDelivery==='express'?'checked':''}>
          <span><b>Express delivery</b><br><span class="small">Same / next day where available in Western Uganda</span></span><span class="del-fee">${UGX(DELIVERY_FEES.express)}</span></label>
        <label class="del-opt" onclick="ckDelivery='pickup';renderCheckout()"><input type="radio" name="d" ${ckDelivery==='pickup'?'checked':''}>
          <span><b>Pickup</b><br><span class="small">Kyenjojo Town — pay nothing for delivery</span></span><span class="del-fee">Free</span></label>
        <p class="small">📍 Zones: Western Uganda 1–3 days · Rest of Uganda timing confirmed with your order. Service availability may vary by location.</p>
        <button class="btn btn-primary btn-block" onclick="ckStep=3;renderCheckout()">Continue to Payment →</button>
      </div>` : ""}
      ${ckStep === 3 ? `
      <div class="form">
        <h3>Payment</h3>
        <label class="pay-opt ${ckPay==='online'?'on':''}" onclick="ckPay='online';renderCheckout()">
          <input type="radio" name="pay" ${ckPay==='online'?'checked':''}>
          <span><b>Pay Online (Mobile Money / Card)<span class="pay-tag">Active</span></b><br>
          <span class="small">Secure payment powered by Pesapal — MTN MoMo, Airtel Money, Visa/Mastercard. Instant receipt on your phone.</span></span>
        </label>
        <label class="pay-opt ${ckPay==='wa'?'on':''}" onclick="ckPay='wa';renderCheckout()">
          <input type="radio" name="pay" ${ckPay==='wa'?'checked':''}>
          <span><b>Order via WhatsApp</b><br>
          <span class="small">Your order is sent to DeryCare with a unique order number. We confirm price, delivery and payment (cash on delivery, mobile money) on WhatsApp.</span></span>
        </label>
        ${ckPay === "online"
          ? `<button class="btn btn-green btn-block" onclick="ckPayOnline()">💳 Pay with Mobile Money / Card</button>`
          : `<button class="btn btn-green btn-block" onclick="ckPlace()">💬 Place Order via WhatsApp</button>`}
        <p class="small center">By placing your order you agree to our <a href="terms.html">Terms</a>.</p>
      </div>` : ""}
    </div>
    <div class="summary">
      <h3>Your Order</h3>
      ${cart.map(l => { const p = getP(l.id); return `<div class="sum-row"><span>${p.name} <span class="small">(${l.size}) ×${l.qty}</span></span><b>${UGX(linePrice(l)*l.qty)}</b></div>`; }).join("")}
      <div class="sum-row"><span>Subtotal</span><b>${UGX(cartTotal())}</b></div>
      <div class="sum-row"><span>Delivery (${ckDelivery})</span><b>${ckFee() ? UGX(ckFee()) : "Free"}</b></div>
      <div class="sum-row total"><span>Total</span><b>${UGX(cartTotal() + (ckStep === 1 ? 0 : ckFee()))}</b></div>
    </div>
  </div>`;
}
function ckNext(){
  if(!$("ckName").value.trim() || !$("ckAddr").value.trim() || !$("ckPhone").value.trim()){ toast("Please fill name, phone and address"); return; }
  ckStep = 2; renderCheckout();
}
function ckPlace(){
  const num = newOrderNumber();
  const order = {
    number: num, date: new Date().toISOString(), status: "Pending Payment", method: "whatsapp",
    name: $("ckName")?.value || "", items: cart.map(l => ({ ...l })), subtotal: cartTotal(), delivery: ckDelivery, fee: ckFee(), total: cartTotal() + ckFee()
  };
  orders.unshift(order); persist();
  sbInsert("derycare_orders", {
    order_no: num,
    customer_name: ($("ckName")?.value || "").trim(),
    phone: ($("ckPhone")?.value || "").trim(),
    email: ($("ckEmail")?.value || "").trim() || null,
    address: (($("ckAddr")?.value || "") + ", " + ($("ckTown")?.value || "") + " — " + ($("ckDistrict")?.value || "")).trim(),
    zone: ($("ckDistrict")?.value || ($("ckTown")?.value || "")).trim() || null,
    notes: ($("ckNotes")?.value || "").trim() || null,
    items: cart.map(l => ({ product: getP(l.id)?.name, size: l.size, qty: l.qty, unit_price: linePrice(l) })),
    subtotal: cartTotal(),
    delivery_fee: ckFee(),
    total: order.total,
    status: "pending",
    source: "website"
  });
  let m = `Hello DeryCare! New order ${num}\n\n`;
  cart.forEach(l => m += `• ${getP(l.id).name} (${l.size}) x${l.qty} — ${UGX(linePrice(l)*l.qty)}\n`);
  m += `\nSubtotal: ${UGX(cartTotal())}\nDelivery (${ckDelivery}): ${ckFee() ? UGX(ckFee()) : "Free"}\nTotal: ${UGX(order.total)}`;
  m += `\n\nName: ${$("ckName").value}\nPhone: ${$("ckPhone").value}\nAddress: ${$("ckAddr").value}, ${$("ckTown")?.value || ""} — ${$("ckDistrict")?.value || ""}`;
  waMsg(m);
  cart = []; persist();
  location.href = "account.html?order=" + num;
}
async function ckPayOnline(){
  const btn = document.querySelector("#ckForm .btn-green"); if(btn){ btn.disabled = true; btn.textContent = "Opening secure payment…"; }
  const num = newOrderNumber();
  const order = {
    number: num, date: new Date().toISOString(), status: "Pending Payment", method: "pesapal",
    name: $("ckName")?.value || "", items: cart.map(l => ({ ...l })), subtotal: cartTotal(), delivery: ckDelivery, fee: ckFee(), total: cartTotal() + ckFee()
  };
  orders.unshift(order); persist();
  const ok = await sbInsert("derycare_orders", {
    order_no: num,
    customer_name: ($("ckName")?.value || "").trim(),
    phone: ($("ckPhone")?.value || "").trim(),
    email: ($("ckEmail")?.value || "").trim() || null,
    address: (($("ckAddr")?.value || "") + ", " + ($("ckTown")?.value || "") + " — " + ($("ckDistrict")?.value || "")).trim(),
    zone: ($("ckDistrict")?.value || ($("ckTown")?.value || "")).trim() || null,
    notes: ($("ckNotes")?.value || "").trim() || null,
    items: cart.map(l => ({ product: getP(l.id)?.name, size: l.size, qty: l.qty, unit_price: linePrice(l) })),
    subtotal: cartTotal(),
    delivery_fee: ckFee(),
    total: order.total,
    status: "pending_payment",
    source: "website"
  });
  if(!ok){ toast("Cannot reach our system right now — order via WhatsApp instead"); ckPay = "wa"; renderCheckout(); return; }
  try{
    const base = await apiBase();
    const r = await fetch(base + "/api/pesapal-init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_no: num, return_url: location.origin + location.pathname.replace(/[^/]*$/, "") + "payment-result.html" })
    });
    const d = await r.json();
    if(!r.ok || !d.redirect_url) throw new Error(d.error || "gateway unavailable");
    cart = []; persist();
    location.href = d.redirect_url;
  }catch(e){
    console.warn("Pesapal init failed:", e);
    toast("Online payment unavailable — place the order via WhatsApp");
    ckPay = "wa"; renderCheckout();
  }
}
