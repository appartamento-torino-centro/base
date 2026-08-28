/*
  Prenotazione sul sito: verifica, riepilogo, conferma.

*/

window.ATC_STORAGE_BOOKINGS = "atc_prenotazioni";
window._calApi = null;
window._calOccupati = [];

function getPrenotazioni() {
  try {
    return JSON.parse(localStorage.getItem(window.ATC_STORAGE_BOOKINGS) || "[]");
  } catch (e) {
    return [];
  }
}

function setPrenotazioni(lista) {
  localStorage.setItem(window.ATC_STORAGE_BOOKINGS, JSON.stringify(lista));
}

function codiceUnico(base) {
  var lista = getPrenotazioni();
  var codice = base;
  var n = 1;
  function esiste(c) {
    for (var i = 0; i < lista.length; i++) if (lista[i].codice === c) return true;
    return false;
  }
  while (esiste(codice)) {
    n += 1;
    codice = base + "-" + n;
  }
  return codice;
}

function avviaPrenota(apt) {
  var btn = document.getElementById("btn-verifica");
  var err = document.getElementById("book-err");
  var ospitiSel = document.getElementById("book-ospiti");
  if (!btn) return;

  btn.addEventListener("click", function () {
    var range = window._calApi ? window._calApi.getRange() : { checkin: "", checkout: "" };
    var ospiti = ospitiSel ? Number(ospitiSel.value) : 2;
    if (!range.checkin || !range.checkout) {
      mostraAvviso(
        t("Date mancanti", "Dates required"),
        t(
          "Inserisci le date di arrivo e partenza per verificare la disponibilità.",
          "Please add arrival and departure dates to check availability."
        ),
        function () {
          if (window._calApi && window._calApi.open) window._calApi.open();
        }
      );
      return;
    }
    if (!ospitiOk(apt, ospiti)) {
      mostraAvviso(
        t("Troppi ospiti", "Too many guests"),
        t("Questo appartamento non ha posti sufficienti.", "Not enough beds for this number of guests.")
      );
      return;
    }
    if (!rangeLibero(range.occupati || window._calOccupati, range.checkin, range.checkout)) {
      mostraAvviso(
        t("Date non disponibili", "Dates unavailable"),
        t("Quelle date non sono libere.", "Those dates are not available.")
      );
      return;
    }
    if (err) err.textContent = "";
    apriRiepilogo(apt, range.checkin, range.checkout, ospiti);
  });
}

function apriRiepilogo(apt, checkin, checkout, ospiti) {
  var wrap = document.getElementById("riepilogo");
  if (!wrap) return;
  var extraIds = [];
  var tot = calcolaTotale(apt, checkin, checkout, extraIds);

  function htmlExtra() {
    var lista = apt.serviziExtra || [];
    var h =
      "<section class='riep-block'><h3>" +
      t("Servizi extra", "Extra services") +
      "</h3><p class='riep-help'>" +
      t(
        "Facoltativi. Scegli solo ciò che vuoi: il totale a destra si aggiorna da solo.",
        "Optional. Pick only what you want — the total on the right updates instantly."
      ) +
      "</p>";
    var n = 0;
    for (var i = 0; i < lista.length; i++) {
      var x = lista[i];
      if (x.id === "parking") continue;
      n += 1;
      var lab = isEn() && x.labelEn ? x.labelEn : x.label;
      h +=
        "<label class='extra-card'><input type='checkbox' data-extra='" +
        escapeHtml(x.id) +
        "'><span class='extra-card__txt'><strong>" +
        escapeHtml(lab) +
        "</strong><em>" +
        t("Facoltativo", "Optional") +
        "</em></span><span class='extra-card__prezzo'>+ €" +
        x.prezzo +
        "</span><span class='lux-switch' aria-hidden='true'></span></label>";
    }
    if (!n) return "";
    return h + "</section>";
  }

  function renderTot(t0) {
    return (
      "<p class='kicker'>" +
      t("Il tuo conto", "Your bill") +
      "</p>" +
      "<ul class='riep-bill'>" +
      "<li><span>" +
      t0.notti +
      t(" notti × €", " nights × €") +
      (apt.prezzoNotte || 0) +
      "</span><span>€" +
      t0.base +
      "</span></li>" +
      (t0.pulizia
        ? "<li><span>" + t("Pulizia", "Cleaning") + "</span><span>€" + t0.pulizia + "</span></li>"
        : "") +
      (t0.extra
        ? "<li><span>" + t("Extra scelti", "Selected extras") + "</span><span>€" + t0.extra + "</span></li>"
        : "") +
      "</ul><p class='riepilogo__totale'>" +
      t("Totale", "Total") +
      " <em>€" +
      t0.totale +
      "</em></p>" +
      "<p class='riep-help'>" +
      t("I servizi extra non sono obbligatori.", "Extra services are optional.") +
      "</p>"
    );
  }

  var pills = "";
  for (var s = 0; s < (apt.servizi || []).length; s++) {
    pills += "<span class='chip'>" + escapeHtml(apt.servizi[s].label) + "</span>";
  }
  var vicino = (apt.vicinoA || []).join(" · ");
  var arrivo = isEn() && apt.comeArrivareEn ? apt.comeArrivareEn : apt.comeArrivare || "";

  wrap.innerHTML =
    '<div class="riepilogo__card">' +
    "<button type='button' class='riepilogo__x' id='riep-chiudi' aria-label='" +
    t("Chiudi", "Close") +
    "'>×</button>" +
    "<div class='riep-grid'>" +
    "<div class='riep-main'>" +
    "<p class='kicker'>" +
    t("La tua prenotazione", "Your booking") +
    "</p>" +
    "<h2>" +
    escapeHtml(apt.nome) +
    "</h2>" +
    logoDivider() +
    "<p class='riep-meta'>" +
    formatDataUI(checkin) +
    " – " +
    formatDataUI(checkout) +
    " · " +
    ospiti +
    " " +
    t("ospiti", "guests") +
    "</p>" +
    htmlExtra() +
    (pills
      ? "<section class='riep-block'><h3>" +
        t("Già inclusi", "Already included") +
        "</h3><div class='chips'>" +
        pills +
        "</div></section>"
      : "") +
    "<section class='riep-block riep-due'>" +
    "<div><h3>" +
    t("Come arrivare", "How to get there") +
    "</h3><p>" +
    escapeHtml(arrivo) +
    "</p></div>" +
    (vicino
      ? "<div><h3>" + t("Nelle vicinanze", "Nearby") + "</h3><p>" + escapeHtml(vicino) + "</p></div>"
      : "") +
    "</section>" +
    "<section class='riep-block'><h3>" +
    t("I tuoi dati", "Your details") +
    "</h3>" +
    "<label for='riep-nome'>" +
    t("Nome e cognome", "First and last name") +
    " *</label><input id='riep-nome' type='text' autocomplete='name'>" +
    "<label for='riep-email'>Email *</label><input id='riep-email' type='email' autocomplete='email'>" +
    "<label for='riep-tel'>" +
    t("Telefono", "Phone") +
    " *</label>" +
    "<div class='phone-row'>" +
    htmlPrefissiTel("riep-prefisso", "+39") +
    "<input id='riep-tel' type='tel' inputmode='tel' autocomplete='tel-national' placeholder='" +
    t("Numero senza prefisso", "Number without country code") +
    "'>" +
    "</div>" +
    "<p class='form-error' id='riep-err'></p></section>" +
    "</div>" +
    "<aside class='riep-side' id='riep-tot'></aside>" +
    "</div>" +
    "<div class='riep-actions'>" +
    "<button type='button' class='btn btn--outline' id='riep-back'>" +
    t("Indietro", "Back") +
    "</button>" +
    "<button type='button' class='btn btn--gold' id='riep-ok'>" +
    t("Conferma prenotazione", "Confirm booking") +
    "</button>" +
    "<a class='btn btn--outline' id='riep-wa' href='#'>" +
    t("WhatsApp", "WhatsApp") +
    "</a>" +
    "</div></div>";

  if (wrap.parentNode !== document.body) document.body.appendChild(wrap);
  wrap.removeAttribute("hidden");
  wrap.classList.add("is-open");

  function refresh() {
    extraIds = [];
    var boxes = wrap.querySelectorAll("[data-extra]:checked");
    for (var i = 0; i < boxes.length; i++) extraIds.push(boxes[i].getAttribute("data-extra"));
    tot = calcolaTotale(apt, checkin, checkout, extraIds);
    document.getElementById("riep-tot").innerHTML = renderTot(tot);
    var wa = document.getElementById("riep-wa");
    wa.href = urlWhatsApp(
      msgWhatsAppPrenota(apt, { checkin: checkin, checkout: checkout, ospiti: ospiti, totale: tot.totale })
    );
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
  }

  var boxes = wrap.querySelectorAll("[data-extra]");
  for (var x = 0; x < boxes.length; x++) boxes[x].addEventListener("change", refresh);
  refresh();

  function chiudiRiep() {
    wrap.classList.remove("is-open");
    wrap.setAttribute("hidden", "");
  }
  document.getElementById("riep-chiudi").onclick = chiudiRiep;
  var back = document.getElementById("riep-back");
  if (back) back.onclick = chiudiRiep;
  wrap.onclick = function (e) {
    if (e.target === wrap) chiudiRiep();
  };

  document.getElementById("riep-ok").onclick = function () {
    var nome = document.getElementById("riep-nome").value.trim();
    var email = document.getElementById("riep-email").value.trim();
    var telRaw = document.getElementById("riep-tel").value.trim();
    var pref = (document.getElementById("riep-prefisso") || {}).value || "+39";
    var er = document.getElementById("riep-err");

    if (nome.length < 2) {
      if (er) er.textContent = t("Inserisci nome e cognome.", "Please enter your first and last name.");
      mostraAvviso(
        t("Dati mancanti", "Missing details"),
        t("Inserisci nome e cognome per confermare la prenotazione.", "Please enter your first and last name to confirm.")
      );
      return;
    }
    if (!emailValida(email)) {
      if (er) er.textContent = t("Inserisci un’email valida.", "Please enter a valid email.");
      mostraAvviso(
        t("Email non valida", "Invalid email"),
        t("Inserisci un indirizzo email valido, ad esempio nome@email.com.", "Please enter a valid email, for example name@email.com.")
      );
      return;
    }
    if (!telValido(telRaw)) {
      if (er) er.textContent = t("Inserisci un telefono valido.", "Please enter a valid phone number.");
      mostraAvviso(
        t("Telefono non valido", "Invalid phone"),
        t(
          "Inserisci il numero (6–15 cifre) e scegli il prefisso del tuo Paese.",
          "Enter the number (6–15 digits) and choose your country code."
        )
      );
      return;
    }
    if (er) er.textContent = "";

    var tel = pref + " " + telRaw.replace(/^\+/, "");
    var codice = codiceUnico(codiceDaOspite(nome, checkin, checkout));
    var rec = {
      codice: codice,
      aptId: apt.id,
      aptNome: apt.nome,
      checkin: checkin,
      checkout: checkout,
      ospiti: ospiti,
      extra: extraIds,
      totale: tot.totale,
      nome: nome,
      email: email,
      telefono: tel,
      quando: new Date().toISOString(),
    };
    var lista = getPrenotazioni();
    lista.unshift(rec);
    setPrenotazioni(lista);

    var waHref = urlWhatsApp(
      msgWhatsAppPrenota(apt, {
        checkin: checkin,
        checkout: checkout,
        ospiti: ospiti,
        totale: tot.totale,
        codice: codice,
        nome: nome,
      })
    );

    wrap.innerHTML =
      '<div class="riepilogo__card riep-ok">' +
      "<p class='kicker'>" +
      t("Richiesta ricevuta", "Request received") +
      "</p>" +
      "<h2>" +
      t("Grazie, è tutto pronto", "Thank you — you're all set") +
      "</h2>" +
      logoDivider("logo-divider--center") +
      "<p class='riep-ok__lab'>" +
      t("Il tuo codice", "Your reference") +
      "</p>" +
      "<p class='riep-ok__code'>" +
      escapeHtml(codice) +
      "</p>" +
      "<ul class='riep-ok__meta'>" +
      "<li><span>" +
      t("Casa", "Home") +
      "</span><strong>" +
      escapeHtml(apt.nome) +
      "</strong></li>" +
      "<li><span>" +
      t("Soggiorno", "Stay") +
      "</span><strong>" +
      formatDataUI(checkin) +
      " – " +
      formatDataUI(checkout) +
      "</strong></li>" +
      "<li><span>" +
      t("Ospiti", "Guests") +
      "</span><strong>" +
      ospiti +
      "</strong></li>" +
      "<li><span>" +
      t("Totale", "Total") +
      "</span><strong>€" +
      tot.totale +
      "</strong></li>" +
      "<li><span>" +
      t("Intestata a", "Guest") +
      "</span><strong>" +
      escapeHtml(nome) +
      "</strong></li>" +
      "</ul>" +
      "<p class='riep-help'>" +
      t(
        "Abbiamo salvato la richiesta. Ti ricontattiamo a breve per confermare. Se preferisci, scrivici anche su WhatsApp.",
        "We've saved your request. We'll be in touch shortly to confirm. You can also reach us on WhatsApp."
      ) +
      "</p>" +
      "<div class='riep-actions'>" +
      "<button type='button' class='btn btn--gold' id='riep-chiudi2'>" +
      t("Chiudi", "Close") +
      "</button>" +
      "<a class='btn btn--outline' id='riep-wa2' href='" +
      escapeHtml(waHref) +
      "' target='_blank' rel='noopener noreferrer'>" +
      t("WhatsApp", "WhatsApp") +
      "</a>" +
      "</div></div>";

    document.getElementById("riep-chiudi2").onclick = function () {
      wrap.classList.remove("is-open");
      wrap.hidden = true;
    };
  };
}
