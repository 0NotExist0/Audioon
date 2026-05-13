document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("generateBtn");
    if (btn) {
        btn.addEventListener("click", generateAudio);
    }
});

async function generateAudio() {
    try {
        const apiKeyElement = document.getElementById("apiKey");
        const promptElement = document.getElementById("prompt");
        const modelElement = document.getElementById("modelSelect");
        const btn = document.getElementById("generateBtn");
        const statusBox = document.getElementById("status-box");
        const audioPlayer = document.getElementById("audioPlayer");

        const apiKey = apiKeyElement.value.trim();
        const prompt = promptElement.value.trim();
        const model = modelElement.value;

        if (!apiKey.startsWith("hf_")) {
            throw new Error("Token non valido. Assicurati che inizi con 'hf_'.");
        }
        if (!prompt) {
            throw new Error("Il campo testo è vuoto.");
        }

        // Setup UI
        btn.disabled = true;
        audioPlayer.style.display = "none";
        statusBox.style.display = "block";
        statusBox.style.color = "var(--text)";
        statusBox.innerHTML = `Connessione a ${model} tramite Proxy...`;
        console.log(`Inizio inferenza con modello: ${model}`);

        // ECCO LA MAGIA: Il Proxy pubblico aggira il blocco CORS di Hugging Face
        const API_URL = `https://corsproxy.io/?https://api-inference.huggingface.co/models/${model}`;
        
        let response;

        try {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "inputs": prompt })
            });
        } catch (networkError) {
            console.error(networkError);
            throw new Error("La rete ha bloccato la richiesta. Se usi un AdBlocker o Brave Browser, disattiva gli scudi.");
        }

        if (response.status === 503) {
            const data = await response.json();
            const estimatedTime = Math.round(data.estimated_time || 20);
            throw new Error(`Il modello si sta avviando sui server. Attendi ${estimatedTime} secondi e clicca di nuovo "Genera".`);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore Server HTTP ${response.status}: ${errorText}`);
        }

        // Output Audio
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = "block";
        audioPlayer.play();

        statusBox.innerHTML = "Audio generato con successo!";
        console.log("Generazione completata.");

    } catch (error) {
        console.error(error.message);
        const statusBox = document.getElementById("status-box");
        if (statusBox) {
            statusBox.style.color = "var(--error)";
            statusBox.innerHTML = `<strong>Errore:</strong> ${error.message}`;
        }
    } finally {
        const btn = document.getElementById("generateBtn");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Genera Audio";
        }
    }
}
