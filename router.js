/* ==========================================================================
   LUXORA — Router + global event delegation
   All app state lives in Store (state.js). This file wires the DOM to it.
   ========================================================================== */

const appEl = document.getElementById("app-content");

/* Transient (non-persisted) state for the product detail page's option pickers */
let pdState = { size: null, color: null, qty: 1 };

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  return { path: path || "/", params: parseQueryString(qs || "") };
}

function render() {
  const { path, params } = parseHash();
  const segments = path.split("/").filter(Boolean);
  let html = "";
  let bodyClass = "";

  if (segments.length === 0) {
    html = viewHome();
    bodyClass = "page-home";
  } else if (segments[0] === "shop") {
    html = viewShop(params, false);
  } else if (segments[0] === "search") {
    html = viewShop(params, true);
  } else if (segments[0] === "categories") {
    html = viewCategories();
  } else if (segments[0] === "product" && segments[1]) {
    html = viewProductDetails(segments[1]);
    pdState = { size: null, color: null, qty: 1 };
  } else if (segments[0] === "cart") {
    html = viewCart();
  } else if (segments[0] === "wishlist") {
    html = viewWishlist();
  } else if (segments[0] === "offers") {
    html = viewOffers();
  } else if (segments[0] === "login") {
    html = viewLogin();
  } else if (segments[0] === "about") {
    html = viewAbout();
  } else if (segments[0] === "contact") {
    html = viewContact();
  } else {
    html = `<div class="empty-state"><h3>Page not found</h3><p>The page you're looking for doesn't exist.</p><a class="btn btn--dark" href="#/">Back Home</a></div>`;
  }

  appEl.classList.remove("app-enter");
  appEl.innerHTML = html;
  // Force reflow so the enter animation replays on every navigation
  void appEl.offsetWidth;
  appEl.classList.add("app-enter");

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  updateHeaderCounts();
  updateActiveNav(path, params);
  syncSearchInputs(params.q || "");
  closeMobileMenus();

  if (segments[0] === "product" && segments[1]) initProductDetailDefaults(segments[1]);
}

function updateActiveNav(path, params) {
  document.querySelectorAll(".navbar__cat-link").forEach((a) => a.classList.remove("is-active"));
  const links = document.querySelectorAll(".navbar__cat-link");
  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (href === "#" + path + (Object.keys(params).length ? "?" + new URLSearchParams(params).toString() : "")) {
      a.classList.add("is-active");
    }
  });
}

function syncSearchInputs(q) {
  const d = document.getElementById("navbar-search-input");
  const m = document.getElementById("navbar-search-input-mobile");
  if (d) d.value = q;
  if (m) m.value = q;
}

function closeMobileMenus() {
  document.getElementById("navbar")?.classList.remove("navbar--menu-open", "navbar--search-open");
}

function initProductDetailDefaults(id) {
  const p = getProductById(id);
  if (!p) return;
  pdState.size = p.sizes[0];
  pdState.color = p.colors[0];
  pdState.qty = 1;
}

/* -------------------------- Filter/query helpers -------------------------- */

function currentShopBase() {
  const { path } = parseHash();
  return path === "search" ? "search" : "shop";
}

function updateQuery(mutator) {
  const { path, params } = parseHash();
  const next = { ...params };
  mutator(next);
  Object.keys(next).forEach((k) => {
    if (next[k] === "" || next[k] == null) delete next[k];
  });
  const qs = new URLSearchParams(next).toString();
  location.hash = `#/${path}${qs ? "?" + qs : ""}`;
}

function toggleListParam(paramKey, value) {
  updateQuery((next) => {
    const list = next[paramKey] ? next[paramKey].split(",") : [];
    const idx = list.indexOf(value);
    if (idx > -1) list.splice(idx, 1);
    else list.push(value);
    next[paramKey] = list.join(",");
  });
}

/* -------------------------------- Init -------------------------------- */

function initRouter() {
  window.addEventListener("hashchange", render);
  render();
}

/* ============================ Event Delegation ============================ */

document.addEventListener("click", (e) => {
  const wishBtn = e.target.closest(".js-toggle-wish");
  if (wishBtn) {
    e.preventDefault();
    const id = wishBtn.dataset.id;
    const isWished = Store.toggleWishlist(id);
    document.querySelectorAll(`.js-toggle-wish[data-id="${id}"]`).forEach((btn) => {
      btn.classList.toggle("is-active", isWished);
      if (btn.classList.contains("btn")) {
        btn.innerHTML = `<i class="ic-heart"></i> ${isWished ? "Wishlisted" : "Add to Wishlist"}`;
      }
    });
    showToast(isWished ? "Added to wishlist" : "Removed from wishlist");
    if (parseHash().path === "wishlist") render();
    return;
  }

  const addCartBtn = e.target.closest(".js-add-cart");
  if (addCartBtn) {
    e.preventDefault();
    const p = getProductById(addCartBtn.dataset.id);
    if (p) {
      Store.addToCart(p.id, p.sizes[0], p.colors[0], 1);
      flashButton(addCartBtn, "Added ✓");
      showToast(`${p.name} added to cart`);
    }
    return;
  }

  const addCartDetailBtn = e.target.closest(".js-add-cart-detail");
  if (addCartDetailBtn) {
    e.preventDefault();
    const p = getProductById(addCartDetailBtn.dataset.id);
    if (p) {
      Store.addToCart(p.id, pdState.size || p.sizes[0], pdState.color || p.colors[0], pdState.qty || 1);
      flashButton(addCartDetailBtn, "Added ✓");
      showToast(`${p.name} added to cart`);
    }
    return;
  }

  const buyNowBtn = e.target.closest(".js-buy-now");
  if (buyNowBtn) {
    e.preventDefault();
    const p = getProductById(buyNowBtn.dataset.id);
    if (p) {
      Store.addToCart(p.id, pdState.size || p.sizes[0], pdState.color || p.colors[0], pdState.qty || 1);
      location.hash = "#/cart";
    }
    return;
  }

  const thumb = e.target.closest(".product-detail__thumb");
  if (thumb) {
    document.querySelectorAll(".product-detail__thumb").forEach((t) => t.classList.remove("is-active"));
    thumb.classList.add("is-active");
    const mainImg = document.getElementById("pd-main-img");
    if (mainImg) mainImg.src = thumb.dataset.src;
    return;
  }

  const sizePick = e.target.closest(".js-pick-size");
  if (sizePick) {
    sizePick.parentElement.querySelectorAll(".js-pick-size").forEach((b) => b.classList.remove("is-active"));
    sizePick.classList.add("is-active");
    pdState.size = sizePick.dataset.value;
    return;
  }

  const colorPick = e.target.closest(".js-pick-color");
  if (colorPick) {
    colorPick.parentElement.querySelectorAll(".js-pick-color").forEach((b) => b.classList.remove("is-active"));
    colorPick.classList.add("is-active");
    pdState.color = colorPick.dataset.value;
    return;
  }

  if (e.target.closest(".js-qty-plus")) {
    pdState.qty = (pdState.qty || 1) + 1;
    document.querySelector("#pd-qty .qty-stepper__val").textContent = pdState.qty;
    return;
  }
  if (e.target.closest(".js-qty-minus")) {
    pdState.qty = Math.max(1, (pdState.qty || 1) - 1);
    document.querySelector("#pd-qty .qty-stepper__val").textContent = pdState.qty;
    return;
  }

  const cartQtyPlus = e.target.closest(".js-cart-qty-plus");
  if (cartQtyPlus) {
    const idx = Number(cartQtyPlus.dataset.index);
    Store.setCartQty(idx, Store.cart[idx].qty + 1);
    render();
    return;
  }
  const cartQtyMinus = e.target.closest(".js-cart-qty-minus");
  if (cartQtyMinus) {
    const idx = Number(cartQtyMinus.dataset.index);
    if (Store.cart[idx].qty > 1) {
      Store.setCartQty(idx, Store.cart[idx].qty - 1);
      render();
    }
    return;
  }
  const cartRemove = e.target.closest(".js-cart-remove");
  if (cartRemove) {
    Store.removeFromCart(Number(cartRemove.dataset.index));
    showToast("Item removed from cart");
    render();
    return;
  }
  const cartToWish = e.target.closest(".js-cart-to-wish");
  if (cartToWish) {
    Store.toggleWishlist(cartToWish.dataset.id);
    showToast("Moved to wishlist");
    return;
  }

  const checkoutBtn = e.target.closest("#checkout-btn");
  if (checkoutBtn) {
    e.preventDefault();
    showToast("This is a demo — checkout & payments aren't implemented.");
    return;
  }

  const sizeFilterChip = e.target.closest(".js-filter-size");
  if (sizeFilterChip) {
    toggleListParam("size", sizeFilterChip.dataset.value);
    return;
  }
  const colorFilterChip = e.target.closest(".js-filter-color");
  if (colorFilterChip) {
    toggleListParam("color", colorFilterChip.dataset.value);
    return;
  }
  const clearFiltersBtn = e.target.closest(".js-clear-filters");
  if (clearFiltersBtn) {
    const base = currentShopBase();
    location.hash = `#/${base}`;
    return;
  }

  const burger = e.target.closest("#burger-btn");
  if (burger) {
    document.getElementById("navbar")?.classList.toggle("navbar--menu-open");
    return;
  }
  const mobileSearchToggle = e.target.closest("#mobile-search-toggle");
  if (mobileSearchToggle) {
    document.getElementById("navbar")?.classList.toggle("navbar--search-open");
    document.getElementById("navbar-search-input-mobile")?.focus();
    return;
  }

  const authTab = e.target.closest(".auth-tab");
  if (authTab) {
    const tab = authTab.dataset.tab;
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("is-active", t === authTab));
    document.querySelectorAll(".auth-form").forEach((f) => (f.hidden = f.dataset.tabPanel !== tab));
    return;
  }
});

document.addEventListener("change", (e) => {
  const filterCheckbox = e.target.closest(".js-filter");
  if (filterCheckbox) {
    const group = filterCheckbox.dataset.group;
    if (group === "rating") {
      document.querySelectorAll('.js-filter[data-group="rating"]').forEach((cb) => {
        if (cb !== filterCheckbox) cb.checked = false;
      });
      updateQuery((next) => {
        next.rating = filterCheckbox.checked ? filterCheckbox.value : "";
      });
    } else {
      toggleListParam(group, filterCheckbox.value);
    }
    return;
  }

  const sortSelect = e.target.closest("#sort-select");
  if (sortSelect) {
    updateQuery((next) => {
      next.sort = sortSelect.value;
    });
    return;
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "navbar-search-form" || e.target.id === "navbar-search-form-mobile") {
    e.preventDefault();
    const input = e.target.querySelector("input");
    const q = input.value.trim();
    location.hash = q ? `#/search?q=${encodeURIComponent(q)}` : "#/search";
    return;
  }
  if (e.target.id === "newsletter-form") {
    e.preventDefault();
    showToast("You're on the list! Welcome to the Style Club.");
    e.target.reset();
    return;
  }
  if (e.target.id === "contact-form") {
    e.preventDefault();
    showToast("Message sent — we'll get back to you soon.");
    e.target.reset();
    return;
  }
  if (e.target.id === "login-form") {
    e.preventDefault();
    showToast("This is a UI demo — login isn't implemented.");
    return;
  }
  if (e.target.id === "register-form") {
    e.preventDefault();
    showToast("This is a UI demo — registration isn't implemented.");
    return;
  }
});

function flashButton(btn, tempLabel) {
  const original = btn.textContent;
  btn.classList.add("btn--flash");
  btn.textContent = tempLabel;
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("btn--flash");
  }, 1100);
}
