/*
  ============================================
  CONFIGURAZIONE DEL SITO
  ============================================

  Qui si cambiano contatti, P.IVA, social e accesso admin.
  Il pannello /admin può sovrascrivere questi valori
*/

window.CONFIG = {
  brand: "Appartamento Torino Centro",
  tagline: "Vivi Torino, sentiti a casa.",
  sitoUrl: "https://appartamentotorinocentro.it",

  whatsapp: "393356110429",
  whatsappMessaggioDefaultIt:
    "Buongiorno, sono interessato a prenotare un soggiorno presso Appartamento Torino Centro e vorrei ricevere maggiori informazioni.",
  whatsappMessaggioDefaultEn:
    "Hello, I would like to book a stay at Appartamento Torino Centro and would like more information.",

  email: "info@appartamentotorinocentro.it",
  telefono: "+39 335 611 0429",
  telefonoHref: "tel:+393356110429",

  indirizzo: "Via Paolo Sacchi 36",
  citta: "Torino, Italia",
  zonaGenerale: "Crocetta · Porta Nuova",
  cap: "10128",
  /* Coordinate OSM di Via Paolo Sacchi 36, Crocetta / San Secondo, Torino */
  coordinate: { lat: 45.05855, lng: 7.67420 },

  partitaIva: "115560400019",
  copyrightDal: 2021,
  orariRisposta: "Rispondiamo tutti i giorni, in genere entro poche ore.",
  orariRispostaEn: "We reply every day, usually within a few hours.",

  social: {
    instagram: "https://www.instagram.com/appartamento.torino.centro/",
    facebook: "https://www.facebook.com/people/Appartamento-Torino-Centro/61589931309081/",
    tiktok: "https://www.tiktok.com/@appartament.torino.centr",
  },

  /*
    ACCESSO ADMIN 
  */
  adminUtente: "admin",
  adminPassword: "TorinoCentro2026",
};

/* Chiave usata dal pannello admin per salvare le modifiche in locale */
window.ATC_STORAGE_CONFIG = "atc_config";
window.ATC_STORAGE_APT = "atc_appartamenti";
window.ATC_STORAGE_SESSION = "atc_admin_ok";
window.ATC_STORAGE_BOOKINGS = "atc_prenotazioni";
