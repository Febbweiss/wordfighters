WordFighter.notify_dual = function() {
	$.ajax({
		  url: '/wordFighter/levelChoice',
		  data: { level: WordFighter.level },
		  success: function(data){
			  $("#waitingGame").load('/wordFighter/ready', function() {
				  console.log( "Current opponent : " + WordFighter.opponentLevel );
				  console.log( data );
				  $("#fighter1portrait").addClass( WordFighter.level );
				  $("#fighter1portrait").css( "visibility", "visible");
				  addFighter( WordFighter.get_fighter( WordFighter.level) );
				  if( data.opponentLevel != "undefined" ) {
					  WordFighter.opponentLevel = data.opponentLevel;
				  }
				  WordFighter.set_opponent();
			  });
		  }
		});
}

WordFighter.new_word = function() {
	
	if( WordFighter.started ) {
		return false;
	}
	
	WordFighter.combo = 0;
	$.ajax({
		  url: '/wordFighter/newEnigma',
		  data: {level: WordFighter.level, mode: WordFighter.mode },
		  success: function(data){
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
			  
			  console.log( data.remaining_time + " seconds" );
			  COUNTDOWN.setTime( data.remaining_time);
			  
			  for( i = data.minLength; i < data.maxLength +1; i++ ) 
			  {
				  $( "#valid" + i ).empty();
				  var obj = data.words[i];
				  var count = 0;
				  if( obj != undefined ) {
					  if( WordFighter.mode == "offline" )
						  count = obj.length;
					  else
						  count = obj;
				  }
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
}

WordFighter.check_word = function() {
	$.ajax({
		  type: "POST", 
		  url: '/wordFighter/check',
		  data: {suggested: WordFighter.word },
		  success: function(data){
			 if( data.valid )
			 {
				WordFighter.combo++;
				if( ( WordFighter.combo % 3 ) == 0 )
					fighter1.kick();
				else
					fighter1.punch();
					
				WordFighter.activeKeypress = true;
				$("#valid" + WordFighter.word.length + "-" + data.position).append( WordFighter.word );
				
				WordFighter.change_score( data.score );
				fighter1.punch();
				WordFighter.hit_opponent(WordFighter.word.length );
				
				while(WordFighter.erase());
				WordFighter.activeKeypress = false;
				
				WordFighter.check_validated();
			 } else {
				WordFighter.combo = 0;
				WordFighter.activeKeypress = true;
				while(WordFighter.erase());
				WordFighter.activeKeypress = false;
			 }
			 
			 fighter1.health = data.fighter1;
			 fighter2.health = data.fighter2;
			 
			 if( fighter1.health == 0 || fighter2.health == 0 )
				 WordFighter.game_over();
			 
			 if( data.remaining_time )
				 COUNTDOWN.setTime( data.remaining_time );
		  }
		});
}

WordFighter.game_over = function() {
	COUNTDOWN.stop();
	WordFighter.activeKeypress = true;
	var highscore = true;
	var win = WordFighter.score > 0;
	
	$.ajax({
		url: '/wordFighter/answers',
		data: {action: "answers"},
		success: function(data){
			$("#modalDialog").prepend(data.modal).modal({backdrop: false, show: true});
			
			$(".replayButton").bind( "click", function() {
				if( WordFighter.mode!="dual")
					window.location.href = "/wordFighter/game";
				else
					window.location.href = "/wordFighter/invite/" + opponent;
			} );
			
			for( i = data.minLength; i < data.maxLength +1; i++ ) 
			  {
				  var words = data.answers[i];
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
			
			
			WordFighter.answers = null;

			fighter1.health = data.fighter1;
			fighter2.health = data.fighter2;
			console.log( fighter1.health + " vs " + fighter2.health );
			switch( data.state ) {
				case "win" :
					fighter1.victory();
					fighter2.loose();
					display_text( game_win );
					break;
				case "loose" :
					fighter1.loose();
					fighter2.victory();
					display_text( game_loose );
					break;
				default :
					display_text( game_draw );
			}
		}
	});
	
	WordFighter.started = false;
}

WordFighter.callback = function(data) {
	if( data.id != WordFighter.id && data.action != "replay" )
		return;
	
	if( data.action != undefined ) {

		if( data.fighter1 != undefined )
			fighter1.health = data.fighter1;
		if( data.fighter2 != undefined )
			fighter2.health = data.fighter2;
		switch( data.action ) {
			case "start" :
				addHealthBars();
				$("#waitingGame").show();
				WordFighter.start_game();
				break;
			case "join" :
				break;
			case "opponentLevel" :
				WordFighter.opponentLevel = data.level;
				WordFighter.set_opponent();
				break;
			case "hit" :
			case "beat" :
				WordFighter.opponentCombo++;
				if( (WordFighter.opponentCombo % 3 ) == 0 )
					fighter2.kick();
				else
					fighter2.punch();
				fighter1.ouch();
				if( data.action == "beat" )
					WordFighter.game_over();
				break;
			case "timeout" : 
				if( WordFighter.started ) {
					var endDate = new Date();
					console.log( WordFighter.startDate.toTimeString() + " - " + endDate.toTimeString() + " = Timeout in " + ( (endDate.getSeconds() - WordFighter.startDate.getSeconds())) + " / " + (endDate.getTime() - WordFighter.startDate.getTime()));
					WordFighter.game_over();
				}
				break;
			case "replay" :
				$(".replayButton").bind( "click", function() {
					window.location.href = '/wordFighter/game/' + data.id;
				})
				break;
		}
	}
}