/* ==========================================================================
   LUXORA — Utility helpers
   ========================================================================== */

function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function starString(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("toast--visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("toast--visible"), 2200);
}

/* ---- Filtering & sorting shared by Shop / Search / Category pages ---- */

function applyFilters(products, filters) {
  return products.filter((p) => {
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.category && filters.category.length && !filters.category.includes(p.category)) return false;
    if (filters.size && filters.size.length && !filters.size.some((s) => p.sizes.includes(s))) return false;
    if (filters.color && filters.color.length && !filters.color.some((c) => p.colors.includes(c))) return false;
    if (filters.badge && p.badge !== filters.badge) return false;
    if (filters.rating && p.rating < filters.rating) return false;
    if (filters.price && filters.price.length) {
      const inRange = filters.price.some((range) => {
        if (range === "under500") return p.price < 500;
        if (range === "500-1000") return p.price >= 500 && p.price <= 1000;
        if (range === "1000-1500") return p.price > 1000 && p.price <= 1500;
        if (range === "above1500") return p.price > 1500;
        return true;
      });
      if (!inRange) return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const haystack = (p.name + " " + p.category + " " + p.gender).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function applySort(products, sortBy) {
  const arr = [...products];
  switch (sortBy) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "newest":
      return arr.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "popularity":
    default:
      return arr.sort((a, b) => b.reviews - a.reviews);
  }
}

function parseQueryString(qs) {
  const params = {};
  new URLSearchParams(qs).forEach((v, k) => (params[k] = v));
  return params;
}
