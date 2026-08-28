/*
  Lingua del sito: italiano (radice) o inglese (cartella /en/).
*/

function isEn() {
  var p = (location.pathname || "").replace(/\\/g, "/");
  return /\/en\//.test(p) || /\/en$/i.test(p);
}

function assetPath(rel) {
  return (isEn() ? "../" : "") + rel;
}

function t(it, en) {
  return isEn() ? en : it;
}
