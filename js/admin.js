/*
  ============================================
  ADMIN — solo frontend
  ============================================

  Login con utente/password presi da config.js.

  Cosa fa: salva config e appartamenti in localStorage
  così mostra subito le modifiche.

*/

(function () {
  var loginBox = document.getElementById("admin-login");
  var panel = document.getElementById("admin-panel");
  var formLogin = document.getElementById("form-login");
  var formCfg = document.getElementById("form-config");
  var listaApt = document.getElementById("lista-admin-apt");
  var msg = document.getElementById("admin-msg");

  if (!formLogin) return;

  var cfg = getConfig();

  var titoli = { sito: "Sito", apt: "Appartamenti", book: "Prenotazioni" };
  var tabBtns = document.querySelectorAll("[data-tab]");
  for (var tb = 0; tb < tabBtns.length; tb++) {
    tabBtns[tb].addEventListener("click", function () {
      var nome = this.getAttribute("data-tab");
      for (var x = 0; x < tabBtns.length; x++) tabBtns[x].classList.toggle("is-on", tabBtns[x] === this);
      var pans = document.querySelectorAll("[data-panel]");
      for (var y = 0; y < pans.length; y++) pans[y].hidden = pans[y].getAttribute("data-panel") !== nome;
      var tit = document.getElementById("admin-titolo");
      if (tit) tit.textContent = titoli[nome] || "";
    });
  }

  if (sessionStorage.getItem(window.ATC_STORAGE_SESSION) === "1") {
    apriPannello();
  }

  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    var u = formLogin.utente.value.trim();
    var p = formLogin.password.value;
    if (u === cfg.adminUtente && p === cfg.adminPassword) {
      sessionStorage.setItem(window.ATC_STORAGE_SESSION, "1");
      apriPannello();
    } else {
      var err = document.getElementById("admin-msg-login");
      if (err) {
        err.textContent = "Utente o password non corretti.";
        err.classList.add("is-on");
      }
    }
  });

  function apriPannello() {
    document.body.classList.remove("admin-view-login");
    document.body.classList.add("admin-view-panel");
    loginBox.setAttribute("hidden", "");
    panel.removeAttribute("hidden");
    riempiConfig();
    riempiAppartamenti();
    riempiPrenotazioni();
  }

  function riempiPrenotazioni() {
    var el = document.getElementById("lista-prenotazioni");
    if (!el) return;
    var lista = [];
    try {
      lista = JSON.parse(localStorage.getItem(window.ATC_STORAGE_BOOKINGS) || "[]");
    } catch (e) {}
    if (!lista.length) {
      el.innerHTML = "<p>Nessuna prenotazione dal sito, per ora.</p>";
      return;
    }
    var h =
      "<div class='admin-table-wrap'><table class='admin-table'><thead><tr><th>Codice</th><th>Casa</th><th>Date</th><th>Ospiti</th><th>Totale</th><th>Ospite</th></tr></thead><tbody>";
    for (var i = 0; i < lista.length; i++) {
      var r = lista[i];
      h +=
        "<tr><td>" +
        escapeHtml(r.codice) +
        "</td><td>" +
        escapeHtml(r.aptNome) +
        "</td><td>" +
        escapeHtml(r.checkin) +
        " → " +
        escapeHtml(r.checkout) +
        "</td><td>" +
        escapeHtml(r.ospiti) +
        "</td><td>€" +
        escapeHtml(r.totale) +
        "</td><td>" +
        escapeHtml(r.nome) +
        "<br>" +
        escapeHtml(r.email) +
        (r.telefono ? "<br>" + escapeHtml(r.telefono) : "") +
        "</td></tr>";
    }
    el.innerHTML = h + "</tbody></table></div>";
  }

  function riempiConfig() {
    var c = getConfig();
    setVal("cfg-whatsapp", c.whatsapp);
    setVal("cfg-email", c.email);
    setVal("cfg-telefono", c.telefono);
    setVal("cfg-indirizzo", c.indirizzo);
    setVal("cfg-piva", c.partitaIva);
    setVal("cfg-instagram", c.social && c.social.instagram);
    setVal("cfg-facebook", c.social && c.social.facebook);
    setVal("cfg-tiktok", c.social && c.social.tiktok);
  }

  function riempiAppartamenti() {
    var lista = getAppartamenti();
    var html = "";
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      html +=
        '<section class="apt-block" data-id="' +
        escapeHtml(a.id) +
        '">' +
        "<h2>" +
        escapeHtml(a.nome) +
        "</h2>" +
        '<label>Stato</label><select data-f="stato">' +
        opt("disponibile", a.stato) +
        opt("in-costruzione", a.stato) +
        "</select>" +
        '<label>Link pagina Booking.com</label><input data-f="linkBooking" value="' +
        escapeHtml(a.linkBooking || "") +
        '">' +
        '<label>Link pagina Airbnb</label><input data-f="linkAirbnb" value="' +
        escapeHtml(a.linkAirbnb || "") +
        '">' +
        '<label>URL iCal Booking (esporta calendario dal gestionale Booking)</label><input data-f="icalBooking" value="' +
        escapeHtml(a.icalBooking || "") +
        '">' +
        '<label>URL iCal Airbnb</label><input data-f="icalAirbnb" value="' +
        escapeHtml(a.icalAirbnb || "") +
        '">' +
        '<label>Testo file .ics (se il browser non legge gli URL)</label>' +
        '<textarea data-f="icalSnapshot" rows="4">' +
        escapeHtml(a.icalSnapshot || "") +
        "</textarea>" +
        "</section>";
    }
    listaApt.innerHTML = html;
  }

  function opt(val, attuale) {
    return (
      '<option value="' +
      val +
      '"' +
      (val === attuale ? " selected" : "") +
      ">" +
      val +
      "</option>"
    );
  }

  function setVal(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = v || "";
  }

  document.getElementById("btn-salva").addEventListener("click", function () {
    var c = getConfig();
    c.whatsapp = document.getElementById("cfg-whatsapp").value.trim();
    c.email = document.getElementById("cfg-email").value.trim();
    c.telefono = document.getElementById("cfg-telefono").value.trim();
    c.indirizzo = document.getElementById("cfg-indirizzo").value.trim();
    c.partitaIva = document.getElementById("cfg-piva").value.trim();
    c.social = c.social || {};
    c.social.instagram = document.getElementById("cfg-instagram").value.trim();
    c.social.facebook = document.getElementById("cfg-facebook").value.trim();
    c.social.tiktok = document.getElementById("cfg-tiktok").value.trim();
    localStorage.setItem(window.ATC_STORAGE_CONFIG, JSON.stringify(c));

    var lista = getAppartamenti();
    var blocchi = listaApt.querySelectorAll(".apt-block");
    for (var i = 0; i < blocchi.length; i++) {
      var id = blocchi[i].getAttribute("data-id");
      var apt = null;
      for (var k = 0; k < lista.length; k++) if (lista[k].id === id) apt = lista[k];
      if (!apt) continue;
      apt.stato = blocchi[i].querySelector('[data-f=stato]').value;
      apt.linkBooking = blocchi[i].querySelector("[data-f=linkBooking]").value.trim();
      apt.linkAirbnb = blocchi[i].querySelector("[data-f=linkAirbnb]").value.trim();
      apt.icalBooking = blocchi[i].querySelector("[data-f=icalBooking]").value.trim();
      apt.icalAirbnb = blocchi[i].querySelector("[data-f=icalAirbnb]").value.trim();
      apt.icalSnapshot = blocchi[i].querySelector("[data-f=icalSnapshot]").value;
    }
    localStorage.setItem(window.ATC_STORAGE_APT, JSON.stringify(lista));
    avviso("Anteprima salvata in questo browser. Per renderla permanente: Scarica i file del sito e sostituiscili in js/.");
  });

  document.getElementById("btn-file-sito").addEventListener("click", function () {
    var c = getConfig();
    var cfgJs =
      "window.CONFIG = " +
      JSON.stringify(c, null, 2) +
      ";\nwindow.ATC_STORAGE_CONFIG = \"atc_config\";\nwindow.ATC_STORAGE_APT = \"atc_appartamenti\";\nwindow.ATC_STORAGE_SESSION = \"atc_admin_ok\";\n";
    var aptJs = "window.APPARTAMENTI = " + JSON.stringify(getAppartamenti(), null, 2) + ";\n";
    scaricaFile("config.js", cfgJs);
    scaricaFile("appartamenti-data.js", aptJs);
    avviso("Scarica i due file e copiali nella cartella js/ al posto di quelli vecchi. Poi le modifiche restano per tutti.");
  });

  function scaricaFile(nome, testo) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([testo], { type: "text/javascript" }));
    a.download = nome;
    a.click();
  }

  document.getElementById("btn-export").addEventListener("click", function () {
    var blob = new Blob(
      [JSON.stringify({ config: getConfig(), appartamenti: getAppartamenti() }, null, 2)],
      { type: "application/json" }
    );
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "appartamenti-export.json";
    a.click();
  });

  document.getElementById("btn-esci").addEventListener("click", function () {
    sessionStorage.removeItem(window.ATC_STORAGE_SESSION);
    window.location.reload();
  });

  function avviso(t) {
    msg.textContent = t;
    msg.classList.add("is-on");
  }
})();
