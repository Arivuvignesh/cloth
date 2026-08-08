/* ==========================================================================
   LUXORA — Frontend state (cart, wishlist). No backend, no auth.
   Persisted to localStorage purely so the demo survives a refresh.
   ========================================================================== */

const Store = {
  cart: [],
  wishlist: [],

  load() {
    try {
      this.cart = JSON.parse(localStorage.getItem("luxora_cart")) || [];
      this.wishlist = JSON.parse(localStorage.getItem("luxora_wishlist")) || [];
    } catch (e) {
      this.cart = [];
      this.wishlist = [];
    }
  },

  persist() {
    localStorage.setItem("luxora_cart", JSON.stringify(this.cart));
    localStorage.setItem("luxora_wishlist", JSON.stringify(this.wishlist));
    updateHeaderCounts();
  },

  addToCart(productId, size, color, qty = 1) {
    const existing = this.cart.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    );
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.push({ productId, size, color, qty });
    }
    this.persist();
  },

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.persist();
  },

  setCartQty(index, qty) {
    if (qty < 1) return;
    this.cart[index].qty = qty;
    this.persist();
  },

  cartCount() {
    return this.cart.reduce((sum, i) => sum + i.qty, 0);
  },

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) this.wishlist.splice(idx, 1);
    else this.wishlist.push(productId);
    this.persist();
    return this.wishlist.includes(productId);
  },

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  },

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter((id) => id !== productId);
    this.persist();
  },
};

Store.load();

function updateHeaderCounts() {
  const cartBadge = document.getElementById("cart-count");
  const wishBadge = document.getElementById("wishlist-count");
  if (cartBadge) {
    const n = Store.cartCount();
    cartBadge.textContent = n;
    cartBadge.style.display = n > 0 ? "flex" : "none";
  }
  if (wishBadge) {
    const n = Store.wishlist.length;
    wishBadge.textContent = n;
    wishBadge.style.display = n > 0 ? "flex" : "none";
  }
}
