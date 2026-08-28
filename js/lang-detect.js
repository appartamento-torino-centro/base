/*
  Rileva la lingua all’ingresso (browser, poi IP).
  Il selettore IT | EN salva atc_lang e ha sempre priorità.
*/
(function () {
  var COOKIE = "atc_lang";

  function getLang() {
    try {
      return localStorage.getItem(COOKIE) || "";
    } catch (e) {
      return "";
    }
  }

  function setLang(l) {
    try {
      localStorage.setItem(COOKIE, l);
    } catch (e) {}
  }

  function pathIsEn() {
    var p = (location.pathname || "").replace(/\\/g, "/");
    return /\/en\//.test(p) || /\/en$/i.test(p);
  }

  function pagina() {
    var p = (location.pathname || "").replace(/\\/g, "/");
    if (/appartamenti\.html/.test(p)) return "appartamenti";
    if (/appartamento\.html/.test(p)) return "appartamento";
    if (/contatti\.html/.test(p)) return "contatti";
    return "home";
  }

  function urlLang(lang) {
    var en = lang === "en";
    var quiEn = pathIsEn();
    var q = location.search || "";
    var map = {
      home: en ? "index.html" : "index.html",
      appartamenti: "appartamenti.html",
      appartamento: "appartamento.html",
      contatti: "contatti.html",
    };
    var file = map[pagina()] || "index.html";
    if (en && !quiEn) return "en/" + file + q;
    if (!en && quiEn) return "../" + file + q;
    return "";
  }

  function vai(lang) {
    var dest = urlLang(lang);
    if (dest) location.replace(dest);
  }

  function daBrowser() {
    var list = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var l = String(list[i] || "").toLowerCase();
      if (l.indexOf("it") === 0) return "it";
      if (l.indexOf("en") === 0) return "en";
    }
    return "";
  }

  function daIp() {
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        resolve("");
      }, 1500);
      fetch("https://ipapi.co/json/")
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          if (done) return;
          done = true;
          clearTimeout(t);
          var c = String((j && j.country_code) || "").toUpperCase();
          resolve(c === "IT" ? "it" : c ? "en" : "");
        })
        .catch(function () {
          if (done) return;
          done = true;
          clearTimeout(t);
          resolve("");
        });
    });
  }

  var saved = getLang();
  if (saved === "it" || saved === "en") {
    if ((saved === "en") !== pathIsEn()) vai(saved);
    return;
  }

  var br = daBrowser();
  if (br) {
    setLang(br);
    if ((br === "en") !== pathIsEn()) vai(br);
    return;
  }

  daIp().then(function (ip) {
    var lang = ip || "it";
    setLang(lang);
    if ((lang === "en") !== pathIsEn()) vai(lang);
  });
})();
