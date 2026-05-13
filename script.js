document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("generateBtn");
    if (btn) {
        btn.addEventListener("click", generateAudio);
    }
});

async function generateAudio() {
    try {
        // 1. Recupero degli elementi HTML in modo sicuro
        const apiKeyElement = document.getElementById("apiKey");
        const promptElement = document.getElementById("prompt");
        const modelElement = document.getElementById("modelSelect"); // Ora cerca quello corretto
        const btn = document.getElementById("generateBtn");
        const statusBox = document.getElementById("status-box");
        const audioPlayer = document.getElementById("audioPlayer");

        // Se un elemento non esiste, fermati e avvisa la console prima di andare in crash
        if (!apiKeyElement || !promptElement || !modelElement) {
            throw new Error("Disallineamento HTML/JS: Impossibile trovare i campi di input nella pagina.");
        }

        const apiKey = apiKeyElement.value.trim();
        const prompt = promptElement.value.trim();
        const model = modelElement.value;

        // 2. Controlli di validazione
        if (!apiKey.startsWith("hf_")) {
            throw new Error("Devi inserire un token Hugging Face valido (inizia con hf_).");
        }

        if (!prompt) {
            throw new Error("Il campo testo è vuoto.");
        }

        // 3. Preparazione Interfaccia (Caricamento)
        btn.disabled = true;
        audioPlayer.style.display = "none";
        statusBox.style.display = "block";
        statusBox.style.color = "var(--text)";
        statusBox.innerHTML = `Richiesta in corso verso ${model}...`;
        console.log(`Inizio inferenza con modello: ${model}`);

        // 4. Chiamata API a Hugging Face
        const API_URL = `https://api-inference.huggingface.co/models/${model}`;
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "inputs": prompt })
        });

        // Gestione errore 503 (modello in caricamento)
        if (response.status === 503) {
            const data = await response.json();
            const estimatedTime = Math.round(data.estimated_time || 20);
            throw new Error(`Il modello gratuito è in standby. Attendi circa ${estimatedTime} secondi e clicca di nuovo su Genera.`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore HTTP ${response.status}: ${errorText}`);
        }

        // 5. Gestione Audio e Riproduzione
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = "block";
        audioPlayer.play();

        statusBox.innerHTML = "Audio generato con successo!";
        console.log("Generazione completata.");

    } catch (error) {
        // L'errore viene intercettato qui e mandato alla tua console personalizzata
        console.error(error.message);
        const statusBox = document.getElementById("status-box");
        if (statusBox) {
            statusBox.style.color = "var(--error)";
            statusBox.innerHTML = "<strong>Generazione Fallita:</strong> Controlla la console in basso.";
        }
    } finally {
        // Ripristina il pulsante alla fine
        const btn = document.getElementById("generateBtn");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Genera Audio";
        }
    }
}
