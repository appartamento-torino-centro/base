/*
  Calendario disponibilità + selezione range check-in / check-out.
  iCal Booking/Airbnb 
*/

function parseIcalBusy(testo) {
  var busy = [];
  if (!testo) return busy;
  var blocchi = String(testo).split(/BEGIN:VEVENT/i);
  for (var i = 1; i < blocchi.length; i++) {
    var start = icalDate(blocchi[i], "DTSTART");
    var end = icalDate(blocchi[i], "DTEND") || start;
    if (!start) continue;
    var d = new Date(start.getTime());
    while (d < end) {
      busy.push(ymd(d));
      d.setDate(d.getDate() + 1);
    }
  }
  return busy;
}

function icalDate(blocco, chiave) {
  var re = new RegExp(chiave + "[^:]*:([0-9]{8})");
  var m = blocco.match(re);
  if (!m) return null;
  var s = m[1];
  return new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
}

function ymd(d) {
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length < 2) m = "0" + m;
  if (day.length < 2) day = "0" + day;
  return d.getFullYear() + "-" + m + "-" + day;
}

function scaricaIcal(url) {
  if (!url) return Promise.resolve("");
  return fetch(url, { mode: "cors" })
    .then(function (r) {
      if (!r.ok) throw new Error("ical");
      return r.text();
    })
    .catch(function () {
      return "";
    });
}

function unisciOccupati(apt) {
  var pezzi = [scaricaIcal(apt.icalBooking), scaricaIcal(apt.icalAirbnb)];
  return Promise.all(pezzi).then(function (testi) {
    var tutti = [];
    var fonti = testi.concat([apt.icalSnapshot || ""]);
    for (var i = 0; i < fonti.length; i++) {
      var giorni = parseIcalBusy(fonti[i]);
      for (var g = 0; g < giorni.length; g++) {
        if (tutti.indexOf(giorni[g]) === -1) tutti.push(giorni[g]);
      }
    }
    return tutti;
  });
}

var MESI_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
var MESI_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function montaCalendario(contenitore, apt, onChange) {
  if (!contenitore || !apt) return { getRange: function () { return { checkin: "", checkout: "" }; } };
  var vista = new Date();
  vista.setDate(1);
  var checkin = "";
  var checkout = "";
  var occupati = [];

  contenitore.innerHTML =
    '<div class="cal">' +
    '  <p class="cal__sel" data-cal="sel"></p>' +
    (typeof logoDivider === "function" ? logoDivider() : "") +
    '  <div class="cal__nav">' +
    '    <button type="button" data-cal="prev" aria-label="Mese precedente">‹</button>' +
    '    <p class="cal__title" data-cal="label"></p>' +
    '    <button type="button" data-cal="next" aria-label="Mese successivo">›</button>' +
    "  </div>" +
    '  <div class="cal__grid" data-cal="grid"></div>' +
    "</div>";

  function avvisa() {
    if (typeof onChange === "function") onChange({ checkin: checkin, checkout: checkout, occupati: occupati });
  }

  function testoSel() {
    var el = contenitore.querySelector("[data-cal=sel]");
    if (!el) return;
    if (!checkin) {
      el.textContent = t("Seleziona il check-in", "Select check-in");
    } else if (!checkout) {
      el.textContent = t("Check-in ", "Check-in ") + formatDataUI(checkin) + t(" — ora il check-out", " — now pick check-out");
    } else {
      el.textContent = formatDataUI(checkin) + " → " + formatDataUI(checkout);
    }
    var inBtn = document.getElementById("book-in") || document.getElementById("src-in-btn");
    var outBtn = document.getElementById("book-out") || document.getElementById("src-out-btn");
    if (inBtn) inBtn.textContent = checkin ? formatDataUI(checkin) : t("Aggiungi data", "Add date");
    if (outBtn) outBtn.textContent = checkout ? formatDataUI(checkout) : t("Aggiungi data", "Add date");
  }

  unisciOccupati(apt).then(function (lista) {
    occupati = lista;
    disegna();
    avvisa();
  });

  function inRange(key) {
    if (!checkin) return false;
    if (!checkout) return key === checkin;
    return key >= checkin && key < checkout;
  }

  function disegna() {
    var label = contenitore.querySelector("[data-cal=label]");
    var grid = contenitore.querySelector("[data-cal=grid]");
    var mesi = isEn() ? MESI_EN : MESI_IT;
    if (label) label.textContent = mesi[vista.getMonth()] + " " + vista.getFullYear();
    testoSel();

    var html = "";
    var giorni = isEn()
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    for (var i = 0; i < 7; i++) html += '<div class="cal__dow">' + giorni[i] + "</div>";

    var primo = new Date(vista.getFullYear(), vista.getMonth(), 1);
    var offset = (primo.getDay() + 6) % 7;
    var ultimo = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
    var oggi = ymd(new Date());

    var celle = 0;
    for (var e = 0; e < offset; e++) {
      html += '<span class="cal__day is-empty"></span>';
      celle++;
    }

    for (var g = 1; g <= ultimo; g++) {
      var data = new Date(vista.getFullYear(), vista.getMonth(), g);
      var key = ymd(data);
      var classi = "cal__day";
      if (key < oggi) classi += " is-past";
      else if (occupati.indexOf(key) !== -1) classi += " is-busy";
      else classi += " is-free";
      if (key === checkin) classi += " is-start";
      if (checkout && key === checkout) classi += " is-end";
      if (inRange(key)) classi += " is-in";
      var dis = classi.indexOf("is-past") !== -1 || classi.indexOf("is-busy") !== -1;
      html +=
        '<button type="button" class="' +
        classi +
        '" data-day="' +
        key +
        '"' +
        (dis ? " disabled" : "") +
        ">" +
        g +
        "</button>";
      celle++;
    }
    while (celle < 42) {
      html += '<span class="cal__day is-empty"></span>';
      celle++;
    }
    grid.innerHTML = html;

    var bottoni = grid.querySelectorAll(".cal__day[data-day]:not([disabled])");
    for (var b = 0; b < bottoni.length; b++) {
      bottoni[b].addEventListener("click", onClickGiorno);
    }
  }

  function onClickGiorno() {
    var key = this.getAttribute("data-day");
    if (!checkin || (checkin && checkout)) {
      checkin = key;
      checkout = "";
    } else if (key <= checkin) {
      checkin = key;
      checkout = "";
    } else if (!rangeLibero(occupati, checkin, key)) {
      checkin = key;
      checkout = "";
    } else {
      checkout = key;
    }
    disegna();
    avvisa();
    if (checkout) chiudiCalendarioOverlay();
  }

  contenitore.querySelector("[data-cal=prev]").addEventListener("click", function () {
    vista.setMonth(vista.getMonth() - 1);
    disegna();
  });
  contenitore.querySelector("[data-cal=next]").addEventListener("click", function () {
    vista.setMonth(vista.getMonth() + 1);
    disegna();
  });

  var ov = document.getElementById("cal-overlay");
  if (ov && !ov.getAttribute("data-bound")) {
    ov.setAttribute("data-bound", "1");
    ov.addEventListener("click", function (e) {
      if (e.target === ov) chiudiCalendarioOverlay();
    });
    var cx = document.getElementById("cal-overlay-x");
    var ok = document.getElementById("cal-overlay-ok");
    if (cx) cx.addEventListener("click", chiudiCalendarioOverlay);
    if (ok) ok.addEventListener("click", chiudiCalendarioOverlay);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") chiudiCalendarioOverlay();
    });
  }

  return {
    getRange: function () {
      return { checkin: checkin, checkout: checkout, occupati: occupati };
    },
    open: apriCalendarioOverlay,
  };
}

function apriCalendarioOverlay() {
  var o = document.getElementById("cal-overlay");
  if (!o) return;
  if (o.parentNode !== document.body) document.body.appendChild(o);
  o.removeAttribute("hidden");
  o.classList.add("is-open");
}

function chiudiCalendarioOverlay() {
  var o = document.getElementById("cal-overlay");
  if (!o) return;
  o.classList.remove("is-open");
  o.setAttribute("hidden", "");
}
