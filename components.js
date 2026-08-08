/* ==========================================================================
   LUXORA — Reusable component renderers (return HTML strings)
   ========================================================================== */

function renderNavbar() {
  return `
  <header class="navbar" id="navbar">
    <div class="navbar__top">
      <button class="navbar__burger" id="burger-btn" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>

      <a href="#/" class="navbar__logo">LUXORA</a>

      <form class="navbar__search" id="navbar-search-form">
        <input
          type="text"
          id="navbar-search-input"
          placeholder="Search for products, brands and styles..."
          autocomplete="off"
        />
        <button type="submit" aria-label="Search"><i class="ic-search"></i></button>
      </form>

      <div class="navbar__actions">
        <button class="navbar__icon-btn navbar__search-toggle" id="mobile-search-toggle" aria-label="Search">
          <i class="ic-search"></i>
        </button>
        <a href="#/wishlist" class="navbar__icon-btn" aria-label="Wishlist">
          <i class="ic-heart"></i>
          <span class="badge" id="wishlist-count">0</span>
        </a>
        <a href="#/cart" class="navbar__icon-btn" aria-label="Cart">
          <i class="ic-bag"></i>
          <span class="badge" id="cart-count">0</span>
        </a>
        <a href="#/login" class="navbar__icon-btn" aria-label="Account">
          <i class="ic-user"></i>
        </a>
      </div>
    </div>

    <form class="navbar__search navbar__search--mobile" id="navbar-search-form-mobile">
      <input type="text" id="navbar-search-input-mobile" placeholder="Search for products, brands and styles..." autocomplete="off" />
      <button type="submit" aria-label="Search"><i class="ic-search"></i></button>
    </form>

    <nav class="navbar__categories" id="navbar-categories">
      ${NAV_CATEGORIES.map((c) => `<a href="${categoryHref(c)}" class="navbar__cat-link">${c}</a>`).join("")}
    </nav>
  </header>`;
}

function categoryHref(name) {
  if (name === "Men") return "#/shop?gender=men";
  if (name === "Women") return "#/shop?gender=women";
  if (name === "Kids") return "#/shop?gender=kids";
  if (name === "New Arrivals") return "#/shop?badge=New";
  if (name === "Offers") return "#/offers";
  return `#/shop?category=${encodeURIComponent(name)}`;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__logo">LUXORA</div>
        <p class="footer__tagline">Premium Fashion. Smart Price.</p>
        <div class="footer__social">
          <a href="#" aria-label="Instagram" class="social-badge">IG</a>
          <a href="#" aria-label="Facebook" class="social-badge">FB</a>
          <a href="#" aria-label="YouTube" class="social-badge">YT</a>
        </div>
      </div>
      <div class="footer__col">
        <h4>Shop</h4>
        <a href="#/shop?gender=men">Men</a>
        <a href="#/shop?gender=women">Women</a>
        <a href="#/shop?gender=kids">Kids</a>
        <a href="#/shop?badge=New">New Arrivals</a>
        <a href="#/offers">Offers</a>
      </div>
      <div class="footer__col">
        <h4>Customer Service</h4>
        <a href="#/contact">Contact Us</a>
        <a href="#/contact">Shipping</a>
        <a href="#/contact">Returns</a>
        <a href="#/contact">FAQs</a>
      </div>
      <div class="footer__col">
        <h4>Company</h4>
        <a href="#/about">About Us</a>
        <a href="#/about">Our Story</a>
        <a href="#/about">Careers</a>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; ${year} LUXORA. This is a student project prototype — no real orders are processed.</span>
    </div>
  </footer>`;
}

function ratingStars(rating) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return `
    <span class="stars" aria-label="${rating} out of 5 stars">
      <span class="stars__track">★★★★★</span>
      <span class="stars__fill" style="width:${pct}%">★★★★★</span>
    </span>`;
}

function renderProductCard(p) {
  const discount = discountPercent(p.price, p.originalPrice);
  const wished = Store.isWishlisted(p.id);
  return `
  <article class="product-card" data-id="${p.id}">
    <a href="#/product/${p.id}" class="product-card__image-wrap">
      ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
      <button class="product-card__wish js-toggle-wish ${wished ? "is-active" : ""}" data-id="${p.id}" aria-label="Toggle wishlist">
        <i class="ic-heart"></i>
      </button>
      <img src="${p.images[0]}" alt="${escapeHtml(p.name)}" loading="lazy" class="product-card__img-main" />
      <img src="${p.images[1]}" alt="" loading="lazy" class="product-card__img-hover" />
    </a>
    <div class="product-card__body">
      <a href="#/product/${p.id}" class="product-card__name">${escapeHtml(p.name)}</a>
      <div class="product-card__rating">
        ${ratingStars(p.rating)}
        <span class="product-card__rating-num">${p.rating}</span>
        <span class="product-card__reviews">(${p.reviews})</span>
      </div>
      <div class="product-card__price-row">
        <span class="product-card__price">${formatPrice(p.price)}</span>
        ${p.originalPrice > p.price ? `<span class="product-card__original">${formatPrice(p.originalPrice)}</span>` : ""}
        ${discount ? `<span class="product-card__discount">${discount}% OFF</span>` : ""}
      </div>
      <button class="btn btn--dark btn--full js-add-cart" data-id="${p.id}">Add to Cart</button>
    </div>
  </article>`;
}

function renderProductGrid(products) {
  if (!products.length) {
    return `
    <div class="empty-state">
      <i class="ic-search empty-state__icon"></i>
      <h3>No products found</h3>
      <p>Try adjusting your filters or search for something else.</p>
    </div>`;
  }
  return `<div class="product-grid">${products.map(renderProductCard).join("")}</div>`;
}

function renderCategoryCard(cat) {
  const qs = new URLSearchParams();
  Object.entries(cat.filter).forEach(([k, v]) => qs.set(k, v));
  return `
  <a href="#/shop?${qs.toString()}" class="category-card">
    <div class="category-card__img-wrap">
      <img src="${cat.image}" alt="${escapeHtml(cat.label)}" loading="lazy" />
    </div>
    <div class="category-card__info">
      <span class="category-card__name">${cat.label}</span>
      <span class="category-card__cta">Explore <i class="ic-arrow"></i></span>
    </div>
  </a>`;
}

function renderReviewCard(r) {
  return `
  <div class="review-card">
    <div class="review-card__stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
    <p class="review-card__text">&ldquo;${escapeHtml(r.text)}&rdquo;</p>
    <div class="review-card__author">— ${escapeHtml(r.name)}, ${escapeHtml(r.city)}</div>
  </div>`;
}

function renderTrustSection() {
  return `
  <section class="section trust">
    <div class="trust__grid">
      <div class="trust__card"><i class="ic-truck"></i><h4>Fast Delivery</h4><p>Quick and reliable shipping</p></div>
      <div class="trust__card"><i class="ic-return"></i><h4>Easy Returns</h4><p>Simple return and exchange</p></div>
      <div class="trust__card"><i class="ic-lock"></i><h4>Secure Payments</h4><p>Safe checkout experience</p></div>
      <div class="trust__card"><i class="ic-star"></i><h4>Quality Assured</h4><p>Products checked before shipping</p></div>
    </div>
  </section>`;
}

function renderNewsletter() {
  return `
  <section class="section newsletter">
    <div class="newsletter__inner">
      <h2>Join the Style Club</h2>
      <p>Get early access to new collections and exclusive offers.</p>
      <form class="newsletter__form" id="newsletter-form">
        <input type="email" required placeholder="Enter your email" />
        <button type="submit" class="btn btn--gold">Subscribe</button>
      </form>
    </div>
  </section>`;
}

function renderBreadcrumb(items) {
  return `<nav class="breadcrumb">${items
    .map((it, i) =>
      i === items.length - 1
        ? `<span>${it.label}</span>`
        : `<a href="${it.href}">${it.label}</a><i class="ic-chev"></i>`
    )
    .join("")}</nav>`;
}

/* Filter sidebar used on Shop / Search pages */
function renderFilterSidebar(filters) {
  const categories = ["T-Shirts", "Shirts", "Jeans", "Cargo", "Hoodies"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Grey", "Blue", "Beige"];
  const priceRanges = [
    { key: "under500", label: "Under ₹500" },
    { key: "500-1000", label: "₹500 – ₹1,000" },
    { key: "1000-1500", label: "₹1,000 – ₹1,500" },
    { key: "above1500", label: "Above ₹1,500" },
  ];

  const checkbox = (group, value, label, checked) => `
    <label class="filter-check">
      <input type="checkbox" class="js-filter" data-group="${group}" value="${value}" ${checked ? "checked" : ""}/>
      <span>${label}</span>
    </label>`;

  return `
  <aside class="filter-sidebar" id="filter-sidebar">
    <div class="filter-sidebar__header">
      <h3>Filters</h3>
      <button class="filter-clear js-clear-filters">Clear all</button>
    </div>

    <div class="filter-group">
      <h4>Category</h4>
      ${categories.map((c) => checkbox("category", c, c, filters.category?.includes(c))).join("")}
    </div>

    <div class="filter-group">
      <h4>Size</h4>
      <div class="filter-sizes">
        ${sizes
          .map(
            (s) =>
              `<button type="button" class="size-chip js-filter-size ${filters.size?.includes(s) ? "is-active" : ""}" data-value="${s}">${s}</button>`
          )
          .join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>Price</h4>
      ${priceRanges.map((r) => checkbox("price", r.key, r.label, filters.price?.includes(r.key))).join("")}
    </div>

    <div class="filter-group">
      <h4>Colour</h4>
      <div class="filter-colors">
        ${colors
          .map(
            (c) =>
              `<button type="button" class="color-chip js-filter-color ${filters.color?.includes(c) ? "is-active" : ""}" data-value="${c}" style="--swatch:${COLOR_SWATCH[c]}" title="${c}"></button>`
          )
          .join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>Rating</h4>
      ${checkbox("rating", "4", "4★ & above", filters.rating === 4)}
      ${checkbox("rating", "3", "3★ & above", filters.rating === 3)}
    </div>
  </aside>`;
}

function renderSortBar(count, sortBy) {
  return `
  <div class="sort-bar">
    <span class="sort-bar__count">${count} Product${count === 1 ? "" : "s"} Found</span>
    <label class="sort-bar__select">
      Sort By
      <select id="sort-select">
        <option value="popularity" ${sortBy === "popularity" ? "selected" : ""}>Popularity</option>
        <option value="price-asc" ${sortBy === "price-asc" ? "selected" : ""}>Price: Low to High</option>
        <option value="price-desc" ${sortBy === "price-desc" ? "selected" : ""}>Price: High to Low</option>
        <option value="newest" ${sortBy === "newest" ? "selected" : ""}>Newest</option>
        <option value="rating" ${sortBy === "rating" ? "selected" : ""}>Customer Rating</option>
      </select>
    </label>
  </div>`;
}
