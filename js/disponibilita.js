/*
  Motore date / occupazione / prezzo.
  Usato da calendario, ricerca catalogo e prenotazione.
*/

function ymd(d) {
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length < 2) m = "0" + m;
  if (day.length < 2) day = "0" + day;
  return d.getFullYear() + "-" + m + "-" + day;
}

function formatDataUI(s) {
  var d = parseYmd(s);
  if (!d) return "";
  var loc = isEn() ? "en-GB" : "it-IT";
  return d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
}

function parseYmd(s) {
  if (!s) return null;
  var p = String(s).split("-");
  if (p.length < 3) return null;
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function nottiTra(checkin, checkout) {
  var a = parseYmd(checkin);
  var b = parseYmd(checkout);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000);
}

function elencoNotti(checkin, checkout) {
  var n = nottiTra(checkin, checkout);
  var out = [];
  var d = parseYmd(checkin);
  if (!d || n < 1) return out;
  for (var i = 0; i < n; i++) {
    out.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function rangeLibero(occupati, checkin, checkout) {
  if (nottiTra(checkin, checkout) < 1) return false;
  var notti = elencoNotti(checkin, checkout);
  var occ = occupati || [];
  for (var i = 0; i < notti.length; i++) {
    if (occ.indexOf(notti[i]) !== -1) return false;
  }
  return true;
}

function ospitiOk(apt, n) {
  var max = apt && apt.capacita ? apt.capacita.max : 0;
  if (!n) return true;
  return n >= 1 && n <= max;
}

function aptCercabile(apt, occupati, checkin, checkout, guests) {
  if (!apt || apt.stato === "in-costruzione") return false;
  if (guests && !ospitiOk(apt, guests)) return false;
  if (checkin && checkout) return rangeLibero(occupati, checkin, checkout);
  return true;
}

function calcolaTotale(apt, checkin, checkout, extraIds) {
  var notti = nottiTra(checkin, checkout);
  var base = (apt.prezzoNotte || 0) * notti;
  var pulizia = apt.prezzoPulizia || 0;
  var extra = 0;
  var ids = extraIds || [];
  var lista = apt.serviziExtra || [];
  var dettagli = [];
  for (var i = 0; i < lista.length; i++) {
    if (ids.indexOf(lista[i].id) === -1) continue;
    var p = lista[i].prezzo || 0;
    extra += p;
    dettagli.push({ id: lista[i].id, prezzo: p, label: lista[i].label, labelEn: lista[i].labelEn });
  }
  return {
    notti: notti,
    base: base,
    pulizia: pulizia,
    extra: extra,
    totale: base + pulizia + extra,
    dettagliExtra: dettagli,
  };
}

function msgWhatsAppPrenota(apt, dati) {
  var en = isEn();
  var extra = "";
  if (dati.codice) extra += (en ? "\nReference: " : "\nCodice: ") + dati.codice;
  if (dati.nome) extra += (en ? "\nName: " : "\nNome: ") + dati.nome;
  if (en) {
    return (
      "Hello, I would like to book " +
      apt.nome +
      ".\nCheck-in: " +
      dati.checkin +
      "\nCheck-out: " +
      dati.checkout +
      "\nGuests: " +
      dati.ospiti +
      "\nTotal: €" +
      dati.totale +
      extra
    );
  }
  return (
    "Buongiorno, vorrei prenotare " +
    apt.nome +
    ".\nCheck-in: " +
    dati.checkin +
    "\nCheck-out: " +
    dati.checkout +
    "\nOspiti: " +
    dati.ospiti +
    "\nTotale: €" +
    dati.totale +
    extra
  );
}
