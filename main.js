/* ==========================================================================
   LUXORA — Entry point
   ========================================================================== */

document.getElementById("navbar-slot").innerHTML = renderNavbar();
document.getElementById("footer-slot").innerHTML = renderFooter();

initRouter();

/* Close mobile menu when a category link is tapped */
document.addEventListener("click", (e) => {
  if (e.target.closest(".navbar__cat-link")) {
    document.getElementById("navbar")?.classList.remove("navbar--menu-open");
  }
});
