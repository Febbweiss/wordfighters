 var lexik = null;
 var enigma = null;
 var score = 0;
 var time = 0;
 
 $(document).ready(function() {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "resources/french", true);
    oReq.responseType = "arraybuffer";
    
    oReq.onload = function(oEvent) {
		var arrayBuffer = oReq.response;
	
		// if you want to access the bytes:
		var byteArray = new Uint8Array(arrayBuffer);
		var gunzip = new Zlib.Gunzip(new Uint8Array(byteArray));
		var plain = gunzip.decompress();
		lexik = JSON.parse(Utf8ArrayToStr(plain));
    };
    
    oReq.send();
});

function generateEnigma(level) {
	var min = 3, max = 7;
	
	switch( level ) {
        case 'E' :
	        min = 3;
	        max = 7;
        break;
        case 'M' :
	        min = 3;
	        max = 6;
        break;
        case 'H' :
	        min = 4;
	        max = 7;
        break;
        default :
	        min = 3;
	        max = 6;
	}
	
    var mustRun = false;
	var letters;
	var allWords = {};
	do {
		letters = getRandomSet(max);
		allWords = getWords2param(letters, min);

		var wordsCount = 0;
		for (var i = min; i < max + 1; i++) {
			var words = allWords[i];
			if (words != null) {
				wordsCount += words.length;
			}
		}
		mustRun = wordsCount < (max + min) * 0.7;
	} while (mustRun);
	return {letters: letters, words: allWords, minLength: min, maxLength: max};
}

function getRandomSet( maxLetter) {
	var statistics = lexik.statistics;
	var max = 0.0;
	for (var i = 0; i < 26; i++) {
		max += statistics[i];
	}
	var letters = [];
	for (var i = 0; i < maxLetter; i++) {
		letters[i] = getRandomLetter(max, statistics);
	}
	return letters.sort();
}

function getRandomLetter(max, statistics) {
	var r = Math.random() * max;
	max = 0.0;
	for (var i = 0; i < 26; i++) {
		max += statistics[i];
		if (r < max) {
			return String.fromCharCode(i + 97);
		}
	}
	return 'z';
}

function getWords2param(letters, minimum) {
	var words = [];
	for (var i = letters.length; i > 2; i--) {
		var newWords = getWords(letters, minimum, i);
		if (newWords != null && newWords.length > 0 ) {
			for( var j = 0; j < newWords.length; j++) {
				if( words.indexOf(newWords[j]) == -1 ) {
					words.push(newWords[j]);
				}
			}
		}
	}

	var lists = {};
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		var list = lists[word.length];
		if (list === undefined) {
			list = [];
			lists[word.length] = list;
		}
		list.push(word);
	}
	for (var i = letters.length; i > 2; i--) {
		var list = lists[i];
		if (list !== undefined) {
			list = list.sort();
		}
	}
	return lists;
}

function getWords(letters, minimum, size) {
	if (size < minimum) {
		return null;
	}

	var setSize = letters.length;
	
	if (size == setSize) {
		var currentNode = lexik.nodes.nodes[letters[0]];
		if (currentNode == null) {
			return null;
		}
		for (var i = 1; i < setSize; i++) {
			currentNode = currentNode.nodes[letters[i]];
			if (currentNode == null) {
				return null;
			}
			if (i == setSize - 1) {
				return currentNode.words;
			}
		}
		return null;
	}
	
	var results = [];
	for (var i = 0; i < setSize - size; i++) {
		for (var j = 0; j < setSize; j++) {
			var words = getWords(letters.slice(0,j).concat(letters.slice(j+1)), minimum, size - i);
			if (words != null && words.length > 0) {
				results = results.concat(words);
			}
		}
	}
	return results.sort();
}

$.mockjax({
  url: "/wordFighter/levelChoice",
  status: 200
});

$.mockjax({
  url: "/wordFighter/ready",
  status: 200
});

$.mockjax({
  url: "/wordFighter/newEnigma",
  contentType: "application/json",
  response: function(data) {
  	enigma = generateEnigma(data.data.level);
  	if( time != 0 ) {
  		enigma.remaining_time = 60 - (new Date().getTime() - time) / 1000;
  		score = 0;
  	} else {
  		enigma.remaining_time = 60;
  	}
  	time = new Date().getTime();
    this.responseText = JSON.stringify(enigma)
  }
});

$.mockjax( {
	url: '/wordFighter/get_ready',
	contentType: 'text/html',
	responseText: '<div>\
        <div style="height: 261px;">\
                <div id="fighter1portrait" class="portrait"></div>\
        </div>\
		</div>\
		<div style="height: 261px;width: 96px;">\
		        <div id="versus" style="width: 96px;height: 16px;margin-left: -48px;margin-top: -8px;position: relative;left: 50%;top: 50%;">\
		               <div id="howToPlay"></div>\
		        </div>\
		</div>\
		<div>\
		        <div style="height: 261px;">\
		                <div id="fighter2portrait" class="portrait"></div>\
		        </div>\
		</div>'
})

$.mockjax( {
	url: '/wordFighter/gameOver',
	contentType: 'text/html',
	responseText: ''
});