function setDefaultInputText() {
	var inputTextArea = document.getElementById("inputTextArea");

	fetch("input_default.txt")
		.then((response) => response.text())
		.then((data) => {
			inputTextArea.textContent = data;
		});
}

window.addEventListener("load", function () {
	setDefaultInputText();
});

function setIsBusy(isBusy) {
	// Get elements.
	var inputTextArea = document.getElementById("inputTextArea");
	var outputTextArea = document.getElementById("outputTextArea");
	var progressBar = document.getElementById("progressBar");

	// Freeze input when busy.
	inputTextArea.readOnly = isBusy;

	// Grey-out input+output when busy.
	inputTextArea.style.opacity = isBusy ? 0.2 : 1.0;
	outputTextArea.style.opacity = isBusy ? 0.2 : 1.0;

	// Show progress bar when busy.
	progressBar.style.opacity = isBusy ? 1.0 : 0.0;
}

function convertText(message, minSegmentLength) {
	var worker = new Worker("worker.js");
	setIsBusy(true);

	worker.addEventListener("message", function (e) {
		outputParams = JSON.parse(e.data);

		if (outputParams.done) {
			outputTextArea.value = outputParams.result;
			setIsBusy(false);
		}
	});

	var inputParams = JSON.stringify({ message, minSegmentLength });

	worker.postMessage(inputParams);

	//return results;
}

// Convert button behaviour
var convertButton = document.getElementById("convertButton");

convertButton.onclick = (e) => {
	var inputTextArea = document.getElementById("inputTextArea");
	var inputMinSegmentLength = document.getElementById("inputMinSegmentLength");
	var outputTextArea = document.getElementById("outputTextArea");
	var inputText = inputTextArea.value;
	convertText(inputTextArea.value, inputMinSegmentLength.value);
};
