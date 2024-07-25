self.addEventListener("message", function (e) {
	var message = e.data;
	var minSegmentLength = 7;
	var maxSentenceLength = 25;

	var theKey = "";
	var outputText = "";
	segments = {};

	const words = tidyString(message).split(" ");

	//max segment length is half the size of the text up to a max of 25 words, there can't be matches for anything over half the text, and more than 25 length takes too much processing and it outside the normal length for more sentences (avg sentences are 15-20 words)
	var maxSegmentLength = words.length / 2;
	if (maxSegmentLength > maxSentenceLength) {
		maxSegmentLength = maxSentenceLength;
	}

	// For each possible segment length
	for (let segmentLength = 0; segmentLength < maxSegmentLength; segmentLength++) {
		//console.log("segment length: " + segmentlength);

		// For each possible segment position
		for (let segmentStart = 0; segmentStart < words.length - segmentLength; segmentStart++) {
			//console.log("segment start: " + segmentstart);

			const segmentEnd = segmentStart + segmentLength;

			key = words.slice(segmentStart, segmentEnd + 1).join(" ");

			console.log("new key: " + words.slice(segmentStart, segmentEnd + 1).join(" "));

			//only add if at least 6 7 characters in length
			if (key.length >= minSegmentLength) {
				addToDictionary(key);
			}
		}
	}

	//remove results that only occur once
	var result = Object.entries(segments).filter((x) => x[1] > 1);

	//remove obsolete repeates
	result = purgeSmallerDuplicates(result);

	//remove marked for deletion items
	result = result.filter((x) => x[1] > 0);
	//sort by highest occurrence to lowest
	result = result.sort((x, y) => y[1] - x[1]);
	//put a comma between the two parts, put a line between each segment
	result = result.map((x) => x.join(", ")).join("\n");

	//console.clear();
	console.log("result: " + result);
	//console.log("-" + text + "-");

	self.postMessage(result);

	self.close();
});

function purgeSmallerDuplicates(result) {
	//sort by longest to shortest key
	result = result.sort((x, y) => y[0].length - x[0].length);

	//for each result
	for (let i = 0; i < result.length; i++) {
		console.log("i: " + result[i][0]);
		//check against every smaller result
		for (let m = i + 1; m < result.length; m++) {
			console.log("m: " + result[m][0]);

			//if the smaller result hasn't already been scheduled for deletion, and it exists in the larger result, and they share the same count
			if (result[m][1] != 0 && result[i][0].includes(result[m][0]) && result[m][1] == result[i][1]) {
				console.log("scheduled for deletion: " + result[m][0]);
				result[m][1] = 0; //mark it for deletion
			}
		}
	}

	return result;
}

function addToDictionary(itemkey) {
	if (!segments[key]) {
		segments[key] = 0;
	}

	segments[key]++;
}

function tidyString(text) {
	//remove new lines and replace with a space
	text = text.replace(/(\r\n|\n|\r)/gm, " ");

	//convert all to lowercase
	text = text.toLowerCase();

	//revert accented characters to without
	//const parsed = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	//fgtext = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	//remove specified special characters (keeping ° % ± > < ≤ ≥)
	text = text.replace(/[~`!@#$^&*()+={}\[\];:\'\".,\/\\\?_]/g, "");

	//replace dash with a space - update this to not remove if for numbers (-9) etc.
	text = text.replace(/-/g, " ");

	//remove all excess spaces, tabs, new lines and replace with a single space
	text = text.replace(/\s+/g, " ");

	//trim leading and following spaces - this has to be after any replacements with spaces
	text = text.trim();

	console.log("normalized: " + text);

	return text;
}
