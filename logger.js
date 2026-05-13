document.addEventListener('DOMContentLoaded', () => {
    const consoleOutput = document.getElementById('console-output');

    // Funzione per creare e inserire una nuova riga di log
    function appendLog(message, type) {
        if (!consoleOutput) return;
        
        const logLine = document.createElement('div');
        logLine.className = `log-line log-${type}`;
        
        // Aggiunge un timestamp per chiarezza
        const timestamp = new Date().toLocaleTimeString();
        logLine.textContent = `[${timestamp}] ${message}`;
        
        consoleOutput.appendChild(logLine);
        
        // Autoscroll verso il basso per mostrare sempre l'ultimo errore
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // 1. Intercetta console.error
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Converte gli argomenti in stringa (anche se sono oggetti)
        const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        appendLog(msg, 'error');
        // Chiama comunque la funzione originale per mantenere il comportamento nativo
        originalConsoleError.apply(console, args);
    };

    // 2. Intercetta console.log (per tracciare messaggi normali)
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        appendLog(msg, 'info');
        originalConsoleLog.apply(console, args);
    };

    // 3. Intercetta errori di sintassi o runtime globali
    window.addEventListener('error', function(event) {
        appendLog(`${event.message} (Riga: ${event.lineno}, Colonna: ${event.colno})`, 'error');
    });

    // 4. Intercetta errori asincroni (Promise non risolte, tipiche delle chiamate fetch)
    window.addEventListener('unhandledrejection', function(event) {
        appendLog(`Errore Asincrono: ${event.reason}`, 'error');
    });

    // Messaggio di inizializzazione
    console.log("Logger UI inizializzato con successo.");
});
