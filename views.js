/* ==========================================================================
   LUXORA — Page views. Each function returns an HTML string for #app-content.
   ========================================================================== */

/* ---------------------------- HOME ---------------------------- */
function viewHome() {
  const trending = PRODUCTS.slice(0, 8);
  return `
  <section class="hero">
    <div class="hero__media">
      <img src="${img("luxora-hero", 1600, 900)}" alt="Model wearing LUXORA premium streetwear" />
    </div>
    <div class="hero__content">
      <span class="hero__eyebrow">Autumn / Winter Edit</span>
      <h1 class="hero__headline">PREMIUM FASHION.<br/>SMART PRICE.</h1>
      <p class="hero__sub">Modern styles. Premium quality. Affordable prices.</p>
      <div class="hero__actions">
        <a href="#/shop?gender=men" class="btn btn--gold btn--lg">Shop Men</a>
        <a href="#/shop?gender=women" class="btn btn--outline-light btn--lg">Shop Women</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section__header">
      <h2>Shop by Category</h2>
      <p>Find your fit, faster.</p>
    </div>
    <div class="category-grid">
      ${CATEGORIES.map(renderCategoryCard).join("")}
    </div>
  </section>

  <section class="section section--tint">
    <div class="section__header">
      <h2>Trending Now</h2>
      <p>The pieces everyone's adding to cart this week.</p>
    </div>
    ${renderProductGrid(trending)}
    <div class="section__footer-cta">
      <a href="#/shop" class="btn btn--dark-outline">View All Products</a>
    </div>
  </section>

  <section class="section offer-banner">
    <div class="offer-banner__inner">
      <span class="offer-banner__eyebrow">Limited Time</span>
      <h2>Weekend Fashion Sale</h2>
      <p class="offer-banner__discount">Up to 40% Off</p>
      <p class="offer-banner__code">Use Code: <strong>SMART40</strong></p>
      <a href="#/offers" class="btn btn--gold btn--lg">Shop Now</a>
    </div>
  </section>

  ${renderTrustSection()}

  <section class="section">
    <div class="section__header">
      <h2>What Customers Say</h2>
    </div>
    <div class="review-grid">
      ${REVIEWS.map(renderReviewCard).join("")}
    </div>
  </section>

  ${renderNewsletter()}
  `;
}

/* ---------------------------- SHOP / SEARCH RESULTS ---------------------------- */
function viewShop(params, isSearch = false) {
  const filters = {
    gender: params.gender || null,
    category: params.category ? params.category.split(",") : [],
    size: params.size ? params.size.split(",") : [],
    color: params.color ? params.color.split(",") : [],
    price: params.price ? params.price.split(",") : [],
    rating: params.rating ? Number(params.rating) : null,
    badge: params.badge || null,
    query: params.q || null,
  };
  const sortBy = params.sort || "popularity";

  let results = applyFilters(PRODUCTS, filters);
  results = applySort(results, sortBy);

  const title = isSearch
    ? params.q
      ? `Search results for "${escapeHtml(params.q)}"`
      : "Search"
    : filters.gender
    ? `${filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1)}'s Fashion`
    : filters.category?.[0] || filters.badge || "All Products";

  return `
  <div class="page-header">
    ${renderBreadcrumb([{ label: "Home", href: "#/" }, { label: title }])}
    <h1>${title}</h1>
  </div>

  <div class="shop-layout">
    ${renderFilterSidebar(filters)}
    <div class="shop-layout__main">
      ${renderSortBar(results.length, sortBy)}
      <div id="shop-results">${renderProductGrid(results)}</div>
    </div>
  </div>`;
}

/* ---------------------------- CATEGORIES ---------------------------- */
function viewCategories() {
  return `
  <div class="page-header">
    ${renderBreadcrumb([{ label: "Home", href: "#/" }, { label: "Categories" }])}
    <h1>Shop by Category</h1>
    <p class="page-header__sub">Browse the full LUXORA range, organised the way you shop.</p>
  </div>
  <section class="section">
    <div class="category-grid category-grid--large">
      ${CATEGORIES.map(renderCategoryCard).join("")}
    </div>
  </section>`;
}

/* ---------------------------- PRODUCT DETAILS ---------------------------- */
function viewProductDetails(id) {
  const p = getProductById(id);
  if (!p) {
    return `<div class="empty-state"><h3>Product not found</h3><p>This item may have been removed.</p><a class="btn btn--dark" href="#/shop">Back to Shop</a></div>`;
  }
  const discount = discountPercent(p.price, p.originalPrice);
  const wished = Store.isWishlisted(p.id);
  const related = PRODUCTS.filter((r) => r.category === p.category && r.id !== p.id).slice(0, 4);

  return `
  <div class="page-header page-header--tight">
    ${renderBreadcrumb([
      { label: "Home", href: "#/" },
      { label: p.category, href: `#/shop?category=${encodeURIComponent(p.category)}` },
      { label: p.name },
    ])}
  </div>

  <section class="product-detail" data-id="${p.id}">
    <div class="product-detail__gallery">
      <div class="product-detail__main-img">
        ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
        <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" id="pd-main-img" />
      </div>
      <div class="product-detail__thumbs">
        ${p.images
          .map(
            (src, i) =>
              `<button type="button" class="product-detail__thumb ${i === 0 ? "is-active" : ""}" data-src="${src}"><img src="${src}" alt="" /></button>`
          )
          .join("")}
      </div>
    </div>

    <div class="product-detail__info">
      <h1>${escapeHtml(p.name)}</h1>
      <div class="product-detail__rating">
        ${ratingStars(p.rating)}
        <span class="product-card__rating-num">${p.rating}</span>
        <span class="product-card__reviews">| ${p.reviews} Reviews</span>
      </div>

      <div class="product-detail__price-row">
        ${p.originalPrice > p.price ? `<span class="product-detail__original">${formatPrice(p.originalPrice)}</span>` : ""}
        <span class="product-detail__price">${formatPrice(p.price)}</span>
        ${discount ? `<span class="product-card__discount">${discount}% OFF</span>` : ""}
      </div>

      <p class="product-detail__desc">${escapeHtml(p.description)}</p>

      <div class="option-group">
        <h4>Select Size</h4>
        <div class="filter-sizes" id="pd-sizes">
          ${p.sizes.map((s, i) => `<button type="button" class="size-chip js-pick-size ${i === 0 ? "is-active" : ""}" data-value="${s}">${s}</button>`).join("")}
        </div>
      </div>

      <div class="option-group">
        <h4>Select Colour</h4>
        <div class="filter-colors" id="pd-colors">
          ${p.colors
            .map(
              (c, i) =>
                `<button type="button" class="color-chip js-pick-color ${i === 0 ? "is-active" : ""}" data-value="${c}" style="--swatch:${COLOR_SWATCH[c]}" title="${c}"></button>`
            )
            .join("")}
        </div>
      </div>

      <div class="option-group">
        <h4>Quantity</h4>
        <div class="qty-stepper" id="pd-qty">
          <button type="button" class="qty-stepper__btn js-qty-minus" aria-label="Decrease quantity">−</button>
          <span class="qty-stepper__val">1</span>
          <button type="button" class="qty-stepper__btn js-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <ul class="feature-list">
        ${p.features.map((f) => `<li><i class="ic-check"></i>${escapeHtml(f)}</li>`).join("")}
      </ul>

      <div class="product-detail__actions">
        <button class="btn btn--dark btn--lg js-add-cart-detail" data-id="${p.id}">Add to Cart</button>
        <button class="btn btn--gold btn--lg js-buy-now" data-id="${p.id}">Buy Now</button>
        <button class="btn btn--outline-dark btn--lg js-toggle-wish ${wished ? "is-active" : ""}" data-id="${p.id}">
          <i class="ic-heart"></i> ${wished ? "Wishlisted" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  </section>

  ${
    related.length
      ? `
  <section class="section">
    <div class="section__header"><h2>You May Also Like</h2></div>
    ${renderProductGrid(related)}
  </section>`
      : ""
  }`;
}

/* ---------------------------- CART ---------------------------- */
function viewCart() {
  if (!Store.cart.length) {
    return `
    <div class="page-header"><h1>Your Cart</h1></div>
    <div class="empty-state">
      <i class="ic-bag empty-state__icon"></i>
      <h3>Your cart is empty</h3>
      <p>Looks like you haven't added anything yet.</p>
      <a class="btn btn--dark" href="#/shop">Start Shopping</a>
    </div>`;
  }

  let subtotal = 0;
  let mrpTotal = 0;
  const rows = Store.cart
    .map((item, index) => {
      const p = getProductById(item.productId);
      if (!p) return "";
      subtotal += p.price * item.qty;
      mrpTotal += p.originalPrice * item.qty;
      return `
      <div class="cart-item" data-index="${index}">
        <a href="#/product/${p.id}" class="cart-item__img"><img src="${p.images[0]}" alt="${escapeHtml(p.name)}" /></a>
        <div class="cart-item__details">
          <a href="#/product/${p.id}" class="cart-item__name">${escapeHtml(p.name)}</a>
          <div class="cart-item__meta">Size: ${item.size} &nbsp;•&nbsp; Colour: ${item.color}</div>
          <div class="cart-item__price-mobile">${formatPrice(p.price)}</div>
          <div class="cart-item__row-actions">
            <div class="qty-stepper qty-stepper--sm">
              <button type="button" class="qty-stepper__btn js-cart-qty-minus" data-index="${index}" aria-label="Decrease quantity">−</button>
              <span class="qty-stepper__val">${item.qty}</span>
              <button type="button" class="qty-stepper__btn js-cart-qty-plus" data-index="${index}" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item__remove js-cart-remove" data-index="${index}"><i class="ic-trash"></i> Remove</button>
            <button class="cart-item__wish js-cart-to-wish" data-id="${p.id}"><i class="ic-heart"></i> Move to Wishlist</button>
          </div>
        </div>
        <div class="cart-item__price">${formatPrice(p.price * item.qty)}</div>
      </div>`;
    })
    .join("");

  const discount = mrpTotal - subtotal;
  const delivery = subtotal >= 999 ? 0 : 79;
  const total = subtotal + delivery;

  return `
  <div class="page-header"><h1>Your Cart</h1></div>
  <div class="cart-layout">
    <div class="cart-list">${rows}</div>
    <aside class="order-summary">
      <h3>Order Summary</h3>
      <div class="order-summary__row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="order-summary__row order-summary__row--gold"><span>Discount</span><span>− ${formatPrice(discount)}</span></div>
      <div class="order-summary__row"><span>Delivery</span><span>${delivery === 0 ? "FREE" : formatPrice(delivery)}</span></div>
      <div class="order-summary__divider"></div>
      <div class="order-summary__row order-summary__row--total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn--gold btn--full btn--lg" id="checkout-btn">Proceed to Checkout</button>
      <a href="#/shop" class="cart-continue">Continue Shopping</a>
    </aside>
  </div>`;
}

/* ---------------------------- WISHLIST ---------------------------- */
function viewWishlist() {
  const items = Store.wishlist.map(getProductById).filter(Boolean);
  if (!items.length) {
    return `
    <div class="page-header"><h1>Your Wishlist</h1></div>
    <div class="empty-state">
      <i class="ic-heart empty-state__icon"></i>
      <h3>Your wishlist is empty</h3>
      <p>Tap the heart on any product to save it here.</p>
      <a class="btn btn--dark" href="#/shop">Discover Products</a>
    </div>`;
  }
  return `
  <div class="page-header"><h1>Your Wishlist</h1></div>
  ${renderProductGrid(items)}`;
}

/* ---------------------------- OFFERS ---------------------------- */
function viewOffers() {
  const discounted = applySort(
    PRODUCTS.filter((p) => discountPercent(p.price, p.originalPrice) >= 25),
    "price-asc"
  );
  return `
  <section class="offer-banner offer-banner--page">
    <div class="offer-banner__inner">
      <span class="offer-banner__eyebrow">Limited Time</span>
      <h2>Weekend Fashion Sale</h2>
      <p class="offer-banner__discount">Up to 40% Off</p>
      <p class="offer-banner__code">Use Code: <strong>SMART40</strong></p>
    </div>
  </section>
  <section class="section">
    <div class="section__header"><h2>Deals Worth Grabbing</h2></div>
    ${renderProductGrid(discounted)}
  </section>`;
}

/* ---------------------------- LOGIN / REGISTER ---------------------------- */
function viewLogin() {
  return `
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-tabs">
        <button class="auth-tab is-active" data-tab="login">Login</button>
        <button class="auth-tab" data-tab="register">Register</button>
      </div>

      <form class="auth-form" id="login-form" data-tab-panel="login">
        <label>Email or Mobile Number<input type="text" required placeholder="you@example.com" /></label>
        <label>Password<input type="password" required placeholder="••••••••" /></label>
        <button type="submit" class="btn btn--dark btn--full btn--lg">Login</button>
        <p class="auth-form__hint">This is a UI demo — no account is actually created or verified.</p>
      </form>

      <form class="auth-form" id="register-form" data-tab-panel="register" hidden>
        <label>Full Name<input type="text" required placeholder="Your name" /></label>
        <label>Email<input type="email" required placeholder="you@example.com" /></label>
        <label>Mobile Number<input type="tel" required placeholder="98765 43210" /></label>
        <label>Password<input type="password" required placeholder="Create a password" /></label>
        <button type="submit" class="btn btn--gold btn--full btn--lg">Create Account</button>
        <p class="auth-form__hint">This is a UI demo — no account is actually created or verified.</p>
      </form>
    </div>
  </div>`;
}

/* ---------------------------- ABOUT ---------------------------- */
function viewAbout() {
  return `
  <div class="page-header">
    ${renderBreadcrumb([{ label: "Home", href: "#/" }, { label: "About Us" }])}
    <h1>About LUXORA</h1>
  </div>
  <section class="section content-page">
    <div class="content-page__hero">
      <img src="${img("luxora-about", 1400, 700)}" alt="LUXORA design studio" />
    </div>
    <div class="content-page__body">
      <h2>Premium fashion shouldn't need a premium budget.</h2>
      <p>LUXORA was started with one simple idea: young shoppers deserve clothing that feels considered — good fabric, clean construction, fit that actually works — without paying a designer markup for it.</p>
      <p>We work directly with manufacturing partners, keep our collections tight, and skip the layers of retail markup that inflate price tags elsewhere. What's left is a small, focused edit of wardrobe staples, priced to be worn often rather than saved for "special occasions."</p>
      <h2>Our Story</h2>
      <p>Started as a college project and built with the same energy since — LUXORA is run by a small team obsessed with getting the basics right: fit, fabric, and fair pricing.</p>
      <h2>Careers</h2>
      <p>We're a small, fast-moving team. If you care about fashion, design, or building products people actually use, we'd love to hear from you — reach out through the Contact page.</p>
    </div>
  </section>`;
}

/* ---------------------------- CONTACT ---------------------------- */
function viewContact() {
  return `
  <div class="page-header">
    ${renderBreadcrumb([{ label: "Home", href: "#/" }, { label: "Contact Us" }])}
    <h1>Contact Us</h1>
  </div>
  <section class="section contact-layout">
    <form class="contact-form" id="contact-form">
      <label>Name<input type="text" required placeholder="Your name" /></label>
      <label>Email<input type="email" required placeholder="you@example.com" /></label>
      <label>Subject<input type="text" required placeholder="How can we help?" /></label>
      <label>Message<textarea required rows="5" placeholder="Tell us more..."></textarea></label>
      <button type="submit" class="btn btn--dark btn--lg">Send Message</button>
    </form>
    <div class="contact-info">
      <h3>Get in touch</h3>
      <p><i class="ic-mail"></i> support@luxora-demo.com</p>
      <p><i class="ic-phone"></i> +91 98765 43210</p>
      <p><i class="ic-pin"></i> Chennai, Tamil Nadu, India</p>
      <h3>Customer Service Hours</h3>
      <p>Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
    </div>
  </section>`;
}
