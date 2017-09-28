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
				  addScoreBoard();
				  WordFighter.opponentLevel = WordFighter.get_random_fighter();
				  setTimeout( function() {
					  WordFighter.start_game();
				  }, 3000 );
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
		  data: {level: WordFighter.level},
		  success: function(data){
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
			  
			  console.log( data.remaining_time + " seconds" );
			  COUNTDOWN.setTime( data.remaining_time);

			  if( rest / total < 0.5 )
				  fighter2.kick();
			  else
				  fighter2.punch();
			  fighter1.ouch();
			  WordFighter.change_score( data.score );
			  
			  for( i = data.minLength; i < data.maxLength +1; i++ ) 
			  {
				  $( "#valid" + i ).empty();
				  var obj = data.words[i];
				  var count = 0;
				  if( obj != undefined )
						  count = obj;
				  
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
			console.log(data);
			$("#modalDialog").prepend(data.modal).modal({backdrop: false, show: true});
			
			$(".replayButton").bind( "click", function() {
				if( WordFighter.mode!=="dual")
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

			SCOREBOARD.set_score( data.score );
		}
	});
	
	WordFighter.started = false;
}