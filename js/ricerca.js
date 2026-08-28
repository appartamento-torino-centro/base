/*
  Barra ricerca disponibilità sul catalogo (date + ospiti).
*/

(function () {
  var form = document.getElementById("form-ricerca");
  var box = document.getElementById("catalogo");
  var vuoto = document.getElementById("catalogo-vuoto");
  if (!form || !box) return;

  var params = new URLSearchParams(location.search);
  var guests = Number(params.get("guests") || 2);
  form.guests.value = guests;
  var gVal = document.getElementById("g-val");
  if (gVal) gVal.textContent = String(guests);

  document.getElementById("g-minus").onclick = function () {
    guests = Math.max(1, guests - 1);
    form.guests.value = guests;
    gVal.textContent = String(guests);
  };
  document.getElementById("g-plus").onclick = function () {
    guests = Math.min(8, guests + 1);
    form.guests.value = guests;
    gVal.textContent = String(guests);
  };

  if (typeof montaCalendario === "function" && document.getElementById("cal-root")) {
    window._calApi = montaCalendario(
      document.getElementById("cal-root"),
      { icalBooking: "", icalAirbnb: "", icalSnapshot: "" },
      function (r) {
        form.checkin.value = r.checkin || "";
        form.checkout.value = r.checkout || "";
      }
    );
    var apri = function () {
      if (window._calApi && window._calApi.open) window._calApi.open();
    };
    var ib = document.getElementById("src-in-btn");
    var ob = document.getElementById("src-out-btn");
    if (ib) ib.onclick = apri;
    if (ob) ob.onclick = apri;
  }

  if (params.get("in")) form.checkin.value = params.get("in");
  if (params.get("out")) form.checkout.value = params.get("out");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    cerca();
  });

  if (params.get("in") || params.get("guests")) cerca();

  function cerca() {
    var checkin = form.checkin.value;
    var checkout = form.checkout.value;
    var guests = Number(form.guests.value || 0);
    if (checkin && checkout && nottiTra(checkin, checkout) < 1) {
      if (vuoto) {
        vuoto.hidden = false;
        vuoto.textContent = t("Il check-out deve essere dopo il check-in.", "Check-out must be after check-in.");
      }
      box.innerHTML = "";
      return;
    }

    var lista = getAppartamenti();
    var attese = [];
    for (var i = 0; i < lista.length; i++) {
      attese.push(unisciOccupati(lista[i]).then(bind(lista[i])));
    }

    function bind(apt) {
      return function (occ) {
        return { apt: apt, occ: occ };
      };
    }

    Promise.all(attese).then(function (righe) {
      var html = "";
      var n = 0;
      for (var r = 0; r < righe.length; r++) {
        if (!aptCercabile(righe[r].apt, righe[r].occ, checkin, checkout, guests)) continue;
        html += renderCard(righe[r].apt);
        n++;
      }
      box.innerHTML = html;
      if (vuoto) {
        vuoto.hidden = n > 0;
        vuoto.textContent = t(
          "Nessun appartamento disponibile per queste date e questo numero di ospiti.",
          "No apartment available for these dates and this party size."
        );
      }
    });
  }
})();
