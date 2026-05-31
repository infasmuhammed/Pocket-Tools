"use strict";

(function initStoredTheme() {
  try {
    var theme = localStorage.getItem("pt-theme");
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
})();
