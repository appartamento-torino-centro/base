/*
  ============================================
  CATALOGO — tutte le card appartamento
  ============================================

  Genera la griglia partendo solo da appartamenti-data.js.
*/

(function () {
  var contenitore = document.getElementById("catalogo");
  if (!contenitore) return;

  var lista = getAppartamenti();
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    html += renderCard(lista[i]);
  }

  if (!html) {
    html = "<p>Nessun appartamento da mostrare al momento.</p>";
  }

  contenitore.innerHTML = html;
})();
