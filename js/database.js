// File: js/database.js
// Questo file contiene i dati statici. Non modificarlo dinamicamente.
// Lo stato (letto/non letto, note, tag) viene salvato nel LocalStorage del browser.

const MASTER_DB = [
    // --- SIMONDON (Filosofia Teoretica) ---
    { id: "S01", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2005", title: "L'individuation à la lumière des notions de forme et d'information", pub: "Jérôme Millon", cat: "Primary Sources", prio: "ESSENTIAL", desc: "Il testo base sull'individuatione." },
    { id: "S02", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1958", title: "Du mode d'existence des objets techniques", pub: "Aubier", cat: "Primary Sources", prio: "ESSENTIAL", desc: "Genesi tecnica e alienazione." },
    { id: "S03", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1989", title: "L'individuation psychique et collective", pub: "Aubier", cat: "Primary Sources", prio: "HIGH", desc: "Transindividuale e affettività." },
    { id: "S04", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2008", title: "Imagination et invention", pub: "La Transparence", cat: "Primary Sources", prio: "HIGH", desc: "Ciclo delle immagini." },
    { id: "S05", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2010", title: "Communication et information", pub: "La Transparence", cat: "Primary Sources", prio: "MEDIUM", desc: "Cibernetica." },
    { id: "S06", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2006", title: "L'invention dans les techniques", pub: "Seuil", cat: "Primary Sources", prio: "MEDIUM", desc: "L'atto inventivo." },
    { id: "S07", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2014", title: "Sur la technique", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Saggi vari." },
    { id: "S08", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2015", title: "Sur la psychologie", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Scritti psicologici." },
    { id: "S09", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2016", title: "Sur la philosophie", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Storia della filosofia." },
    { id: "S10", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "2004", title: "Deux leçons sur l'animal et l'homme", pub: "Ellipses", cat: "Primary Sources", prio: "MEDIUM", desc: "Antropologia." },
    { id: "S11", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1960", title: "Forme, information, potentiels", pub: "Bulletin SFP", cat: "Primary Sources", prio: "HIGH", desc: "Articolo chiave." },
    { id: "S12", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1965", title: "Culture et technique", pub: "Bulletin I.P.S.O.", cat: "Primary Sources", prio: "MEDIUM", desc: "Rapporto cultura/tecnica." },
    { id: "S13", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1953", title: "La mentalité technique", pub: "PUF", cat: "Primary Sources", prio: "HIGH", desc: "Schemi cognitivi." },
    { id: "S14", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1983", title: "L'histoire de la notion d'individu", pub: "Vrin", cat: "Primary Sources", prio: "MEDIUM", desc: "Corso storico." },
    { id: "S15", subject: "Filosofia Teoretica", author: "Simondon, G.", year: "1992", title: "Perception et modulation", pub: "Vrin", cat: "Primary Sources", prio: "MEDIUM", desc: "Percezione." },

    // --- DELEUZE (Filosofia Teoretica) ---
    { id: "D01", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1968", title: "Différence et répétition", pub: "PUF", cat: "Primary Sources", prio: "ESSENTIAL", desc: "Ontologia della differenza." },
    { id: "D02", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1969", title: "Logique du sens", pub: "Minuit", cat: "Primary Sources", prio: "ESSENTIAL", desc: "Evento e singolarità." },
    { id: "D03", subject: "Filosofia Teoretica", author: "Deleuze, G. & Guattari, F.", year: "1972", title: "L'Anti-Œdipe", pub: "Minuit", cat: "Primary Sources", prio: "HIGH", desc: "Macchine desideranti." },
    { id: "D04", subject: "Filosofia Teoretica", author: "Deleuze, G. & Guattari, F.", year: "1980", title: "Mille Plateaux", pub: "Minuit", cat: "Primary Sources", prio: "ESSENTIAL", desc: "Rizoma." },
    { id: "D05", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1988", title: "Le Pli", pub: "Minuit", cat: "Primary Sources", prio: "HIGH", desc: "Modulazione." },
    { id: "D06", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "2002", title: "L'île déserte", pub: "Minuit", cat: "Primary Sources", prio: "HIGH", desc: "Testi vari." },
    { id: "D07", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1966", title: "Le Bergsonisme", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Virtuale." },
    { id: "D08", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1981", title: "Spinoza: Philosophie pratique", pub: "Minuit", cat: "Primary Sources", prio: "MEDIUM", desc: "Affetti." },
    { id: "D09", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1990", title: "Pourparlers", pub: "Minuit", cat: "Primary Sources", prio: "MEDIUM", desc: "Controllo." },
    { id: "D10", subject: "Filosofia Teoretica", author: "Deleuze, G. & Guattari, F.", year: "1991", title: "Qu'est-ce que la philosophie?", pub: "Minuit", cat: "Primary Sources", prio: "MEDIUM", desc: "Concetti." },
    { id: "D11", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1962", title: "Nietzsche et la philosophie", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Forza." },
    { id: "D12", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1983", title: "Cinéma 1: L'Image-Mouvement", pub: "Minuit", cat: "Primary Sources", prio: "MEDIUM", desc: "Immagine." },
    { id: "D13", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1985", title: "Cinéma 2: L'Image-Temps", pub: "Minuit", cat: "Primary Sources", prio: "MEDIUM", desc: "Tempo." },
    { id: "D14", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "1964", title: "Proust et les signes", pub: "PUF", cat: "Primary Sources", prio: "MEDIUM", desc: "Segni." },
    { id: "D15", subject: "Filosofia Teoretica", author: "Deleuze, G.", year: "2003", title: "Deux régimes de fous", pub: "Minuit", cat: "Primary Sources", prio: "LOW", desc: "Postumi." },

    // --- COMPARATIVE (Filosofia Teoretica) ---
    { id: "C01", subject: "Filosofia Teoretica", author: "Combes, M.", year: "1999", title: "Simondon. Individu et collectivité", pub: "PUF", cat: "Comparative Studies", prio: "ESSENTIAL", desc: "Politica transindividuale." },
    { id: "C02", subject: "Filosofia Teoretica", author: "Barthélémy, J.H.", year: "2005", title: "Penser l'individuation", pub: "L'Harmattan", cat: "Comparative Studies", prio: "HIGH", desc: "Studio rigoroso." },
    { id: "C03", subject: "Filosofia Teoretica", author: "Barthélémy, J.H.", year: "2008", title: "Simondon ou l'encyclopédisme génétique", pub: "PUF", cat: "Comparative Studies", prio: "HIGH", desc: "Sistematica." },
    { id: "C04", subject: "Filosofia Teoretica", author: "Garelli, G.", year: "2004", title: "Il problema dell'individuazione", pub: "Aut Aut", cat: "Comparative Studies", prio: "HIGH", desc: "Confronto." },
    { id: "C05", subject: "Filosofia Teoretica", author: "Toscano, A.", year: "2006", title: "The Theatre of Production", pub: "Palgrave", cat: "Comparative Studies", prio: "HIGH", desc: "Ontologia produttiva." },
    { id: "C06", subject: "Filosofia Teoretica", author: "Sauvagnargues, A.", year: "2009", title: "Deleuze, l'empirisme transcendantal", pub: "PUF", cat: "Comparative Studies", prio: "MEDIUM", desc: "Empirismo." },
    { id: "C07", subject: "Filosofia Teoretica", author: "Chabot, P.", year: "2003", title: "La philosophie de Simondon", pub: "Vrin", cat: "Comparative Studies", prio: "MEDIUM", desc: "Intro." },
    { id: "C08", subject: "Filosofia Teoretica", author: "De Boever, A.", year: "2013", title: "Gilbert Simondon: Being and Technology", pub: "Edinburgh UP", cat: "Comparative Studies", prio: "MEDIUM", desc: "Tecnica." },
    { id: "C09", subject: "Filosofia Teoretica", author: "Bardin, A.", year: "2015", title: "Epistemology and Political Philosophy in Simondon", pub: "Springer", cat: "Comparative Studies", prio: "HIGH", desc: "Politica." },
    { id: "C10", subject: "Filosofia Teoretica", author: "Vignola, P.", year: "2011", title: "La lingua animale", pub: "Quodlibet", cat: "Comparative Studies", prio: "MEDIUM", desc: "Animalità." },
    { id: "C11", subject: "Filosofia Teoretica", author: "Montebello, P.", year: "2002", title: "L'autre métaphysique", pub: "Desclée", cat: "Comparative Studies", prio: "HIGH", desc: "Natura." },
    { id: "C12", subject: "Filosofia Teoretica", author: "Roffe, J.", year: "2012", title: "Badiou's Deleuze", pub: "Acumen", cat: "Comparative Studies", prio: "LOW", desc: "Critica." },
    { id: "C13", subject: "Filosofia Teoretica", author: "Stiegler, B.", year: "2018", title: "The Age of Disruption", pub: "Polity", cat: "Comparative Studies", prio: "MEDIUM", desc: "Disagio." },
    { id: "C14", subject: "Filosofia Teoretica", author: "Massumi, B.", year: "2002", title: "Parables for the Virtual", pub: "Duke UP", cat: "Comparative Studies", prio: "MEDIUM", desc: "Virtuale." },
    { id: "C15", subject: "Filosofia Teoretica", author: "Guchet, X.", year: "2010", title: "Pour un humanisme technologique", pub: "PUF", cat: "Comparative Studies", prio: "HIGH", desc: "Umanesimo." },

    // --- TECH & ECOLOGY (Filosofia della Tecnica) ---
    { id: "T01", subject: "Filosofia della Tecnica", author: "Stiegler, B.", year: "1994", title: "La technique et le temps 1", pub: "Galilée", cat: "Philosophy of Technology", prio: "ESSENTIAL", desc: "Epifilogenesi." },
    { id: "T02", subject: "Filosofia della Tecnica", author: "Stiegler, B.", year: "1996", title: "La technique et le temps 2", pub: "Galilée", cat: "Philosophy of Technology", prio: "HIGH", desc: "Disorientamento." },
    { id: "T03", subject: "Filosofia della Tecnica", author: "Hui, Y.", year: "2016", title: "On the Existence of Digital Objects", pub: "Minnesota UP", cat: "Philosophy of Technology", prio: "HIGH", desc: "Oggetti digitali." },
    { id: "T04", subject: "Filosofia della Tecnica", author: "Hui, Y.", year: "2017", title: "The Question Concerning Technology in China", pub: "Urbanomic", cat: "Philosophy of Technology", prio: "HIGH", desc: "Cosmotecnica." },
    { id: "T05", subject: "Filosofia della Tecnica", author: "Hui, Y.", year: "2019", title: "Recursivity and Contingency", pub: "Rowman", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Ricorsività." },
    { id: "T06", subject: "Filosofia della Tecnica", author: "Heidegger, M.", year: "1954", title: "Die Frage nach der Technik", pub: "Neske", cat: "Philosophy of Technology", prio: "HIGH", desc: "Gestell." },
    { id: "T07", subject: "Filosofia della Tecnica", author: "Ellul, J.", year: "1954", title: "La Technique ou l'Enjeu du siècle", pub: "Colin", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Sistema tecnico." },
    { id: "T08", subject: "Filosofia della Tecnica", author: "Wiener, N.", year: "1948", title: "Cybernetics", pub: "MIT", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Cibernetica." },
    { id: "T09", subject: "Filosofia della Tecnica", author: "Leroi-Gourhan, A.", year: "1964", title: "Le Geste et la Parole", pub: "Albin Michel", cat: "Philosophy of Technology", prio: "HIGH", desc: "Evoluzione." },
    { id: "T10", subject: "Filosofia della Tecnica", author: "Simondon, G.", year: "1959", title: "L'Amplification dans les processus d'information", pub: "-", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Amplificazione." },
    { id: "T11", subject: "Filosofia della Tecnica", author: "Feenberg, A.", year: "1999", title: "Questioning Technology", pub: "Routledge", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Teoria critica." },
    { id: "T12", subject: "Filosofia della Tecnica", author: "Ihde, D.", year: "1990", title: "Technology and the Lifeworld", pub: "Indiana UP", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Post-fenomenologia." },
    { id: "T13", subject: "Filosofia della Tecnica", author: "Verbeek, P.P.", year: "2005", title: "What Things Do", pub: "Penn State", cat: "Philosophy of Technology", prio: "LOW", desc: "Mediazione." },
    { id: "T14", subject: "Filosofia della Tecnica", author: "Hayles, N.K.", year: "1999", title: "How We Became Posthuman", pub: "Chicago UP", cat: "Philosophy of Technology", prio: "MEDIUM", desc: "Posthuman." },
    { id: "T15", subject: "Filosofia della Tecnica", author: "Kittler, F.", year: "1986", title: "Grammophon, Film, Typewriter", pub: "Brinkmann", cat: "Philosophy of Technology", prio: "LOW", desc: "Media." },

    // --- ECOLOGY (Filosofia della Tecnica) ---
    { id: "E01", subject: "Filosofia della Tecnica", author: "Guattari, F.", year: "1989", title: "Les trois écologies", pub: "Galilée", cat: "Ecological Philosophy", prio: "ESSENTIAL", desc: "Ecosofia." },
    { id: "E02", subject: "Filosofia della Tecnica", author: "Guattari, F.", year: "1992", title: "Chaosmose", pub: "Galilée", cat: "Ecological Philosophy", prio: "HIGH", desc: "Caosmosi." },
    { id: "E03", subject: "Filosofia della Tecnica", author: "Haraway, D.", year: "2016", title: "Staying with the Trouble", pub: "Duke UP", cat: "Ecological Philosophy", prio: "HIGH", desc: "Chthulucene." },
    { id: "E04", subject: "Filosofia della Tecnica", author: "Bennett, J.", year: "2010", title: "Vibrant Matter", pub: "Duke UP", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Materia." },
    { id: "E05", subject: "Filosofia della Tecnica", author: "Morton, T.", year: "2010", title: "The Ecological Thought", pub: "Harvard UP", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Dark ecology." },
    { id: "E06", subject: "Filosofia della Tecnica", author: "Latour, B.", year: "1991", title: "Nous n'avons jamais été modernes", pub: "La Découverte", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Modernità." },
    { id: "E07", subject: "Filosofia della Tecnica", author: "Latour, B.", year: "1999", title: "Politiques de la nature", pub: "La Découverte", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Politica natura." },
    { id: "E08", subject: "Filosofia della Tecnica", author: "Descola, P.", year: "2005", title: "Par-delà nature et culture", pub: "Gallimard", cat: "Ecological Philosophy", prio: "HIGH", desc: "Natura/Cultura." },
    { id: "E09", subject: "Filosofia della Tecnica", author: "Serres, M.", year: "1990", title: "Le Contrat naturel", pub: "Bourin", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Contratto." },
    { id: "E10", subject: "Filosofia della Tecnica", author: "Stengers, I.", year: "2009", title: "Au temps des catastrophes", pub: "La Découverte", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Gaia." },
    { id: "E11", subject: "Filosofia della Tecnica", author: "Braidotti, R.", year: "2013", title: "The Posthuman", pub: "Polity", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Nomadismo." },
    { id: "E12", subject: "Filosofia della Tecnica", author: "Citton, Y.", year: "2014", title: "Pour une écologie de l'attention", pub: "Seuil", cat: "Ecological Philosophy", prio: "LOW", desc: "Attenzione." },
    { id: "E13", subject: "Filosofia della Tecnica", author: "Hui, Y.", year: "2021", title: "Art and Cosmotechnics", pub: "Minnesota UP", cat: "Ecological Philosophy", prio: "HIGH", desc: "Arte." },
    { id: "E14", subject: "Filosofia della Tecnica", author: "Tsing, A.", year: "2015", title: "The Mushroom at the End of the World", pub: "Princeton UP", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Fungo." },
    { id: "E15", subject: "Filosofia della Tecnica", author: "Viveiros de Castro, E.", year: "2009", title: "Métaphysiques cannibales", pub: "PUF", cat: "Ecological Philosophy", prio: "MEDIUM", desc: "Prospettivismo." },

    // --- BACKGROUND (Filosofia Teoretica) ---
    { id: "B01", subject: "Filosofia Teoretica", author: "Bergson, H.", year: "1907", title: "L'évolution créatrice", pub: "Alcan", cat: "Background", prio: "HIGH", desc: "Slancio vitale." },
    { id: "B02", subject: "Filosofia Teoretica", author: "Spinoza, B.", year: "1677", title: "Ethica", pub: "-", cat: "Background", prio: "HIGH", desc: "Sostanza." },
    { id: "B03", subject: "Filosofia Teoretica", author: "Canguilhem, G.", year: "1952", title: "La connaissance de la vie", pub: "Vrin", cat: "Background", prio: "HIGH", desc: "Normatività." },
    { id: "B04", subject: "Filosofia Teoretica", author: "Merleau-Ponty, M.", year: "1945", title: "Phénoménologie de la perception", pub: "Gallimard", cat: "Background", prio: "MEDIUM", desc: "Corpo." },
    { id: "B05", subject: "Filosofia Teoretica", author: "Ruyer, R.", year: "1952", title: "Néo-finalisme", pub: "PUF", cat: "Background", prio: "MEDIUM", desc: "Embriogenesi." },
    { id: "B06", subject: "Filosofia Teoretica", author: "Whitehead, A.N.", year: "1929", title: "Process and Reality", pub: "Macmillan", cat: "Background", prio: "MEDIUM", desc: "Processo." },
    { id: "B07", subject: "Filosofia Teoretica", author: "Bachelard, G.", year: "1934", title: "Le nouvel esprit scientifique", pub: "PUF", cat: "Background", prio: "MEDIUM", desc: "Epistemologia." },
    { id: "B08", subject: "Filosofia Teoretica", author: "Nietzsche, F.", year: "1887", title: "Zur Genealogie der Moral", pub: "-", cat: "Background", prio: "MEDIUM", desc: "Genealogia." },
    { id: "B09", subject: "Filosofia Teoretica", author: "Leibniz, G.W.", year: "1714", title: "Monadologie", pub: "-", cat: "Background", prio: "MEDIUM", desc: "Monade." },
    { id: "B10", subject: "Filosofia Teoretica", author: "Uexküll, J. von", year: "1934", title: "Streifzüge durch die Umwelten", pub: "-", cat: "Background", prio: "MEDIUM", desc: "Umwelt." }
];

const DEFAULT_COURSES = [
    {
        id: "theo_phil",
        name: "Filosofia Teoretica",
        prof: "Prof. Simondon",
        date: "2026-06-15",
        status: "active",
        topics: [
            {
                title: "1. La Crisi dell'Ilemorfismo",
                goal: "Dimostrare perché lo schema forma-materia è insufficiente per spiegare la realtà.",
                focus: "Leggi l'Introduzione di (S01) e il Cap. 1 di (D01). Cerca le definizioni di 'Principio di Individuazione' vs 'Operazione di Individuazione'.",
                matchTags: ["Simondon", "Individuazione"],
                texts: ["S01", "D01", "S11"]
            },
            {
                title: "2. Il Tempo come Genesi",
                goal: "Analizzare come il tempo non sia un contenitore in cui avvengono le cose, ma il risultato del processo stesso.",
                focus: "Studia la 'Cronogenesi' in (S01) e l'Immagine-Cristallo in (D13).",
                matchTags: ["Tempo", "Genesi"],
                texts: ["S01", "D13", "D07"]
            }
        ]
    },
    {
        id: "phil_tech",
        name: "Filosofia della Tecnica",
        prof: "Prof. Stiegler",
        date: "2026-07-02",
        status: "active",
        topics: [
            {
                title: "1. L'Oggetto Tecnico",
                goal: "Definire lo statuto ontologico della macchina: non utensile, ma mediatore.",
                focus: "Concentrati sulla Parte I di (S02): differenza tra Elemento, Individuo e Insieme tecnico.",
                matchTags: ["Tecnica", "Macchine"],
                texts: ["S02", "T10", "S13"]
            },
            {
                title: "2. Cosmotecniche e Diversità",
                goal: "Superare l'idea di una tecnologia universale unica per riscoprire le tecniche locali.",
                focus: "Leggi l'introduzione di (T04) di Yuk Hui. Cos'è la cosmotecnica?",
                matchTags: ["Cosmotecnica", "Hui"],
                texts: ["T03", "T04", "T06"]
            }
        ]
    }
];
