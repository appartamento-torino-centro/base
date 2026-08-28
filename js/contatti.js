(function () {
  var select = document.getElementById("campo-appartamento");
  var form = document.getElementById("form-contatti");
  if (!select || !form) return;

  /* Menu a tendina: un’opzione per ogni appartamento */
  var lista = getAppartamenti();
  var options = '<option value="">' + t("Non so ancora", "I am not sure yet") + "</option>";
  for (var i = 0; i < lista.length; i++) {
    var apt = lista[i];
    var etichetta = apt.nome;
    if (apt.stato === "in-costruzione") etichetta += t(" (prossimamente)", " (coming soon)");
    options +=
      '<option value="' +
      escapeHtml(apt.slug) +
      '">' +
      escapeHtml(etichetta) +
      "</option>";
  }
  select.innerHTML = options;

  /* Se si arriva da un link tipo contatti.html?slug=torino-centro, preseleziona */
  var pre = new URLSearchParams(window.location.search).get("slug");
  if (pre) select.value = pre;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!valida(form)) return;

    var dati = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      appartamento: form.appartamento.value || "non specificato",
      messaggio: form.messaggio.value.trim(),
    };

    inviaMessaggio(dati);
  });
})();

/* Controlli semplici */
function valida(form) {
  var ok = true;
  ok = campoObbligatorio(form.nome, "Inserisci il tuo nome.") && ok;
  ok = campoObbligatorio(form.email, "Inserisci una email valida.") && ok;
  ok = campoObbligatorio(form.messaggio, "Scrivi un breve messaggio.") && ok;
  ok = campoObbligatorio(form.privacy, "Per continuare serve il consenso.") && ok;

  if (form.email.value && form.email.value.indexOf("@") === -1) {
    mostraErrore(form.email, "Controlla l’indirizzo email.");
    ok = false;
  }

  return ok;
}

function campoObbligatorio(campo, testo) {
  var vuoto = campo.type === "checkbox" ? !campo.checked : !String(campo.value || "").trim();
  if (vuoto) {
    mostraErrore(campo, testo);
    return false;
  }
  nascondiErrore(campo);
  return true;
}

function mostraErrore(campo, testo) {
  var box = campo.parentNode.querySelector(".form-error");
  if (box) {
    box.textContent = testo;
    box.classList.add("is-visible");
  }
}

function nascondiErrore(campo) {
  var box = campo.parentNode.querySelector(".form-error");
  if (box) box.classList.remove("is-visible");
}

/*
  Invio attuale = aprire WhatsApp.
*/
function inviaMessaggio(dati) {
  var testo =
    "Buongiorno, sono " +
    dati.nome +
    ".\n" +
    "Email: " +
    dati.email +
    "\n" +
    (dati.telefono ? "Telefono: " + dati.telefono + "\n" : "") +
    "Appartamento: " +
    dati.appartamento +
    "\n\n" +
    dati.messaggio;

  var okBox = document.getElementById("form-success");
  if (okBox) okBox.classList.add("is-visible");

  /* Canale attuale: WhatsApp. Fallback: programma di posta. */
  try {
    window.open(urlWhatsApp(testo), "_blank", "noopener");
  } catch (e) {
    var mail = (window.CONFIG && window.CONFIG.email) || "";
    window.location.href =
      "mailto:" + mail + "?subject=" + encodeURIComponent("Richiesta soggiorno") + "&body=" + encodeURIComponent(testo);
  }
}
