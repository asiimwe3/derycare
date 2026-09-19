/* DeryCare storefront logic — products, cart (localStorage), WhatsApp checkout & bookings. */
const WA = "256762306675";
const UGX = n => "UGX " + n.toLocaleString("en-UG");

/* Real DeryCare product line (from official catalogue). */
const PRODUCTS = [
  { id:"msc",     name:"Multi-Surface Cleaner", benefit:"Cleans · Shines · Freshens — for a cleaner, healthier home", img:"multi-surface.png", color:"#3fae5a", need:["home","kitchen","business","institution"], sizes:[["500ml",5000],["1L",8000],["5L",30000],["20L",95000]] },
  { id:"floor",   name:"Floor Cleaner",         benefit:"Deep clean, fresh fragrance",                                img:"floor.png",         color:"#1b6fd6", need:["home","institution","business"],           sizes:[["500ml",5500],["1L",8500],["5L",31000],["20L",98000]] },
  { id:"glass",   name:"Glass Cleaner",         benefit:"Streak-free, crystal clear shine",                          img:"glass.png",         color:"#3fb6d6", need:["home","business"],                          sizes:[["500ml",5000],["1L",8000]] },
  { id:"toilet",  name:"Toilet Cleaner",        benefit:"Removes stains · Kills germs · Long-lasting freshness",     img:"toilet.png",        color:"#7a3fc9", need:["bathroom","home","business","institution"], sizes:[["500ml",6000],["1L",9500],["5L",33000],["20L",99000]] },
  { id:"dish",    name:"Dishwashing Liquid",    benefit:"Powerful grease removal, lemon fresh",                      img:"dishwash.png",      color:"#eab308", need:["kitchen","home","business"],                sizes:[["500ml",6000],["1L",10000],["5L",35000],["20L",105000]] },
  { id:"handwash",name:"Hand Wash",             benefit:"Gentle on skin · Kills germs · Soft & fresh",               img:"handwash.png",      color:"#e0559b", need:["home","business","institution","bathroom"], sizes:[["500ml",6000],["1L",9500],["5L",32000],["20L",96000]] },
  { id:"shoe",    name:"Shoe Polish",           benefit:"Restores · Protects · Shines",                              img:"shoe-polish.png",   color:"#22252a", need:["shoes"],                                    sizes:[["75ml",6000],["100ml",8000]] },
  { id:"laundry", name:"Laundry Detergent",     benefit:"Bright clothes, ocean-fresh scent",                         img:"laundry.png",       color:"#2f6fd0", need:["clothes","laundry","institution"],          sizes:[["1L",7500],["5L",30000],["20L",99000]] }
];

const NEEDS = [
  { id:"all",  label:"Everything" },
  { id:"home", label:"My Home" },
  { id:"clothes", label:"My Clothes" },
  { id:"shoes", label:"My Shoes" },
  { id:"kitchen", label:"My Kitchen" },
  { id:"bathroom", label:"My Bathroom" },
  { id:"business", label:"My Business" },
  { id:"institution", label:"My Institution" }
];

function hexA(hex, a){
  const h = hex.replace("#","");
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Cart ── */
const cart = JSON.parse(localStorage.getItem("derycart") || "[]");
function saveCart(){ localStorage.setItem("derycart", JSON.stringify(cart)); syncCartBadge(); }
function addToCart(pid, sizeIdx){
  const p = PRODUCTS.find(x => x.id === pid); if(!p) return;
  const [size, price] = p.sizes[sizeIdx || 0];
  const line = cart.find(l => l.id === pid && l.size === size);
  if(line) line.qty++; else cart.push({ id: pid, name: p.name, size, price, qty: 1 });
  saveCart(); toast(`${p.name} (${size}) added`);
  renderShop?.();
}
function setQty(i, d){ cart[i].qty += d; if(cart[i].qty < 1) cart.splice(i,1); saveCart(); renderCart?.(); renderShop?.(); }
function cartTotal(){ return cart.reduce((s,l) => s + l.price * l.qty, 0); }
function syncCartBadge(){
  const n = cart.reduce((s,l) => s + l.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = n > 9 ? "9+" : n;
    el.classList.toggle("show", n > 0);
  });
}
function waCheckout(){
  if(!cart.length){ toast("Your cart is empty"); return; }
  let msg = "Hello DeryCare! I would like to order:\n\n";
  cart.forEach(l => msg += `• ${l.name} (${l.size}) x${l.qty} — ${UGX(l.price*l.qty)}\n`);
  msg += `\nTotal: ${UGX(cartTotal())}\n\nName:\nDelivery location:`;
  open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
}
function waBook(service){
  const s = service || "a cleaning service";
  open(`https://wa.me/${WA}?text=${encodeURIComponent(`Hello DeryCare! I would like to book ${s}.\n\nName:\nLocation:\nPreferred date:`)}`, "_blank");
}
const waChat = () => open(`https://wa.me/${WA}?text=${encodeURIComponent("Hello DeryCare!")}`, "_blank");

/* ── Shared chrome ── */
const NAV = [
  ["index.html","Home"],["shop.html","Products"],["services.html","Services"],
  ["business.html","For Business"],["refill.html","Refill"],["about.html","About"],
  ["impact.html","Impact"],["clean-living.html","Clean Living"],["contact.html","Contact"]
];
function chrome(active){
  const links = NAV.map(([href,label]) =>
    `<a href="${href}" class="${href===active?'active':''}">${label}</a>`).join("");
  const mlinks = NAV.map(([href,label]) =>
    `<a href="${href}" class="${href===active?'active':''}">${label}</a>`).join("") +
    `<a href="cart.html">🛒 Cart</a><a href="book.html">📅 Book a Cleaning</a>`;
  document.body.insertAdjacentHTML("afterbegin", `
  <header><div class="wrap">
    <nav class="nav">
      <a class="brand" href="index.html"><img src="assets/img/brand/mark.png" alt="DeryCare" style="height:36px;width:auto"></a>
      <div class="nav-links">${links}</div>
      <div class="nav-cta">
        <a class="btn btn-outline cart-btn" href="cart.html">🛒 <span class="cart-count">0</span></a>
        <a class="btn btn-primary" href="book.html">📅 Book a Cleaning</a>
      </div>
      <button id="menuBtn" aria-label="Menu">☰</button>
    </nav>
    <div id="mobileNav">${mlinks}</div>
  </div></header>
  <div id="bottomBar">
    <a href="shop.html" class="bb-shop"><span class="bb-ico">🛒</span>Shop</a>
    <a href="book.html" class="bb-book"><span class="bb-ico">📅</span>Book</a>
    <a href="javascript:waChat()" class="bb-wa"><span class="bb-ico">💬</span>WhatsApp</a>
  </div>
  <div class="toast" id="toast"></div>`);
  document.getElementById("menuBtn").onclick = () =>
    document.getElementById("mobileNav").classList.toggle("open");
  syncCartBadge();
}
let toastTimer;
function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}
function pCard(p, sizeIdx = 0){
  const [size, price] = p.sizes[sizeIdx];
  return `<div class="p-card">
    <div class="p-img" style="background:${hexA(p.color,.10)}"><img src="assets/img/products/${p.img}" alt="${p.name}" style="height:150px;width:auto;object-fit:contain"></div>
    <div class="p-body">
      <div class="p-name">${p.name}</div>
      <div class="p-benefit">${p.benefit}</div>
      <div class="p-size">${p.sizes.map(s=>s[0]).join(" · ")}</div>
      <div class="p-price">${UGX(price)} <small>/ ${size}</small></div>
      <button class="p-add" style="background:${p.color}" onclick="addToCart('${p.id}',${sizeIdx})">Add to Cart</button>
    </div></div>`;
}

/* ── Shop page ── */
let currentNeed = "all";
function renderShop(){
  const grid = document.getElementById("shopGrid"); if(!grid) return;
  const list = PRODUCTS.filter(p => currentNeed === "all" || p.need.includes(currentNeed));
  grid.innerHTML = list.map((p,i) => pCard(p, 0)).join("") ||
    `<p class="lead">Products for this need are coming soon — <a href="contact.html">ask us directly</a>.</p>`;
}

/* ── Cart page ── */
function renderCart(){
  const box = document.getElementById("cartBox"); if(!box) return;
  if(!cart.length){
    box.innerHTML = `<div class="card center"><h3>Your cart is empty</h3>
      <p class="lead" style="margin:10px auto 18px">Add cleaning essentials and they will appear here.</p>
      <a class="btn btn-primary" href="shop.html">Shop Products</a></div>`;
    return;
  }
  box.innerHTML = `<div class="grid">` + cart.map((l,i) => `
    <div class="card" style="display:flex;gap:14px;align-items:center;justify-content:space-between">
      <div><b>${l.name}</b> <span class="p-size" style="display:inline-block">${l.size}</span>
        <div class="small">${UGX(l.price)} each</div></div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="chip" onclick="setQty(${i},-1)">−</button>
        <b>${l.qty}</b>
        <button class="chip" onclick="setQty(${i},1)">+</button>
        <b style="min-width:110px;text-align:right">${UGX(l.price*l.qty)}</b>
      </div></div>`).join("") +
    `</div>
    <div class="card mt24" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <h3>Total: <span style="color:var(--teal-dark)">${UGX(cartTotal())}</span></h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="waCheckout()">💬 Order via WhatsApp</button>
        <a class="btn btn-outline" href="shop.html">Continue Shopping</a>
      </div></div>`;
}
