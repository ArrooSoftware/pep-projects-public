function convertText(inputText) {
	var worker = new Worker("worker.js");

	var results;

	worker.addEventListener("message", function (e) {
		results = e.data;
		console.log(e.data);
		outputTextArea.value = e.data;
	});

	worker.postMessage(inputText);

	//return results;
}

// Convert button behaviour
var convertButton = document.getElementById("convertButton");

convertButton.onclick = (e) => {
	var inputTextArea = document.getElementById("inputTextArea");
	var outputTextArea = document.getElementById("outputTextArea");
	var inputText = inputTextArea.value;
	convertText(inputTextArea.value);
};
