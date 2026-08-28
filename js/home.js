/*
  ============================================
  HOME — elenco appartamenti in evidenza
  ============================================

  Legge window.APPARTAMENTI e disegna le card
  dentro l’elemento con id="lista-home".
*/

(function () {
  var contenitore = document.getElementById("lista-home");
  if (!contenitore) return;

  var lista = getAppartamenti();
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].evidenzaHome === false) continue;
    html += renderCard(lista[i]);
  }

  contenitore.innerHTML = html;
})();
