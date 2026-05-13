// Inizializza l'evento di click solo quando il documento HTML è completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById("generateBtn");
    btn.addEventListener("click", generateAudio);
});

async function generateAudio() {
    const apiKey = document.getElementById("apiKey").value.trim();
    const prompt = document.getElementById("prompt").value.trim();
    const provider = document.getElementById("provider").value;
    const btn = document.getElementById("generateBtn");
    const statusBox = document.getElementById("status-box");
    const audioPlayer = document.getElementById("audioPlayer");

    if (!prompt) {
        alert("Inserisci il testo da generare.");
        return;
    }

    // Setup UI per il caricamento
    btn.disabled = true;
    audioPlayer.style.display = "none";
    statusBox.style.display = "block";
    statusBox.style.color = "var(--text)";
    statusBox.innerHTML = `Contattando l'API di Eden AI (${provider})...`;

    try {
        // Configurazione della richiesta secondo la documentazione ufficiale di Eden AI
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                providers: provider, // Il provider scelto dal menu a tendina
                language: 'it',      // Lingua italiana
                text: prompt,
                option: 'FEMALE'     // Opzione voce (FEMALE o MALE)
            })
        };

        // Chiamata all'endpoint Text-to-Speech
        const response = await fetch('https://api.edenai.run/v2/audio/text_to_speech', options);
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Errore HTTP: ${response.status}`);
        }

        // Eden AI restituisce i risultati raggruppati per provider
        const providerResult = data[provider];

        if (providerResult && providerResult.status === "success") {
            statusBox.innerHTML = "Generazione completata con successo!";
            
            // Impostiamo l'URL dell'audio nel player
            audioPlayer.src = providerResult.audio_resource_url;
            audioPlayer.style.display = "block";
            audioPlayer.play();
        } else if (providerResult && providerResult.error) {
            throw new Error(`Errore del provider ${provider}: ${providerResult.error.message}`);
        } else {
            throw new Error("Risposta inaspettata dal server.");
        }

    } catch (error) {
        console.error(error);
        statusBox.style.color = "var(--error)";
        statusBox.innerHTML = "<strong>Errore:</strong> " + error.message;
    } finally {
        // Ripristino del bottone
        btn.disabled = false;
        btn.innerText = "Genera Audio";
    }
}
