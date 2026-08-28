/*
  ============================================
  ELENCO APPARTAMENTI — fonte unica dei dati
  ============================================

  Tutto il sito (home, catalogo, pagine dettaglio, form contatti)
  legge questo elenco.

  --------------------------------------------
  COME AGGIUNGERE UN NUOVO APPARTAMENTO
  --------------------------------------------
  1. Bisogna copiare un oggetto già presente.
  2. Cambiare almeno:
       - id    → deve essere unico, es. "apt-03"
       - slug  → minuscolo, senza spazi, es. "via-po-12"
                 (diventa l’indirizzo: appartamento.html?slug=via-po-12)
  3. Compila nome, testi, foto, servizi.
  4. Imposta stato:
       "in-costruzione"  → card e pagina “Prossimamente”
       "disponibile"     → visibile e prenotabile
*/

window.APPARTAMENTI = [
  /* ---------- Appartamento 1: già pronto ---------- */
  {
    id: "apt-01",
    slug: "torino-centro",
    nome: "Appartamento Torino Centro",
    stato: "disponibile",
    evidenzaHome: true,
    tipologia: "Monolocale / bilocale",
    capacita: {
      min: 2,
      max: 4,
      label: "2–4 ospiti",
    },
    metriQuadri: 50,
    indirizzo: "Via Paolo Sacchi 36",
    zona: "Crocetta, Torino",
    vicinoA: ["Porta Nuova", "Metro", "Museo Egizio", "Piazza Castello"],
    descrizioneBreve:
      "Un rifugio elegante a pochi passi da Porta Nuova: parquet, luce naturale e tutto il comfort per vivere Torino come fosse casa tua.",
    descrizioneBreveEn:
      "An elegant hideaway a few minutes from Porta Nuova: parquet floors, natural light and the comfort of a real home in Turin.",
    descrizioneLunga: [
      "Nel cuore della Crocetta, a due passi dalla stazione di Porta Nuova, questo appartamento è pensato per chi vuole Torino sotto casa e il silenzio di un interno curato. Accogliamo ospiti da tutto il mondo.",
      "Circa 50 metri quadri, organizzati con eleganza: zona giorno luminosa, angolo cottura attrezzato, zona notte confortevole e bagno privato. Il parquet e i dettagli scelti con cura danno all’insieme un’atmosfera da casa, non da albergo.",
      "Ideale per coppie, famiglie e viaggi di lavoro, in due, tre o quattro persone. Wi-Fi veloce, aria condizionata e riscaldamento: tutto ciò che serve per un arrivo sereno, in ogni stagione.",
      "Uscendo, in pochi minuti sei in stazione, in metro, verso il Museo Egizio, Piazza Castello e i caffè di Via Roma. Tornando, la porta si chiude su un ambiente caldo e raccolto.",
    ],
    descrizioneLungaEn: [
      "In the heart of Crocetta, a short walk from Porta Nuova station, this apartment is for anyone who wants Turin at the door and quiet when it closes. We welcome guests from all over the world.",
      "About 50 square metres, arranged with care: a bright living area, a fully equipped kitchen, a comfortable sleeping area and a private bathroom. Parquet and chosen details make it feel like a home, not a hotel.",
      "Ideal for couples, small families and work trips — two to four guests. Fast Wi-Fi, air conditioning and heating, all year round.",
      "Within minutes you reach the station, the metro, the Egyptian Museum, Piazza Castello and the cafés of Via Roma. Then you come home.",
    ],
    servizi: [
      { id: "wifi", label: "Wi-Fi alta velocità" },
      { id: "ac", label: "Aria condizionata" },
      { id: "cucina", label: "Cucina attrezzata" },
      { id: "lavatrice", label: "Lavatrice" },
      { id: "tv", label: "TV" },
      { id: "asciugacapelli", label: "Asciugacapelli" },
      { id: "bagno", label: "Bagno privato" },
      { id: "riscaldamento", label: "Riscaldamento" },
      { id: "parquet", label: "Pavimento in parquet" },
    ],
    caratteristicheSpeciali: [
      "Posizione centrale, a pochi minuti da Porta Nuova",
      "Atmosfera elegante, pensata anche per le coppie",
      "Comfort moderno in un palazzo di Torino",
      "Ospitalità diretta, italiana, senza intermediazioni fredde",
    ],
    /* Foto placeholder di alta qualità: sostituisci src con i tuoi file in assets/images/ */
    galleria: [
      {
        src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
        alt: "Soggiorno elegante con luce naturale e arredi raffinati",
      },
      {
        src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
        alt: "Zona giorno contemporanea con dettagli in legno",
      },
      {
        src: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1600&q=80",
        alt: "Cucina attrezzata in stile contemporaneo",
      },
      {
        src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80",
        alt: "Camera da letto accogliente e luminosa",
      },
      {
        src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80",
        alt: "Bagno privato con finiture chiare",
      },
      {
        src: "assets/images/torino-mole-antonelliana.jpg",
        alt: "La Mole Antonelliana vista da una via del centro di Torino",
      },
    ],
    prezzoOrientativo: "A partire da €110 / notte",
    prezzoNotte: 110,
    prezzoPulizia: 40,
    coordinate: {
      lat: 45.05855,
      lng: 7.67420,
    },
    comeArrivare:
      "Dalla stazione di Porta Nuova: 8–10 minuti a piedi lungo Via Paolo Sacchi, direzione sud. In auto il civico è 36, zona Crocetta / San Secondo. Metro: fermata Porta Nuova.",
    comeArrivareEn:
      "From Porta Nuova station: an 8–10 minute walk south along Via Paolo Sacchi. By car, number 36, Crocetta / San Secondo. Metro: Porta Nuova stop.",
    serviziExtra: [
      { id: "late", label: "Check-in notturno (dopo le 22)", labelEn: "Late check-in (after 10 pm)", prezzo: 25 },
      { id: "culla", label: "Culla per neonati", labelEn: "Baby crib", prezzo: 15 },
      { id: "pulizia-extra", label: "Pulizia extra a metà soggiorno", labelEn: "Mid-stay extra cleaning", prezzo: 35 },
    ],
    linkBooking: "",
    linkAirbnb: "",
    icalBooking: "",
    icalAirbnb: "",
    icalSnapshot: "",
    whatsappMessaggioIt:
      "Buongiorno, sono interessato a prenotare Appartamento Torino Centro in Via Paolo Sacchi 36 e vorrei ricevere disponibilità e informazioni.",
    whatsappMessaggioEn:
      "Hello, I would like to book Appartamento Torino Centro at Via Paolo Sacchi 36 and would like availability and information.",
  },

  /* ---------- Appartamento 2: in arrivo ---------- */
  {
    id: "apt-02",
    slug: "secondo",
    nome: "Secondo rifugio",
    stato: "in-costruzione",
    evidenzaHome: true,
    tipologia: "In definizione",
    capacita: {
      min: 2,
      max: 4,
      label: "Ospiti in definizione",
    },
    metriQuadri: null,
    indirizzo: "Torino",
    zona: "Torino centro",
    vicinoA: [],
    descrizioneBreve:
      "Stiamo preparando un nuovo indirizzo a Torino, con lo stesso standard di eleganza. A new address is on the way.",
    descrizioneBreveEn:
      "We are preparing a new address in Turin, with the same standard of elegance and the same sense of home.",
    descrizioneLunga: [
      "Il secondo rifugio di Appartamento Torino Centro è in preparazione.",
      "Vogliamo offrirvi un’altra casa in città: stessi materiali scelti con attenzione, stessa ospitalità diretta, una nuova posizione da vivere con calma.",
      "Lasciateci un messaggio: vi avviseremo per primi quando le porte saranno aperte.",
    ],
    descrizioneLungaEn: [
      "The second home of Appartamento Torino Centro is on its way.",
      "We want to offer you another house in the city: the same careful materials, the same direct hospitality, a new place to live slowly.",
      "Leave us a message — in Italian or English — and we will tell you first when the doors open.",
    ],
    servizi: [],
    caratteristicheSpeciali: [
      "Stesso livello di cura del primo appartamento",
      "Ospitalità italiana, gestita in prima persona",
    ],
    galleria: [
      {
        src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
        alt: "Interno in attesa, atmosfera raccolta e luminosa",
      },
    ],
    prezzoOrientativo: null,
    prezzoNotte: 0,
    prezzoPulizia: 0,
    coordinate: null,
    comeArrivare: "",
    comeArrivareEn: "",
    serviziExtra: [],
    linkBooking: "",
    linkAirbnb: "",
    icalBooking: "",
    icalAirbnb: "",
    icalSnapshot: "",
    whatsappMessaggioIt:
      "Buongiorno, vorrei essere aggiornato quando il secondo appartamento sarà disponibile a Torino.",
    whatsappMessaggioEn:
      "Hello, I would like to be updated when the second apartment in Turin becomes available.",
  },
];
