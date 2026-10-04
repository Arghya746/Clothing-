const products = [
  { id: 1, name: "The Everyday Tee", type: "tops", description: "Heavyweight cotton · easy oversized fit", price: 1290, tag: "BESTSELLER", color: "#71876b", colors: ["#71876b", "#c49a78", "#263e36"], shape: "shirt", image: "photo-1521572163474-6864f9cf17ab" },
  { id: 2, name: "Off-Duty Co-ord", type: "layers", description: "Two-piece set · soft structured drape", price: 3290, tag: "JUST DROPPED", color: "#a76850", colors: ["#a76850", "#d9c9a8"], shape: "layer", image: "photo-1529139574466-a303027c1d8b" },
  { id: 3, name: "Wide Awake Trousers", type: "bottoms", description: "Cotton twill · pockets that work", price: 2190, tag: "", color: "#c3a477", colors: ["#c3a477", "#273c32", "#4d5665"], shape: "trousers", image: "photo-1473966968600-fa801b869a1a" },
  { id: 4, name: "The Throw-On Shirt", type: "layers", description: "Midweight cotton · your layering MVP", price: 2590, tag: "LOW STOCK", color: "#405f55", colors: ["#405f55", "#b57959"], shape: "overshirt", image: "photo-1596755094514-f87e34085b2c" },
  { id: 5, name: "Good Energy Hoodie", type: "tops", description: "Brushed fleece · roomy on purpose", price: 2790, tag: "", color: "#7f697c", colors: ["#7f697c", "#c1aa78", "#304339"], shape: "hoodie", image: "photo-1556821840-3a63f95609a7" },
  { id: 6, name: "The Daily Button-Down", type: "tops", description: "Crisp cotton · a little more polished", price: 1990, tag: "", color: "#d1c6a9", colors: ["#d1c6a9", "#5c7965", "#a86e57"], shape: "shirt", image: "photo-1598033129183-c4f50c736f10" }
];

const bag = new Map();
const grid = document.querySelector("#product-grid");
const drawer = document.querySelector("#bag-drawer");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let toastTimer;

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function renderProducts() {
  const sort = document.querySelector("#sort-products").value;
  let visible = products.filter(product => activeFilter === "all" || product.type === activeFilter);
  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-visual">
        <img class="product-photo" src="https://images.unsplash.com/${product.image}?auto=format&amp;fit=crop&amp;w=850&amp;q=82" alt="${product.name} styled in a studio fashion shoot" loading="lazy">
        ${product.tag ? `<span class="product-label">${product.tag}</span>` : ""}
        <button class="wishlist-button" type="button" aria-label="Add ${product.name} to wishlist" aria-pressed="false">♡</button>
        <button class="quick-add" type="button" data-add="${product.id}">ADD TO BAG <span>＋</span></button>
      </div>
      <div class="product-meta">
        <div><h3 class="product-name">${product.name}</h3><p class="product-description">${product.description}</p></div>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
      <div class="swatches" aria-label="Available colors">${product.colors.map(color => `<span class="swatch" style="background:${color}" aria-label="Color option"></span>`).join("")}</div>
    </article>`).join("");
}

function updateBag() {
  const items = [...bag.values()];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".bag-count").forEach(el => { el.textContent = count; });
  document.querySelector("#bag-subtotal").textContent = formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  document.querySelector("#bag-items").innerHTML = items.map(item => `
    <article class="bag-item">
      <div class="bag-thumb" style="--garment:${item.color}"><img src="https://images.unsplash.com/${item.image}?auto=format&amp;fit=crop&amp;w=180&amp;q=75" alt="" loading="lazy"></div>
      <div>
        <h3>${item.name}</h3><p>Unisex · easy fit</p>
        <div class="quantity-control">
          <button type="button" data-quantity="${item.id}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="${item.id}" data-change="1" aria-label="Add one ${item.name}">+</button>
          <span class="bag-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
    </article>`).join("");
  drawer.classList.toggle("empty", count === 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function openBag() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("visible");
  document.body.classList.add("locked");
}

function closeOverlays() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.classList.remove("locked");
  document.querySelector("#otp-dialog").close();
}

grid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const product = products.find(item => item.id === Number(addButton.dataset.add));
    const current = bag.get(product.id);
    bag.set(product.id, { ...product, quantity: current ? current.quantity + 1 : 1 });
    updateBag();
    showToast(`${product.name} added to your bag ✳`);
  }
  const wishlist = event.target.closest(".wishlist-button");
  if (wishlist) {
    const liked = wishlist.getAttribute("aria-pressed") !== "true";
    wishlist.setAttribute("aria-pressed", String(liked));
    wishlist.classList.toggle("liked", liked);
    wishlist.textContent = liked ? "♥" : "♡";
    showToast(liked ? "Saved to your wishlist ✳" : "Removed from your wishlist");
  }
});

document.querySelector("#bag-items").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) bag.delete(Number(removeButton.dataset.remove));
  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const item = bag.get(id);
    const quantity = item.quantity + Number(quantityButton.dataset.change);
    if (quantity <= 0) bag.delete(id);
    else bag.set(id, { ...item, quantity });
  }
  updateBag();
});

document.querySelectorAll(".bag-button").forEach(button => button.addEventListener("click", openBag));
document.querySelector(".close-drawer").addEventListener("click", closeOverlays);
overlay.addEventListener("click", closeOverlays);
document.querySelector(".close-after-shop").addEventListener("click", closeOverlays);
document.querySelector(".checkout-button").addEventListener("click", () => showToast("Demo store — checkout is not enabled."));

document.querySelectorAll(".filter-button").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach(tab => tab.classList.toggle("active", tab === button));
  renderProducts();
}));
document.querySelector("#sort-products").addEventListener("change", renderProducts);
document.querySelectorAll("[data-filter-link]").forEach(link => link.addEventListener("click", () => {
  activeFilter = link.dataset.filterLink;
  document.querySelectorAll(".filter-button").forEach(tab => tab.classList.toggle("active", tab.dataset.filter === activeFilter));
  renderProducts();
  document.querySelector(".main-nav").classList.remove("open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
}));

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const nav = document.querySelector(".main-nav");
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

const otpDialog = document.querySelector("#otp-dialog");
document.querySelector(".account-open").addEventListener("click", () => {
  otpDialog.showModal();
  document.querySelector("#phone-number").focus();
});
document.querySelector(".dialog-close").addEventListener("click", () => otpDialog.close());
document.querySelector("#phone-form").addEventListener("submit", event => {
  event.preventDefault();
  const phone = document.querySelector("#phone-number");
  if (!phone.reportValidity()) return;
  document.querySelector("#otp-copy").textContent = `A demo code is ready for +91 ${phone.value}. No SMS was sent.`;
  document.querySelector("#phone-form").classList.add("hidden");
  document.querySelector("#verify-form").classList.remove("hidden");
  document.querySelector("#otp-title").innerHTML = "One little<br><em>last step.</em>";
  document.querySelector("#otp-code").focus();
});
document.querySelector("#verify-form").addEventListener("submit", event => {
  event.preventDefault();
  const code = document.querySelector("#otp-code");
  const error = document.querySelector("#verify-error");
  if (code.value !== "123456") {
    error.textContent = "That code doesn't match. Try the demo code 123456.";
    return;
  }
  otpDialog.close();
  document.querySelector("#phone-form").classList.remove("hidden");
  document.querySelector("#verify-form").classList.add("hidden");
  document.querySelector("#phone-form").reset();
  document.querySelector("#verify-form").reset();
  document.querySelector("#otp-title").innerHTML = "Good to have<br><em>you here.</em>";
  document.querySelector("#otp-copy").textContent = "Sign in or create an account with your mobile number. We'll show you a demo OTP to get you in.";
  error.textContent = "";
  showToast("You're in — welcome to the crew ✳");
});
document.querySelector("#resend-otp").addEventListener("click", () => {
  document.querySelector("#verify-form").classList.add("hidden");
  document.querySelector("#phone-form").classList.remove("hidden");
  document.querySelector("#otp-title").innerHTML = "Good to have<br><em>you here.</em>";
  document.querySelector("#otp-copy").textContent = "Sign in or create an account with your mobile number. We'll show you a demo OTP to get you in.";
  document.querySelector("#verify-error").textContent = "";
  document.querySelector("#phone-number").focus();
});
otpDialog.addEventListener("close", () => document.body.classList.remove("locked"));
otpDialog.addEventListener("cancel", event => {
  event.preventDefault();
  otpDialog.close();
});

document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "You're on the list. Keep an eye on your inbox ✳";
  event.target.reset();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && drawer.classList.contains("open")) closeOverlays();
});

renderProducts();
updateBag();
