var DURATION = 60;

var WordFighter = {
	id: null,
	word: "",
	started: false,
	activeKeypress: false,
	level: 'E',
	answers: null,
	letters: null,
	score: 0,
	combo: 0,
	opponentCombo: 0,
	first: true,
	opponentLevel: null,
	startDate: null,
	
	toggle_howto: function() {
		$('#howto').slideToggle();
	},
	
	change_level: function( chosenLevel ) {
		WordFighter.level = chosenLevel;
		
		switch( chosenLevel ) {
		case 'E' :
			$("#valid3header").show();
			$("#valid3column").show();
			$("#valid7header").show();
			$("#valid7column").show();
			break;
		case 'M' :
			$("#valid3header").show();
			$("#valid3column").show();
			$("#valid7header").hide();
			$("#valid7column").hide();
			break;
		case 'H' :
			$("#valid3header").hide();
			$("#valid3column").hide();
			$("#valid7header").show();
			$("#valid7column").show();
			break;
		case 'X' :
			$("#valid3header").show();
			$("#valid3column").show();
			$("#valid7header").hide();
			$("#valid7column").hide();
			break;
		}
	},
	
	notify_dual: function() {
		$.ajax({
			  url: '/wordFighter/levelChoice',
			  data: { level: WordFighter.level },
			  success: function(data){
				  $("#waitingGame").load('/wordFighter/get_ready', function() {
					  console.log( "Current opponent : " + WordFighter.opponentLevel );
					  console.log( data );
					  display_text('versus', '#howToPlay', 1, false);
					  $("#fighter1portrait").addClass( WordFighter.level );
					  $("#fighter1portrait").css( "visibility", "visible");
					  addFighter( WordFighter.get_fighter( WordFighter.level) );
					  addScoreBoard();
					  WordFighter.opponentLevel = WordFighter.get_random_fighter();
					  setTimeout( function() {
						  WordFighter.start_game();
					  }, 3000 );
					  WordFighter.set_opponent();
				  });
			  }
			});
	},
	
	get_fighter : function(level) {
		switch( level ) {
			case 'E' : 
				return new Sakura();
			case 'M' : 
				return new Ryu();
			case 'H' : 
				return new Felicia();
			case 'X' : 
				return new Akuma();
		}
	},
	
	get_random_fighter : function() {
		var levels = new Array();
		levels[ 0 ] = 'E';
		levels[ 1 ] = 'M';
		levels[ 2 ] = 'H';
		levels[ 3 ] = 'X';
		return levels[ Math.floor(Math.random() * 4) ];
	},

	set_opponent: function() {
		var fighter2Div = $("#fighter2portrait");
		if( fighter2Div != "undefined" && WordFighter.opponentLevel != null ){
			fighter2Div.addClass(WordFighter.opponentLevel);
			fighter2Div.css( "visibility", "visible");
			addFighter2( WordFighter.get_fighter( WordFighter.opponentLevel ) );
		}
	},
	
	hit_opponent: function( hit ) {
		fighter2.ouch();
		fighter2.health =  fighter2.health - hit;
	},
	
	start_game: function() {
		
		$("#waitingGame").hide();		
		$("#gamePanel").show();		
		$("#start").attr("disabled","disabled");
		$("#level").attr("disabled","disabled");
		
		fighter1.start();
		fighter2.start();
		
		display_text(game_waiting_ready);
		
		WordFighter.activeKeypress = false;
		WordFighter.clean();
		WordFighter.first = true;
		WordFighter.init_score();
		COUNTDOWN.init(0, DURATION);
		SCOREBOARD.init();
		
		setTimeout( function() {
			WordFighter.new_word();
			COUNTDOWN.callback = function() {
				$('#start').removeAttr('disabled');
				$('#level').removeAttr('disabled');
					WordFighter.game_over();
			};
		}, 3000)
	},
	
	setLetter: function( index, character ) {
		$( "#letter" + index ).removeClass();
		$( "#letter" + index ).addClass( "letter" );
		$( "#letter" + index ).addClass( character );
	},
	
	keypressedHandler: function( event ) {
		if( WordFighter.activeKeypress )
			return false;
		
		WordFighter.activeKeypress = true;
		
		if( event.which == 32 && WordFighter.level != 'X' ) { // space
			while( WordFighter.erase() );
			WordFighter.started = false;
			WordFighter.new_word();
			WordFighter.activeKeypress = false;
			return true;
		}
		
		if( event.which == 13 ) { // enter
			WordFighter.check_word();
			WordFighter.activeKeypress = false;
			return true;
		}
	
		if( event.which == 8 && !$.browser.safari) { // backspace
			if( WordFighter.word.length > 0 ) {
				WordFighter.erase();
				WordFighter.activeKeypress = false;
			}
			return false;
		}
	
		var character = String.fromCharCode(event.which);
		
		for( var index = 1; index < 8; index++ )
		{
			if( WordFighter.process( index, character, "hide" ) ) {
				$( "#typed" + (WordFighter.word.length + 1) ).show();
				$( "#typed" + (WordFighter.word.length + 1) ).addClass( character );
				WordFighter.word += character;
				WordFighter.activeKeypress = false;
				return true;
			}
		}
		
		WordFighter.activeKeypress = false;
		
		return true;
	},
	// Hack for Chrome
	prevent_backspace: function( event ) {
		if( event.which == 8 ) { // backspace
			if( WordFighter.word.length > 0 ) {
				WordFighter.erase();
				WordFighter.activeKeypress = false;
			}
			return false;
		}
	},

	clean: function() {
		for( var index = 1; index < 8; index++ ) {
			var character = WordFighter.word.charAt( index );
			$( "#typed" + WordFighter.word.length ).removeClass( character );
			$( "#letter" + index ).removeClass();
			$( "#letter" + index ).addClass( "letter" );
		} 
	},
	
	erase: function() {
		var character = WordFighter.word.charAt( WordFighter.word.length - 1);
		for( var index = 1; index < 8; index++ )
		{
			if( WordFighter.process( index, character, "show" ) ) {
				$( "#typed" + WordFighter.word.length ).hide();
				$( "#typed" + WordFighter.word.length ).removeClass( character );
				WordFighter.word = WordFighter.word.substring(0, WordFighter.word.length - 1);
				return true;
			}
		}
		
		return false;
	},
	
	process: function( index, character, visibility ) {
		if( $( "#letter" + index ).hasClass( character ) )
		{
			if( ( visibility === "hide" && $( "#letter" + index ).hasClass( "hideLetter" ) )
				|| ( visibility === "show" && $( "#letter" + index ).hasClass( "showLetter" ) ) ) {
				return false;
			}
		
			$( "#letter" + index ).addClass( visibility + "Letter");
			$( "#letter" + index ).removeClass( visibility === "show" ? "hideLetter" : "showLetter" );
			return true;
		}
		
		return false;
	},
	
	new_word: function() {
		
		if( WordFighter.started ) {
			return false;
		}
		
		WordFighter.combo = 0;
		$.ajax({
			  url: '/wordFighter/newEnigma',
			  data: {level: WordFighter.level},
			  success: function(data){
			  	console.log("Ajax : ");
			  	console.log(data);
				  WordFighter.letters = data.letters;
				  
				  for( i = 1; i < WordFighter.letters.length + 1; i++ )
				  {
					  WordFighter.setLetter( i, data.letters[ i - 1 ] )
				  }
				  
				  WordFighter.answers = data.words;

				  var rest = 0;
				  var total = 0;
				  for( var i = 3; i < 8; i++ ) {
					  total += $( "#valid" + i).length;
					  rest += $( "#valid" + i).find( ":empty" ).length;
				  }

				  if( !WordFighter.first ) {
					  if( rest == 0) {
						  COUNTDOWN.add( total * 5 );
						  WordFighter.change_score( WordFighter.score + total * 5 );
					  } else {
						  if( rest / total < 0.5 )
							  fighter2.kick();
						  else
							  fighter2.punch();
						  fighter1.ouch();
						  WordFighter.change_score( Math.max( 0, WordFighter.score -5 * rest ) );
				  	  }
				  } 
				  
				  for( i = data.minLength; i < data.maxLength +1; i++ ) 
				  {
					  $( "#valid" + i ).empty();
					  var obj = data.words[i];
					  var count = 0;
					  if( obj != undefined )
						  count = obj.length;

					  for( j = 0; j < count; j++ )
					  {
						  $( "#valid" + i ).append( "<li id=\"valid" + i + "-" + j + "\" style=\"background-color:yellow\"></li>");
					  }
				  }
				  
				  
				  WordFighter.started = true;

				  if( WordFighter.first ) {
					  WordFighter.startDate = new Date();
					  COUNTDOWN.start();
					  
					  display_text( game_start );
					  setTimeout( function() {
						  hide_text();
					  }, 1500);
					  WordFighter.first = false;
				  }

			  }
			});
	},
	
	check_word: function() {
		var lAnswers = WordFighter.answers[ WordFighter.word.length ];
		var position = -1;
		if( lAnswers )
			position = lAnswers.indexOf( WordFighter.word );
		if( position == -1 ) {
			WordFighter.combo = 0;
			WordFighter.activeKeypress = true;
			while(WordFighter.erase());
			WordFighter.activeKeypress = false;
			return false;
		}
		else {
			WordFighter.activeKeypress = true;
			if( $("#valid" + WordFighter.word.length + "-" + position).text().length == 0 ) {
				WordFighter.combo++;
				if( ( WordFighter.combo % 3 ) == 0 )
					fighter1.kick();
				else
					fighter1.punch();
				WordFighter.hit_opponent( WordFighter.word.length );
				$("#valid" + WordFighter.word.length + "-" + position).append( WordFighter.word );
				WordFighter.change_score( WordFighter.score + 10 * WordFighter.word.length );
				WordFighter.check_validated();
			}
		}
		
		while(WordFighter.erase());
		WordFighter.activeKeypress = false;
	},
	
	check_validated: function() {
		var rest = 0;
		for( var i = 3; i < 8; i++ ) {
			rest += $( "#valid" + i).find( ":empty" ).length;
		}

		if( rest == 0 ) {
			while( WordFighter.erase() );
			WordFighter.started = false;
			WordFighter.new_word();
			WordFighter.activeKeypress = false;
		}
	},
	
	game_over: function() {
		COUNTDOWN.stop();
		WordFighter.show_game_over();
		WordFighter.activeKeypress = true;
		var highscore = true;
		var win = WordFighter.score > 0;
		
		for( i = 3; i < 8; i++ ) 
		  {
			  var words = WordFighter.answers[i];
			  if( words != undefined ) 
			  {
				  for( j = 0; j < words.length; j++ )
				  {
					  var id = "#valid" + ( words[ j ].length ) + "-" + j;
					  $( id ).empty();
					  $( id ).append( words[ j ] );
				  }
			  }
		  }

		WordFighter.started = false;
	},
	
	show_game_over: function() {
		$('.button').show();
		/*
		$.ajax({
			url: "/wordFighter/gameOver",
			data: {level: WordFighter.level},
			success: function(data){
				$("#modalDialog").prepend(data).modal({backdrop: false, show: true});
				
				$(".replayButton").bind( "click", function() {
					if( WordFighter.mode!="dual")
						window.location.href = "/wordFighter/game";
					else
						window.location.href = "/wordFighter/invite/" + opponent;
				} );
			}
		});		
		*/
	},
		
	init_score: function() {
		WordFighter.score = 0;
		SCOREBOARD.init();
	},
	
	change_score: function(score) {
		WordFighter.score = score;
		SCOREBOARD.set_score( WordFighter.score );
	}
};


function drawText( divHTML, message ) {
	var html = "";
	
	for( var i = 0; i < message.length; i++ ) {
		var letter = message[i];
		var x = ((97 - message.charCodeAt(i)) * 16);
		if( letter == " " )
			html += "<div class='blank'></div>";
		else if( letter == "!" )
			html += "<div class='clock' style='background-position: -416px -16px'></div>";
		else
			html += "<div class='clock' style='background-position: " + x + "px -16px'></div>";
	}
	
	divHTML.css( "width", (message.length * 16) + "px");
	divHTML.css( "margin-left", "-" + (message.length * 8) + "px");
	divHTML.css( "margin-top", "20px");
	divHTML.css( "position", "relative");
	divHTML.css( "left", "50%");
	divHTML.css( "top", "50%");
	divHTML.append( html );
};