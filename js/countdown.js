var COUNTDOWN = {
	mustStop: false,
	
	init: function( minutes, seconds ) {
		COUNTDOWN.minutes = minutes;
		COUNTDOWN.seconds = seconds;
		COUNTDOWN.mustStop = false;
//		$( "#countdown" ).width( ( minutes > 0 ? 90 : 0 ) + 90);
//		$( "#countdown" ).css( "background-color", "black" );
	},

	start: function() {
		if( COUNTDOWN.mustStop )
			return;
		
		COUNTDOWN.running = true;
		
		var currentMinutes = "";
		var currentSeconds = "";
		var imageMinutes = "";
		var imageSeconds = "";
	
		currentMinutes = COUNTDOWN.minutes;
		currentSeconds = COUNTDOWN.seconds;
		
		var nextMinutes = COUNTDOWN.minutes;
		var nextSeconds = COUNTDOWN.seconds - 1;
		
		if( nextSeconds < 0 && nextMinutes > 0 ) {
			nextSeconds = 59;
			nextMinutes = Math.min(0, nextMinutes -1);
		}
		
		COUNTDOWN.minutes = nextMinutes;
		COUNTDOWN.seconds = nextSeconds;
	
		if( currentMinutes <= 0 && currentSeconds < 10 )
			$( "#countdown" ).css( "background-color", "red" );
		
		if(parseInt(currentMinutes) < 10 ) currentMinutes = "0" + currentMinutes;
		if(parseInt(currentSeconds) < 10 ) currentSeconds = "0" + currentSeconds;
		
		for(i = 0; i < String(currentMinutes).length; i++) {
			imageMinutes += "<div class='clock n"+ String(currentMinutes)[i]+"'></div>";
		}
		
		for(i = 0; i < String(currentSeconds).length; i++) {
			imageSeconds += "<div class='clock n"+ String(currentSeconds)[i]+"'></div>";
		}
	
		if( COUNTDOWN.minutes > 0) {
			$("#subMinutes").empty().removeClass( "hide" ).append( imageMinutes );;
			$(".clock.clock.separator").removeClass( "hide" );
		} else {
			$("#subMinutes").empty().addClass( "hide" );
			$(".clock.clock.separator").addClass( "hide" );
		}
	
		$("#subSeconds").empty().append( imageSeconds );
		
		if( nextMinutes >= 0 && nextSeconds >= 0 )
			setTimeout( "COUNTDOWN.start()", 1000 );
		else
			COUNTDOWN.callback();
	},

	add: function(seconds) {
		console.log( "Adding " + seconds + " seconds to countdown" );
		COUNTDOWN.seconds = COUNTDOWN.seconds + seconds;
	},

	setTime: function( seconds ) {
		console.log( "Setting " + seconds + " seconds to countdown" );
		COUNTDOWN.seconds = seconds;
	},
	
	stop: function() {
		COUNTDOWN.mustStop = true;
	},
	
	callback: function() {
		console.log( "COUNTDOWN.callback" );
	}
};