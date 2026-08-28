/*
  ============================================
  PAGINA DETTAGLIO APPARTAMENTO
  ============================================

  Questa pagina è UN SOLO file HTML (appartamento.html).
  Quale appartamento mostrare lo decide l’indirizzo:

      appartamento.html?slug=torino-centro
      appartamento.html?slug=secondo
*/

(function () {
  var root = document.getElementById("apt-root");
  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("slug");
  var apt = slug ? getAppartamentoBySlug(slug) : null;

  if (!apt) {
    root.innerHTML = renderNonTrovato();
    return;
  }

  document.title = apt.nome + " — " + (window.CONFIG && window.CONFIG.brand ? window.CONFIG.brand : "Appartamenti Torino Centro");

  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", apt.descrizioneBreve);

  if (apt.stato === "in-costruzione") {
    root.innerHTML = renderComingSoon(apt);
  } else {
    root.innerHTML = renderDisponibile(apt);
    avviaGalleria();
    if (typeof montaCalendario === "function") {
      var root = document.getElementById("cal-root");
      window._calApi = montaCalendario(root, apt, function (r) {
        window._calOccupati = r.occupati || [];
      });
      var apri = function () {
        if (window._calApi && window._calApi.open) window._calApi.open();
      };
      var bi = document.getElementById("book-in");
      var bo = document.getElementById("book-out");
      if (bi) bi.addEventListener("click", apri);
      if (bo) bo.addEventListener("click", apri);
      var sel = document.getElementById("book-ospiti");
      var gv = document.getElementById("book-g-val");
      var minus = document.getElementById("book-minus");
      var plus = document.getElementById("book-plus");
      function syncOsp() {
        if (gv && sel) gv.textContent = sel.value;
      }
      syncOsp();
      if (minus && sel) {
        minus.onclick = function () {
          var n = Math.max(Number(sel.options[0].value), Number(sel.value) - 1);
          sel.value = String(n);
          syncOsp();
        };
      }
      if (plus && sel) {
        plus.onclick = function () {
          var n = Math.min(Number(sel.options[sel.options.length - 1].value), Number(sel.value) + 1);
          sel.value = String(n);
          syncOsp();
        };
      }
    }
    if (typeof avviaPrenota === "function") avviaPrenota(apt);
  }
})();

function opzioniOspiti(apt) {
  var max = (apt.capacita && apt.capacita.max) || 4;
  var min = 1;
  var start = Math.min(2, max);
  var h = "";
  for (var i = min; i <= max; i++) {
    h += "<option value='" + i + "'" + (i === start ? " selected" : "") + ">" + i + "</option>";
  }
  return h;
}

/* ---------- HTML: appartamento non trovato ---------- */
function renderNonTrovato() {
  return (
    '<section class="not-found">' +
    "  <div>" +
    '    <span class="kicker">Pagina</span>' +
    '    <h1 class="section-title">Appartamento non trovato</h1>' +
    logoDivider() +
    "    <p>Questo indirizzo non corrisponde a nessuna delle nostre case.</p>" +
    '    <p class="btn-row"><a class="btn btn--gold" href="appartamenti.html">Vai al catalogo</a></p>' +
    "  </div>" +
    "</section>"
  );
}

/* ---------- HTML: Prossimamente ---------- */
function renderComingSoon(apt) {
  var foto = apt.galleria && apt.galleria[0] ? apt.galleria[0] : null;
  var paragrafi = "";
  var lunghe = isEn() && apt.descrizioneLungaEn ? apt.descrizioneLungaEn : apt.descrizioneLunga || [];
  for (var i = 0; i < lunghe.length; i++) {
    paragrafi += "<p>" + escapeHtml(lunghe[i]) + "</p>";
  }

  return (
    '<section class="soon-page">' +
    '  <div class="container soon-page__grid">' +
    "    <div>" +
    '      <p class="kicker">In arrivo</p>' +
    '      <p class="soon-page__label">Prossimamente</p>' +
    '      <h1 class="section-title" style="margin-top:16px">' +
    escapeHtml(apt.nome) +
    "</h1>" +
    logoDivider() +
    paragrafi +
    '      <div class="btn-row">' +
    '        <a class="btn btn--gold" href="contatti.html">Fammi sapere quando è pronto</a>' +
    '        <a class="btn btn--ghost" href="' +
    urlWhatsApp(msgWhatsAppApt(apt)) +
    '" target="_blank" rel="noopener noreferrer">' +
    t("Scrivici su WhatsApp", "Write on WhatsApp") +
    "</a>" +
    "      </div>" +
    "    </div>" +
    (foto
      ? '<div><img src="' +
        escapeHtml(mediaSrc(foto.src)) +
        '" alt="' +
        escapeHtml(foto.alt) +
        '"></div>'
      : "") +
    "  </div>" +
    "</section>"
  );
}

/* ---------- HTML: scheda completa ---------- */
function renderDisponibile(apt) {
  var foto = apt.galleria || [];
  var principale = foto[0];

  var thumbs = "";
  for (var i = 0; i < foto.length; i++) {
    thumbs +=
      '<button type="button" data-index="' +
      i +
      '"' +
      (i === 0 ? ' class="is-active"' : "") +
      ">" +
      '<img src="' +
      escapeHtml(mediaSrc(foto[i].src)) +
      '" alt="' +
      escapeHtml(foto[i].alt) +
      '">' +
      "</button>";
  }

  var paragrafi = "";
  var lunghe = isEn() && apt.descrizioneLungaEn ? apt.descrizioneLungaEn : apt.descrizioneLunga || [];
  for (var p = 0; p < lunghe.length; p++) {
    paragrafi += "<p>" + escapeHtml(lunghe[p]) + "</p>";
  }

  var servizi = "";
  for (var s = 0; s < (apt.servizi || []).length; s++) {
    var item = apt.servizi[s];
    servizi +=
      '<li class="servizio">' +
      '<img src="' +
      iconaServizio(item.id) +
      '" alt="" width="28" height="28">' +
      "<span>" +
      escapeHtml(item.label) +
      "</span>" +
      "</li>";
  }

  var extra = "";
  for (var c = 0; c < (apt.caratteristicheSpeciali || []).length; c++) {
    extra += "<li>" + escapeHtml(apt.caratteristicheSpeciali[c]) + "</li>";
  }

  var chips = "";
  if (apt.tipologia) chips += '<span class="chip">' + escapeHtml(apt.tipologia) + "</span>";
  if (apt.capacita && apt.capacita.label) chips += '<span class="chip">' + escapeHtml(apt.capacita.label) + "</span>";
  if (apt.metriQuadri) chips += '<span class="chip">' + escapeHtml(apt.metriQuadri) + " m²</span>";
  if (apt.zona) chips += '<span class="chip">' + escapeHtml(apt.zona) + "</span>";

  var mappa = "";
  if (apt.coordinate) {
    var lat = apt.coordinate.lat;
    var lng = apt.coordinate.lng;
    var bbox =
      (lng - 0.008) +
      "," +
      (lat - 0.004) +
      "," +
      (lng + 0.008) +
      "," +
      (lat + 0.004);
    mappa =
      '<div class="map-wrap">' +
      '<iframe title="Mappa della zona" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=' +
      bbox +
      "&amp;layer=mapnik&amp;marker=" +
      lat +
      "%2C" +
      lng +
      '"></iframe>' +
      "</div>";
  }

  var vicino = (apt.vicinoA || []).join(" · ");

  return (
    '<section class="page-hero">' +
    '  <div class="container">' +
    '    <span class="kicker">La casa</span>' +
    "    <h1>" +
    escapeHtml(apt.nome) +
    "</h1>" +
    logoDivider() +
    '    <div class="chips">' +
    chips +
    "</div>" +
    "  </div>" +
    "</section>" +
    '<section class="section">' +
    '  <div class="container apt-layout">' +
    "    <div>" +
    '      <div class="gallery" id="gallery">' +
    (principale
      ? '<img class="gallery__main" id="gallery-main" src="' +
        escapeHtml(mediaSrc(principale.src)) +
        '" alt="' +
        escapeHtml(principale.alt) +
        '">'
      : "") +
    '        <div class="gallery__thumbs" id="gallery-thumbs">' +
    thumbs +
    "</div>" +
    "      </div>" +
    '      <div class="section__intro" style="margin-top:48px">' +
    '        <span class="kicker">La casa</span>' +
    '        <h2 class="section-title">Vivere qui</h2>' +
    logoDivider() +
    paragrafi +
    "      </div>" +
    (servizi
      ? '<div style="margin-top:48px"><span class="kicker">Comfort &amp; servizi</span><h2 class="section-title">Tutto quello che serve</h2>' +
        logoDivider() +
        '<ul class="grid-servizi">' +
        servizi +
        "</ul></div>"
      : "") +
    (extra
      ? '<div style="margin-top:48px"><span class="kicker">Perché sceglierla</span><h2 class="section-title">Dettagli che contano</h2>' +
        logoDivider() +
        '<ul class="pills">' +
        extra +
        "</ul></div>"
      : "") +
    '      <div style="margin-top:48px">' +
    '        <span class="kicker">Posizione</span>' +
    '        <h2 class="section-title">' +
    escapeHtml(apt.indirizzo) +
    "</h2>" +
    logoDivider() +
    "        <p>" +
    escapeHtml(apt.zona) +
    (vicino ? " — vicino a " + escapeHtml(vicino) : "") +
    ".</p>" +
    mappa +
    "      </div>" +
    "    </div>" +
    '    <aside class="book-box">' +
    '      <p class="kicker">' + t("Prenota sul sito", "Book on the site") + "</p>" +
    "      <h3>" + t("Il tuo soggiorno", "Your stay") + "</h3>" +
    (apt.prezzoNotte
      ? "<p style=\"margin:12px 0 4px;color:var(--gold-soft)\">€" +
        apt.prezzoNotte +
        t(" / notte", " / night") +
        "</p>"
      : "") +
    "<p class='book-field__lab'>" + t("Ospiti", "Guests") + "</p>" +
    "<div class='guest-step guest-step--dark'>" +
    "<button type='button' id='book-minus' aria-label='" + t("Meno ospiti", "Fewer guests") + "'>−</button>" +
    "<div class='guest-step__val'><span id='book-g-val'>2</span><small>" + t("ospiti", "guests") + "</small></div>" +
    "<button type='button' id='book-plus' aria-label='" + t("Più ospiti", "More guests") + "'>+</button>" +
    "</div>" +
    "<select id='book-ospiti' hidden>" + opzioniOspiti(apt) + "</select>" +
    "<div class='book-dates'>" +
    "<div><span class='book-field__lab'>" + t("Arrivo", "Arrival") + "</span>" +
    "<button type='button' class='book-date' id='book-in'>" + t("Aggiungi data", "Add date") + "</button></div>" +
    "<div><span class='book-field__lab'>" + t("Partenza", "Departure") + "</span>" +
    "<button type='button' class='book-date' id='book-out'>" + t("Aggiungi data", "Add date") + "</button></div>" +
    "</div>" +
    "      <p class='form-error' id='book-err'></p>" +
    '      <button type="button" class="btn btn--gold" id="btn-verifica">' +
    t("Verifica disponibilità", "Check availability") +
    "</button>" +
    '      <a class="btn btn--ghost" href="' +
    urlWhatsApp(msgWhatsAppApt(apt)) +
    '" target="_blank" rel="noopener noreferrer">' +
    t("Oppure WhatsApp", "Or WhatsApp") +
    "</a>" +
    "    </aside>" +
    "  </div>" +
    "</section>" +
    renderLightbox()
  );
}

function renderLightbox() {
  return (
    '<div class="lightbox" id="lightbox" hidden>' +
    '  <button type="button" class="lightbox__close" id="lightbox-close" aria-label="Chiudi">×</button>' +
    '  <button type="button" class="lightbox__prev" id="lightbox-prev" aria-label="Foto precedente">‹</button>' +
    '  <img id="lightbox-img" alt="">' +
    '  <button type="button" class="lightbox__next" id="lightbox-next" aria-label="Foto successiva">›</button>' +
    "</div>"
  );
}

/*
  Galleria
*/
function avviaGalleria() {
  var thumbs = document.querySelectorAll("#gallery-thumbs button");
  var main = document.getElementById("gallery-main");
  var lightbox = document.getElementById("lightbox");
  var lightImg = document.getElementById("lightbox-img");
  if (!main || !thumbs.length || !lightbox) return;

  var indice = 0;
  var fonti = [];
  for (var i = 0; i < thumbs.length; i++) {
    var img = thumbs[i].querySelector("img");
    fonti.push({ src: img.src, alt: img.alt });
  }

  function mostra(i) {
    indice = i;
    main.src = fonti[i].src;
    main.alt = fonti[i].alt;
    lightImg.src = fonti[i].src;
    lightImg.alt = fonti[i].alt;
    for (var t = 0; t < thumbs.length; t++) {
      thumbs[t].classList.toggle("is-active", t === i);
    }
  }

  function apri() {
    mostra(indice);
    if (lightbox.parentNode !== document.body) document.body.appendChild(lightbox);
    lightbox.removeAttribute("hidden");
    lightbox.classList.add("is-open");
  }

  function chiudi() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("hidden", "");
  }

  for (var t = 0; t < thumbs.length; t++) {
    thumbs[t].addEventListener(
      "click",
      (function (n) {
        return function () {
          mostra(n);
        };
      })(t)
    );
  }

  main.addEventListener("click", apri);

  var btnClose = document.getElementById("lightbox-close");
  var btnPrev = document.getElementById("lightbox-prev");
  var btnNext = document.getElementById("lightbox-next");
  if (btnClose) btnClose.addEventListener("click", chiudi);
  if (btnPrev)
    btnPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      mostra((indice - 1 + fonti.length) % fonti.length);
    });
  if (btnNext)
    btnNext.addEventListener("click", function (e) {
      e.stopPropagation();
      mostra((indice + 1) % fonti.length);
    });

  /* Clic sullo sfondo (non sull’immagine né sulle frecce) chiude. */
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) chiudi();
  });
  lightImg.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") chiudi();
    if (e.key === "ArrowLeft") mostra((indice - 1 + fonti.length) % fonti.length);
    if (e.key === "ArrowRight") mostra((indice + 1) % fonti.length);
  });

  mostra(0);
}
