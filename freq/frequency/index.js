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

var freezeAppearanceIfJobTakesLongerThanThisSeconds = 0.5;
var freezeOpacity = 0.2;

function freeze(args) {
	var freezeControls = args.freezeControls;
	var freezeAppearance = args.freezeAppearance;

	// Get elements.
	var inputTextArea = document.getElementById("inputTextArea");
	var outputTextArea = document.getElementById("outputTextArea");
	var progressBar = document.getElementById("progressBar");
	var optionsFieldSet = document.getElementById("optionsFieldSet");

	// Freeze input when busy.
	inputTextArea.readOnly = freezeControls;
	optionsFieldSet.disabled = freezeControls;

	// Grey-out input+output when busy.
	inputTextArea.style.opacity = freezeAppearance ? freezeOpacity : 1.0;
	outputTextArea.style.opacity = freezeAppearance ? freezeOpacity : 1.0;

	// Show progress bar when busy.
	progressBar.style.opacity = freezeAppearance ? 1.0 : 0.0;
}

function convertText(message, minSegmentLength) {
	var progressBar = document.getElementById("progressBar");
	progressBar.value = 0;
	outputTextArea.value = "";

	// Freeze the controls first, so user can't start simultaneous jobs.
	freeze({ freezeControls: true, freezeAppearance: false });

	var worker = new Worker("worker.js");
	var startDate = Date.now();

	worker.addEventListener("message", function (e) {
		outputParams = JSON.parse(e.data);

		if (outputParams.done) {
			outputTextArea.value = outputParams.result;

			// Job complete, so unfreeze everything.
			freeze({ freezeControls: false, freezeAppearance: false });
		} else {
			progressBar.value = outputParams.doneRatio;
			var elapsedDate = Date.now();
			msElapsed = elapsedDate - startDate;

			// Job in-progress, freeze as appropriate.
			freeze({ freezeControls: true, freezeAppearance: msElapsed > freezeAppearanceIfJobTakesLongerThanThisSeconds * 1000 });
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
