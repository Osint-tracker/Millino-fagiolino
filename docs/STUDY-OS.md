# MIREES Study OS
## Primo utilizzo
Apri **Materie**, espandi il modulo e inserisci la data personale in **Esame e carico**. Conferma le letture pertinenti dalla bibliografia, modifica stime e avanzamento. Le attività iniziali sono proposte da 50 minuti, non una quantificazione dell’intero programma. Post-Socialist compare nell’orario. La preparazione del suo esame richiede attivazione esplicita.
In **Calendario → Disponibilità** imposta tragitto per tratta, margine, fascia di concentrazione, tetto giornaliero e lezioni. Aggiungi gli impegni personali e scegli **Proponi piano**. L’anteprima copre 28 giorni e indica attività oltre scadenza e minuti senza spazio. Accettala per creare sessioni. Puoi spostare o saltare un blocco e generare una nuova proposta.
In **Materie** avvia il timer, scegli un Pomodoro oppure registra manualmente inizio, fine, avanzamento cumulativo e difficoltà. Le ore già studiate non implicano il completamento. Una richiesta di ripasso crea una nuova attività a distanza di due giorni. In **Progressi** la percentuale pesa ogni attività per la sua stima iniziale. Una volta registrati tempo e avanzamento, il residuo si calcola dal ritmo osservato. La verifica a risposta breve confronta la risposta con la chiave impostata. Il giudizio sulla simulazione orale è un’autovalutazione separata.
## Web e Android
Usare Node 22.13 o successivo. Dalla radice eseguire:
```sh
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory dist
```
Aprire http://localhost:8000. Per l’offline web serve una prima apertura online e un contesto sicuro (localhost o HTTPS). Il comando statico serve l’app offline, mentre le funzioni in `api/` richiedono un runtime serverless compatibile. Il catalogo locale e l’inserimento manuale restano disponibili. Il progetto Android include frontend, database locale e lettore PDF.
Con JDK 21, Android SDK Platform 36 e Build Tools 36 installati, impostare `JAVA_HOME` e `ANDROID_HOME`:
```sh
npm run android:debug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
npm run android:bundle
```
Il bundle in `android/app/build/outputs/bundle/release/` richiede configurazione di firma personale prima della distribuzione. Il debug usa la chiave locale del compilatore. Eseguire prima un backup se si cambia chiave di firma. Su Android **Strumenti → Attiva promemoria del piano** richiede il permesso di notifica e programma fino a 50 sessioni future. Ripetere dopo le modifiche al calendario.
## Dati e backup
IndexedDB conserva una copia versionata del workspace. Scritture concorrenti da una scheda obsoleta vengono rifiutate. Ricaricare la scheda prima di modificare di nuovo. Il backup JSON contiene corsi, attività, calendario, timer, sessioni, appunti, verifiche e testi importati. Il file esportato è in chiaro. Conservarlo privatamente. Il ripristino valida riferimenti e intervalli prima di sostituire la copia locale. Gli archivi locali del sito originale rimangono accessibili da Strumenti nella stessa origine web. Android e browser usano archivi distinti.
La sincronizzazione opzionale usa **un file HTTPS WebDAV privato scelto dall’utente**. L’endpoint deve consentire GET e PUT condizionali, esporre un ETag forte, accettare `If-Match` e `If-None-Match`, e abilitare CORS per l’origine dell’app. Configurare server e accesso sul proprio servizio. La prima scrittura crea un file nuovo. Su un secondo dispositivo scaricare e verificare la copia con la stessa passphrase. Le successive scritture verificano la versione remota. Un conflitto richiede un backup locale e una scelta manuale. Il contenuto è cifrato con AES-GCM, chiave derivata con PBKDF2-SHA256, salt e nonce casuali. Credenziali e passphrase durano nella sessione aperta. Si può autorizzare il caricamento al ritorno della rete.
## Syllabus, PDF e AI
Le schede collegano il catalogo Unibo 2026/27. La bibliografia conserva la sezione originale quando identificabile. Solo le voci scelte diventano task. L’import online mostra una bozza modificabile. Materiali Virtuale o pagine non leggibili possono essere inseriti manualmente. Per i PDF viene estratto il testo sul dispositivo (massimo 20 MB per documento, 160.000 caratteri conservati). Le scansioni richiedono OCR esterno.
L’assistente locale propone attività dai dati effettivi. Per l’AI remota configurare nel backend `MIREES_ASSISTANT_TOKEN` e `OPENROUTER_KEY` o `OPENAI_API_KEY`. Per chiamate Android impostare `MIREES_ANDROID_ORIGIN` all’origine HTTPS effettiva dell’app, normalmente `https://localhost`. Il token personale viene inserito per la richiesta. La finestra spiega quali dati vengono inviati e il backend limita lunghezza e risposta. Usare i limiti di spesa dell’account provider.
## Verifica riproducibile
```sh
npm test
npm run build
CHROME_BIN=/percorso/al/browser node tests/browser.mjs
CHROME_BIN=/percorso/al/browser node tests/tools-browser.mjs
```
Le suite browser richiedono Python 3 e un Chromium compatibile con Playwright. Usano uno spazio dati temporaneo. La seconda usa una pagina di syllabus e un endpoint WebDAV controllati per testare conferma, cifratura e conflitto senza inviare dati personali.
