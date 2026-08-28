/*
  ============================================
  FUNZIONI DI UTILITÀ
  ============================================
  servono a non ripetere
  lo stesso codice in home, catalogo e dettagli.
*/

/* Mette al sicuro i testi prima di inserirli nell’HTML */
function escapeHtml(testo) {
  if (testo === null || testo === undefined) return "";
  return String(testo)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Config: file + eventuali modifiche salvate dall’admin in questo browser */
function getConfig() {
  var base = window.CONFIG || {};
  try {
    var extra = localStorage.getItem(window.ATC_STORAGE_CONFIG);
    if (extra) {
      var parsed = JSON.parse(extra);
      var out = {};
      for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
      for (var j in parsed) if (Object.prototype.hasOwnProperty.call(parsed, j)) out[j] = parsed[j];
      return out;
    }
  } catch (e) {}
  return base;
}

/* Elenco appartamenti: file + overlay admin */
function getAppartamenti() {
  try {
    var extra = localStorage.getItem(window.ATC_STORAGE_APT);
    if (extra) {
      var parsed = JSON.parse(extra);
      if (parsed && parsed.length) return parsed;
    }
  } catch (e) {}
  return window.APPARTAMENTI || [];
}

/* Trova un appartamento dallo slug (es. "torino-centro") */
function getAppartamentoBySlug(slug) {
  var lista = getAppartamenti();
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].slug === slug) return lista[i];
  }
  return null;
}

/* Indirizzo della pagina dettaglio */
function urlAppartamento(slug) {
  return "appartamento.html?slug=" + encodeURIComponent(slug);
}

/*
  Costruisce il link WhatsApp.
  "testo" è il messaggio già scritto che comparirà nella chat.
*/
function msgWhatsAppDefault() {
  var cfg = getConfig();
  if (isEn()) return cfg.whatsappMessaggioDefaultEn || "";
  return cfg.whatsappMessaggioDefaultIt || "";
}

function msgWhatsAppApt(apt) {
  if (!apt) return msgWhatsAppDefault();
  if (isEn()) return apt.whatsappMessaggioEn || msgWhatsAppDefault();
  return apt.whatsappMessaggioIt || msgWhatsAppDefault();
}

function urlWhatsApp(testo) {
  var cfg = getConfig();
  var numero = cfg.whatsapp || "";
  var messaggio = testo || msgWhatsAppDefault();
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(messaggio);
}

/* Percorso dell’icona di un servizio (file in assets/icons/) */
function iconaServizio(id) {
  return assetPath("assets/icons/" + id + ".svg");
}

/*
  Divisore con il marchio
*/
function logoDivider(extraClass) {
  var classe = extraClass ? "logo-divider " + extraClass : "logo-divider";
  return (
    '<div class="' +
    classe +
    '" aria-hidden="true">' +
    "<span></span>" +
    '<img src="' +
    assetPath("assets/logo/Logo.svg") +
    '" alt="">' +
    "<span></span>" +
    "</div>"
  );
}

/*
  CARD APPARTAMENTO
*/
function mediaSrc(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return assetPath(src);
}

function renderCard(apt) {
  var isSoon = apt.stato === "in-costruzione";
  var foto = apt.galleria && apt.galleria[0] ? apt.galleria[0] : null;
  var imgSrc = foto ? mediaSrc(foto.src) : "";
  var imgAlt = foto ? foto.alt : apt.nome;
  var metaParti = [];
  var badgeSoon = t("Prossimamente", "Coming soon");
  var badgeOk = t("Disponibile", "Available");
  var excerpt = isEn() && apt.descrizioneBreveEn ? apt.descrizioneBreveEn : apt.descrizioneBreve;

  if (apt.capacita && apt.capacita.label && !isSoon) {
    metaParti.push(escapeHtml(apt.capacita.label));
  }
  if (apt.metriQuadri && !isSoon) {
    metaParti.push(escapeHtml(apt.metriQuadri) + " m²");
  }
  if (apt.zona) {
    metaParti.push(escapeHtml(apt.zona));
  }

  var badge = isSoon
    ? '<span class="badge badge--soon">' + badgeSoon + "</span>"
    : '<span class="badge badge--ok">' + badgeOk + "</span>";
  var veil = isSoon
    ? '    <span class="card-apt__veil">' + badgeSoon + "</span>"
    : "";

  var ctaLabel = isSoon
    ? t("Scopri l’anteprima", "See the preview")
    : t("Scopri", "Discover");
  var classeSoon = isSoon ? " card-apt--soon" : "";

  return (
    '<article class="card-apt' +
    classeSoon +
    '">' +
    '  <a class="card-apt__media" href="' +
    urlAppartamento(apt.slug) +
    '">' +
    (imgSrc
      ? '    <img src="' +
        escapeHtml(imgSrc) +
        '" alt="' +
        escapeHtml(imgAlt) +
        '" loading="lazy" width="800" height="600">'
      : "") +
    veil +
    "  </a>" +
    '  <div class="card-apt__body">' +
    badge +
    '    <h3 class="card-apt__title">' +
    '      <a href="' +
    urlAppartamento(apt.slug) +
    '">' +
    escapeHtml(apt.nome) +
    "</a>" +
    "    </h3>" +
    (metaParti.length
      ? '    <p class="card-apt__meta">' + metaParti.join(" · ") + "</p>"
      : "") +
    '    <p class="card-apt__excerpt">' +
    escapeHtml(excerpt) +
    "</p>" +
    '    <a class="btn btn--outline" href="' +
    urlAppartamento(apt.slug) +
    '">' +
    ctaLabel +
    "</a>" +
    "  </div>" +
    "</article>"
  );
}

/* Email: qualcosa@dominio.tld */
function emailValida(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());
}

/* Telefono: 6–15 cifre (senza prefisso paese) */
function telValido(s) {
  var cifre = String(s || "").replace(/\D/g, "");
  return cifre.length >= 6 && cifre.length <= 15;
}

/*
  Codice prenotazione da nome/cognome + date.
  Es. Mario Rossi, 12/09 → 15/09  →  ROSSI-MR-1209-1509
*/
function codiceDaOspite(nome, checkin, checkout) {
  var grezzo = String(nome || "");
  if (grezzo.normalize) grezzo = grezzo.normalize("NFD");
  var pulito = grezzo
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  var parti = pulito ? pulito.split(" ") : [];
  if (!parti.length) parti = ["OSPITE"];
  var cognome = parti[parti.length - 1].slice(0, 10);
  var iniziali = "";
  for (var i = 0; i < parti.length; i++) iniziali += parti[i].charAt(0);
  function ggmm(iso) {
    if (!iso || String(iso).length < 10) return "0000";
    return String(iso).slice(8, 10) + String(iso).slice(5, 7);
  }
  return cognome + "-" + iniziali + "-" + ggmm(checkin) + "-" + ggmm(checkout);
}

/* Prefissi internazionali più usati dagli ospiti */
function listaPrefissiTel() {
  return [
    { c: "+39", l: "IT +39" },
    { c: "+33", l: "FR +33" },
    { c: "+49", l: "DE +49" },
    { c: "+44", l: "UK +44" },
    { c: "+34", l: "ES +34" },
    { c: "+41", l: "CH +41" },
    { c: "+43", l: "AT +43" },
    { c: "+31", l: "NL +31" },
    { c: "+32", l: "BE +32" },
    { c: "+351", l: "PT +351" },
    { c: "+1", l: "US +1" },
    { c: "+55", l: "BR +55" },
    { c: "+54", l: "AR +54" },
    { c: "+48", l: "PL +48" },
    { c: "+420", l: "CZ +420" },
    { c: "+36", l: "HU +36" },
    { c: "+30", l: "GR +30" },
    { c: "+90", l: "TR +90" },
    { c: "+86", l: "CN +86" },
    { c: "+81", l: "JP +81" },
    { c: "+61", l: "AU +61" },
    { c: "+971", l: "AE +971" },
  ];
}

function htmlPrefissiTel(id, valore) {
  var lista = listaPrefissiTel();
  var sel = valore || "+39";
  var h = "<select id='" + id + "' aria-label='" + t("Prefisso", "Country code") + "'>";
  for (var i = 0; i < lista.length; i++) {
    h +=
      "<option value='" +
      lista[i].c +
      "'" +
      (lista[i].c === sel ? " selected" : "") +
      ">" +
      lista[i].l +
      "</option>";
  }
  return h + "</select>";
}

/*
  Popup centrato a schermo (date mancanti, campi non validi).
  Append a body così non lo spezza un transform sul main.
*/
function mostraAvviso(titolo, testo, onOk) {
  var vecchio = document.getElementById("atc-avviso");
  if (vecchio && vecchio.parentNode) vecchio.parentNode.removeChild(vecchio);

  var wrap = document.createElement("div");
  wrap.id = "atc-avviso";
  wrap.className = "atc-avviso is-open";
  wrap.innerHTML =
    '<div class="atc-avviso__card" role="dialog" aria-modal="true" aria-labelledby="atc-avviso-titolo">' +
    '<p class="kicker">' +
    t("Attenzione", "Please note") +
    "</p>" +
    '<h2 id="atc-avviso-titolo">' +
    escapeHtml(titolo) +
    "</h2>" +
    logoDivider("logo-divider--center") +
    "<p>" +
    escapeHtml(testo) +
    "</p>" +
    '<button type="button" class="btn btn--gold" id="atc-avviso-ok">' +
    t("Ho capito", "Got it") +
    "</button>" +
    "</div>";
  document.body.appendChild(wrap);

  function chiudi(eseguiOk) {
    wrap.classList.remove("is-open");
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    document.removeEventListener("keydown", onEsc);
    if (eseguiOk && typeof onOk === "function") onOk();
  }
  function onEsc(e) {
    if (e.key === "Escape") chiudi(false);
  }
  document.addEventListener("keydown", onEsc);
  wrap.addEventListener("click", function (e) {
    if (e.target === wrap) chiudi(false);
  });
  var ok = document.getElementById("atc-avviso-ok");
  if (ok) ok.onclick = function () { chiudi(true); };
}
