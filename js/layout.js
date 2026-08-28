/*
  ============================================
  LAYOUT COMUNE (tutte le pagine)
  ============================================

  Cose che valgono ovunque:
  - menu mobile
  - link della pagina corrente evidenziato
  - anno nel copyright
  - link WhatsApp presi da config.js
  - comparsa leggera delle sezioni

*/

(function () {
  var header = document.getElementById("header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Apertura / chiusura menu su telefono */
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var aperto = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", aperto ? "true" : "false");
      toggle.setAttribute("aria-label", aperto ? "Chiudi il menu" : "Apri il menu");
    });
  }

  /* Segna il link della pagina in cui ci troviamo */
  var pagina = document.body.getAttribute("data-page");
  if (pagina) {
    var links = document.querySelectorAll(".nav a[data-page]");
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-page") === pagina) {
        links[i].classList.add("is-active");
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  /* Anno nel footer */
  var yearNodes = document.querySelectorAll("[data-anno]");
  var anno = String(new Date().getFullYear());
  for (var y = 0; y < yearNodes.length; y++) {
    yearNodes[y].textContent = anno;
  }

  /*
    Aggiorna tutti i pulsanti WhatsApp usando il numero in config.js.
    In HTML puoi lasciare href="#" e data-whatsapp:
    questo script mette il link giusto.
  */
  var cfg = typeof getConfig === "function" ? getConfig() : window.CONFIG;
  if (cfg) {
    var waDefault = urlWhatsApp(msgWhatsAppDefault());
    var waLinks = document.querySelectorAll("[data-whatsapp]");
    for (var w = 0; w < waLinks.length; w++) {
      var custom = waLinks[w].getAttribute("data-whatsapp-msg");
      waLinks[w].href = custom ? urlWhatsApp(custom) : waDefault;
      waLinks[w].target = "_blank";
      waLinks[w].rel = "noopener noreferrer";
    }

    var mailLinks = document.querySelectorAll("[data-email]");
    for (var m = 0; m < mailLinks.length; m++) {
      mailLinks[m].href = "mailto:" + cfg.email;
      if (mailLinks[m].tagName === "A" && mailLinks[m].childNodes.length <= 1) {
        if (!mailLinks[m].textContent.trim() || mailLinks[m].getAttribute("data-email") === "testo") {
          mailLinks[m].textContent = cfg.email;
        }
      }
    }

    var telLinks = document.querySelectorAll("[data-telefono]");
    for (var t = 0; t < telLinks.length; t++) {
      telLinks[t].href = cfg.telefonoHref;
      if (telLinks[t].getAttribute("data-telefono") === "testo") {
        telLinks[t].textContent = cfg.telefono;
      }
    }

    var piva = document.querySelectorAll("[data-piva]");
    for (var p = 0; p < piva.length; p++) piva[p].textContent = cfg.partitaIva || "";

    var ind = document.querySelectorAll("[data-indirizzo]");
    for (var n = 0; n < ind.length; n++) ind[n].textContent = (cfg.indirizzo || "") + (cfg.citta ? ", " + cfg.citta : "");
  }

  /* Porta lo slug anche sul link della lingua gemella */
  var langA = document.querySelectorAll(".lang-switch a");
  for (var la = 0; la < langA.length; la++) {
    if (location.search && /appartamento\.html/.test(langA[la].getAttribute("href") || "")) {
      langA[la].href = langA[la].getAttribute("href") + location.search;
    }
    langA[la].addEventListener("click", function () {
      var L = (this.textContent || "").trim().toLowerCase() === "en" ? "en" : "it";
      try {
        localStorage.setItem("atc_lang", L);
      } catch (e) {}
    });
  }

  /* Comparsa morbida degli elementi con classe .reveal */
  var revela = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add("is-visible");
            io.unobserve(entries[i].target);
          }
        }
      },
      { threshold: 0.12 }
    );
    for (var r = 0; r < revela.length; r++) io.observe(revela[r]);
  } else {
    for (var r2 = 0; r2 < revela.length; r2++) revela[r2].classList.add("is-visible");
  }
})();
