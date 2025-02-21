document.getElementById("pdf-upload").addEventListener("change", handleFileUpload);
document.getElementById("read-btn").addEventListener("click", readAloud);
document.getElementById("stop-btn").addEventListener("click", stopSpeech);

let extractedText = "";

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

    const utterance = new SpeechSynthesisUtterance(extractedText);
    speechSynthesis.speak(utterance);
}

function stopSpeech() {
    speechSynthesis.cancel();
}
