document.getElementById("pdf-upload").addEventListener("change", handleFileUpload);
document.getElementById("read-btn").addEventListener("click", readAloud);
document.getElementById("stop-btn").addEventListener("click", stopSpeech);

let extractedText = "";
let selectedVoice = null;

function loadVoices() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById("voice-select");
    
    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    selectedVoice = voices[0]; // Default to the first available voice
}

speechSynthesis.onvoiceschanged = loadVoices;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
        try {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                extractedText += textContent.items.map(item => item.str).join(" ") + " ";
            }

            document.getElementById("text-output").textContent = extractedText || "No text found!";
        } catch (error) {
            console.error("Error reading PDF:", error);
            alert("Failed to extract text.");
        }
    };

    reader.readAsArrayBuffer(file);
}

function readAloud() {
    if (!extractedText) {
        alert("No text available to read.");
        return;
    }

    // Stop ongoing speech before starting a new one
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(extractedText);
    
    // Apply selected voice, pitch, and speed
    const voices = speechSynthesis.getVoices();
    const selectedIndex = document.getElementById("voice-select").value;
    if (voices[selectedIndex]) {
        utterance.voice = voices[selectedIndex];
    }
    
    utterance.pitch = parseFloat(document.getElementById("pitch").value);
    utterance.rate = parseFloat(document.getElementById("rate").value);

    // Start speech
    speechSynthesis.speak(utterance);
}


function stopSpeech() {
    speechSynthesis.cancel();
}
