let lastResults = null;

const fileInput = document.getElementById("fileInput");
const searchBtn = document.getElementById("box");
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");
const resultsContainer = document.getElementById("resultsContainer");
const resultSummary = document.getElementById("resultSummary");
const dropText = document.getElementById("Drop");

let selectedFile = null;

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        selectedFile = fileInput.files[0];
        dropText.innerText = selectedFile.name;
    }
});

thresholdSlider.addEventListener("input", () => {
    thresholdValue.innerText = parseFloat(thresholdSlider.value).toFixed(2);
    if (lastResults) {
        renderResults(lastResults);
    }
});

searchBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Please choose a photo first.");
        return;
    }

    const x = document.getElementById("boxx").value;
    const y = document.getElementById("boxy").value;
    const w = document.getElementById("boxw").value;
    const h = document.getElementById("boxh").value;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("x", x);
    formData.append("y", y);
    formData.append("w", w);
    formData.append("h", h);

    resultSummary.innerText = "Searching...";

    const response = await fetch("http://127.0.0.1:8000/search", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    lastResults = data.results;
    document.getElementById("queryIdLabel").innerText = "query_id: " + selectedFile.name.slice(0, 8) + "...";
    renderResults(lastResults);
});

function carIconSVG() {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4b5666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"/>' +
        '<circle cx="7.5" cy="17.5" r="2.5"/>' +
        '<circle cx="16.5" cy="17.5" r="2.5"/>' +
        '</svg>';
}

function renderResults(results) {
    const threshold = parseFloat(thresholdSlider.value);
    resultsContainer.innerHTML = "";

    const accepted = results.filter((r) => r.score >= threshold);

    if (accepted.length === 0) {
        resultSummary.innerText = "No candidates cleared the threshold";
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerText = "No confident match found.";
        resultsContainer.appendChild(empty);
        return;
    }

    resultSummary.innerText = accepted.length + " of " + results.length + " candidates above threshold";

    results.forEach((r, index) => {
        const isAccepted = r.score >= threshold;
        const card = document.createElement("div");
     card.className = "card" + (isAccepted ? " accepted-border" : " below-threshold");

        const badgeClass = isAccepted ? "badge badge-accepted" : "badge badge-below";
        const badgeText = isAccepted ? "accepted" : "below threshold";
        const cameraLine = r.camera ? '<div class="card-camera">camera ' + r.camera + '</div>' : "";

        card.innerHTML =
            '<div class="card-icon">' + carIconSVG() + '</div>' +
            '<div class="card-body">' +
                '<div class="card-top-row">' +
                    '<span class="card-rank">#' + (index + 1) + '</span>' +
                    '<span class="' + badgeClass + '">' + badgeText + '</span>' +
                '</div>' +
                '<div class="card-id">' + r.gallery_id + '</div>' +
                cameraLine +
                '<div class="card-bar-track"><div class="card-bar-fill" style="width:' + Math.round(r.score * 100) + '%"></div></div>' +
                '<div class="card-camera">similarity ' + r.score.toFixed(2) + '</div>' +
            '</div>';

        resultsContainer.appendChild(card);
    });
}