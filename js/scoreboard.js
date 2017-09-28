var SCOREBOARD = {
	score: 0,
	scoreLength: 6,
	
	init: function(size) {
		if( typeof size !== "undefined" )
			SCOREBOARD.scoreLength = size;
		SCOREBOARD.score = 0;
		SCOREBOARD.set_score( 0 );
	},
	
	add: function(addToScore, div) {
		SCOREBOARD.set_score( SCOREBOARD.score + addToScore, div);
	},
	
	set_score: function( score, div ) {
		var currentScore = "";
		var imageScore = "";
		
		SCOREBOARD.score = score;
		currentScore = SCOREBOARD.pad();

		for(i = 0; i < String(currentScore).length; i++) {
			imageScore += "<div class='clock n"+ String(currentScore)[i]+"'></div>";
		}
		
		if( typeof div === "undefined" )
			div = $(".subScoreboard"); 
		div.empty();
		div.append( imageScore );
	},
	
	pad: function() {
	    var str = '' + SCOREBOARD.score;
	    while (str.length < SCOREBOARD.scoreLength) {
	        str = '0' + str;
	    }
	    return str;
	},
	
	callback: function() {
		console.log( "SCOREBOARD.callback" );
	}
};