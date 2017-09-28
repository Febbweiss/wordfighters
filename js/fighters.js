var PLAYGROUND_WIDTH = 384;
var PLAYGROUND_HEIGHT = 96;
var FIGHTER_STD_WIDTH = 82;
var FIGHTER_EXT_WIDTH = 126;
var FIGHTER_EXT_WIDTH_2 = 136;
var FIGHTER_EXT_WIDTH_3 = 95;
var FIGHTER_EXT_WIDTH_4 = 105;
var FIGHTER_EXT_WIDTH_5 = 86;
var FIGHTER1_POSX = PLAYGROUND_WIDTH / 2 - (FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH) / 2 - FIGHTER_STD_WIDTH;
var FIGHTER2_POSX = PLAYGROUND_WIDTH / 2 + (FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH) / 2;
var COUNTDOWN_WIDTH = 48;
var COUNTDOWN_POSX = (PLAYGROUND_WIDTH - COUNTDOWN_WIDTH) / 2;
var HEALTH_REFRESH_RATE = 15;
var FIGHTER_HEALTH = 60;
var LOOP_COUNT_REFRESH = 66;
var fighter1 = null;
var fighter2 = null;
var loopCount = 0;

var fighters = new Array();

$(function(){
	//Playground Sprites
	var background = new $.gameQuery.Animation({imageURL: "images/background.png", offsety: PLAYGROUND_HEIGHT * Math.floor(Math.random()*11)});
	
	$("#playground").playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true});
	
	$.playground().addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.addSprite(	"background1",
								{posx: 0, posy: 0,
								 height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH,
								 animation: background})
					.end()
					.addGroup("fighters", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.end()
					.addGroup( "hud", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
					.end();
	
	$("#hud").append("<div id='countdown'><div id='subSeconds'></div></div>");
	$("#hud").append("<div id='step_title'></div>");
	
	$.playground().registerCallback(function(){
		if( fighter1 )
			updateHealth( $("#player1_health_level"), fighter1.health / fighter1.maxHealth );
		if( fighter2 ) {
			updateHealth( $("#player2_health_level"), fighter2.health / fighter2.maxHealth );
			//$("#player2_health_level").css( "margin-left", ( 100 - (fighter2.health / fighter2.maxHealth) * 100) );
		}
		loopCount++;
		if( loopCount == LOOP_COUNT_REFRESH ) {
			loopCount = 0;
			var fighter = fighters[ "fighter1" ];
			if( fighter && fighter.isIdle() ) {
				fighter.node.width( FIGHTER_STD_WIDTH );				
				fighter.node.x( FIGHTER1_POSX );
			}
			fighter = fighters[ "fighter2" ];
			if( fighter && fighter.isIdle() ) {
				fighter.node.width( FIGHTER_STD_WIDTH );				
				fighter.node.x( FIGHTER2_POSX );
			}
		}
	}, HEALTH_REFRESH_RATE);
	
	$.playground().startGame( function() {});
	
	addFighter = function( fighter) {
		$("#fighters").addSprite("fighter1", {animation: fighter.animations["idle"], posx:FIGHTER1_POSX, posy: 15, width: FIGHTER_STD_WIDTH, height: FIGHTER_STD_WIDTH});
		fighter.node = $("#fighter1");
		fighter1 = fighter;
		fighters[ "fighter1" ] = fighter;
	};
	
	addFighter2 = function( fighter ) {
 		$("#fighters").addSprite("fighter2", {animation: fighter.animations["idle"], posx:FIGHTER2_POSX, posy: 15, width: FIGHTER_STD_WIDTH, height: FIGHTER_STD_WIDTH});
		fighter.node = $("#fighter2");
		$("#fighter2").fliph(true);
		fighter2 = fighter;
		fighters[ "fighter2" ] = fighter;
	};
	
	addScoreBoard = function() {
		$("#hud").append("<div id='scoreboard' class='scoreboard'><div class='subScoreboard'></div></div>");
	};
	
	addHealthBars = function() {
		$("#hud").append("<div id='player1_health' style='left: 10px;' class='health_bar'><div id='player1_health_level' class='health_level good'></div></div>");
		$("#hud").append("<div id='player2_health' style='left: " + (PLAYGROUND_WIDTH - 100 - 10) + "px;'class='health_bar'><div id='player2_health_level' class='health_level good reverse'></div></div>");
	};
	
	updateHealth = function( HTMLDiv, health ) {
		HTMLDiv.removeClass();
		HTMLDiv.addClass("health_level");
		if( health > 2/3) 
			HTMLDiv.addClass("good");
		else if( health > 1/3)
			HTMLDiv.addClass("middle");
		else
			HTMLDiv.addClass("bad");
		HTMLDiv.width( (health * 100) + "%" );
	};
	
	display_text = function( text, divId = "#step_title", offset = 1, changePosition = true ) {
		var message = text.toLowerCase();
		var divHTML = $(divId);
		var html = "";
		var yPos = offset * 16;
		
		for( var i = 0; i < message.length; i++ ) {
			var letter = message[i];
			var x = ((97 - message.charCodeAt(i)) * 16);
			if( letter == " " )
				html += "<div class='blank'></div>";
			else if( letter == "!" )
				html += "<div class='clock' style='background-position: -416px -" + yPos + "px'></div>";
			else
				html += "<div class='clock' style='background-position: " + x + "px -" + yPos + "px'></div>";
		}

		divHTML.empty();
		divHTML.width( (text.length * 16) + "px");
		if( changePosition ) {
			divHTML.css( "margin-left", "-" + (text.length * 8) + "px");
		}
		divHTML.append( html );
	};
	
	hide_text = function() {
		$("#step_title").empty();
	};
});

//Game objects:
function Fighter(){

	this.node = null;
	this.animations = new Array();
	this.maxHealth = FIGHTER_HEALTH; 
	this.health = FIGHTER_HEALTH; 
	this.idle_state = false;

	this.isIdle = function() {
		return this.idle_state;
	};
	this.setIdle = function( state ) {
		this.idle_state = state;
	};
	this.start = function() {
		this.node.setAnimation(this.animations["start"], 
				function(node) {
					fighters[ node.id ].idle();
				});
	};
	this.idle = function() {
		this.node.setAnimation(this.animations["idle"]);
		this.setIdle( true );
	};
	this.punch = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["punch"], 
				function(node) {
					fighters[ node.id ].idle();
				});
	};
	this.kick = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["kick"], 
				function(node) {
			fighters[ node.id ].idle();
		});
	};
	this.special = function() {};
	this.victory = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["victory"]);
	};
	this.loose = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["loose"]);
	};
	this.ouch = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["ouch"], 
				function(node) {
			fighters[ node.id ].idle();
		});
	};
	this.laught = function() {
		if( !this.isIdle() )
			return;
		this.setIdle( false );
		this.node.setAnimation(this.animations["laught"], 
				function(node) {
			fighters[ node.id ].idle();
		});
	};
};

function Ryu(){
	this.animations["start"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 8, offsety: 0, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 7, offsety: 82, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory2"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 4, offsety: 82, offsetx: 246, delta: FIGHTER_STD_WIDTH, rate: 200, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["idle"]		= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 6, offsety: 164, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL});
	this.animations["punch"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 6, offsety: 246, delta: FIGHTER_EXT_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["kick"]		= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 7, offsety: 328, delta: FIGHTER_EXT_WIDTH_2, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["ouch"]		= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 4, offsety: 410, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["laught"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 7, offsety: 492, delta: FIGHTER_EXT_WIDTH_3, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 9, offsety: 574, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose2"]	= new $.gameQuery.Animation({imageURL: "images/ryu.png", numberOfFrame: 6, offsety: 656, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE});
};
Ryu.prototype = new Fighter();
Ryu.prototype.punch = function() {
	this.node.width( FIGHTER_EXT_WIDTH );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["punch"], 
			function(node) {
				var HTMLnode = fighters[ node.id ].node;
				HTMLnode.width( FIGHTER_STD_WIDTH );
				if( HTMLnode.fliph() ) {
					HTMLnode.x(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH, true);
				}
				fighters[ node.id ].idle();
			});
}
Ryu.prototype.kick = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_2 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_2 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["kick"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x( FIGHTER_EXT_WIDTH_2 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Ryu.prototype.laught = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_3 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_3 - FIGHTER_STD_WIDTH),true);
	}
	this.node.setAnimation(this.animations["laught"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH_3 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Ryu.prototype.loose = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["loose"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["loose2"]);
	});
}
Ryu.prototype.victory = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.setAnimation(this.animations["victory"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["victory2"]);
	});
}

function Sakura(){
	this.animations["start"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 9, offsety: 334, delta: FIGHTER_EXT_WIDTH_3, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 7, offsety: 82, delta: FIGHTER_EXT_WIDTH_5, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory2"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 4, offsety: 82, offsetx: 258, delta: FIGHTER_EXT_WIDTH_5, rate: 200, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["idle"]		= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 5, offsety: 0, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL});
	this.animations["punch"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 5, offsety: 166, delta: FIGHTER_EXT_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["kick"]		= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 6, offsety: 252, delta: FIGHTER_EXT_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["ouch"]		= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 4, offsetx: 492, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
//	this.animations["laught"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 7, offsety: 492, delta: FIGHTER_EXT_WIDTH_3, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 10, offsety: 412, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE });
//	this.animations["loose2"]	= new $.gameQuery.Animation({imageURL: "images/sakura.png", numberOfFrame: 6, offsety: 656, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE});
};
Sakura.prototype = new Fighter();
Sakura.prototype.victory = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.setAnimation(this.animations["victory"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["victory2"]);
	});
}
Sakura.prototype.punch = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["punch"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Sakura.prototype.kick = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["kick"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Sakura.prototype.laught = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_3 );
	if( this.node.fliph() ) {
		this.node.x(-(FIGHTER_EXT_WIDTH_3 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["start"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnodex(FIGHTER_EXT_WIDTH_3 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Sakura.prototype.loose = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["loose"]);
}
function Akuma(){
	this.animations["start"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 11, offsety: 82, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 10, offsety: 328, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory2"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 8, offsety: 328, offsetx: 162, delta: FIGHTER_STD_WIDTH, rate: 200, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["idle"]		= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 11, offsety: 0, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL});
	this.animations["punch"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 5, offsety: 164, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["kick"]		= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 7, offsety: 246, delta: FIGHTER_EXT_WIDTH_2, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["ouch"]		= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 7, offsety: 576, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
//	this.animations["laught"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 7, offsety: 492, delta: FIGHTER_EXT_WIDTH_3, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 9, offsety: 412, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose2"]	= new $.gameQuery.Animation({imageURL: "images/akuma.png", numberOfFrame: 3, offsety: 494, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE});
};
Akuma.prototype = new Fighter();
Akuma.prototype.punch = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["punch"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Akuma.prototype.kick = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_2 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_2 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["kick"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH_2 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Akuma.prototype.victory = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.setAnimation(this.animations["victory"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["victory2"]);
	});
}
Akuma.prototype.loose = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["loose"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["loose2"]);
	});
}
Akuma.prototype.ouch = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x(-(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["ouch"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
function Felicia(){
	this.animations["start"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 10, offsety: 82, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 10, offsety: 328, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["victory2"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 5, offsety: 328, offsetx: 410, delta: FIGHTER_STD_WIDTH, rate: 200, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["idle"]		= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 8, offsety: 0, delta: FIGHTER_STD_WIDTH, rate: 200, type: $.gameQuery.ANIMATION_HORIZONTAL});
	this.animations["punch"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 6, offsety: 164, delta: FIGHTER_EXT_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["kick"]		= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 7, offsety: 246, delta: FIGHTER_EXT_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["ouch"]		= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 5, offsety: 492, delta: FIGHTER_EXT_WIDTH_4, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
//	this.animations["laught"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 7, offsety: 492, delta: FIGHTER_EXT_WIDTH_3, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	this.animations["loose"]	= new $.gameQuery.Animation({imageURL: "images/felicia.png", numberOfFrame: 6, offsety: 410, delta: FIGHTER_STD_WIDTH, rate: 150, type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_ONCE });
};
Felicia.prototype = new Fighter();
Felicia.prototype.punch = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["punch"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Felicia.prototype.kick = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH );
	if( this.node.fliph() ) {
		this.node.x(-(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["kick"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}
Felicia.prototype.victory = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.setAnimation(this.animations["victory"], 
			function(node) {
		fighters[ node.id ].node.setAnimation(fighters[ node.id ].animations["victory2"]);
	});
}
Felicia.prototype.ouch = function() {
	if( !this.isIdle() )
		return;
	this.setIdle( false );

	this.node.width( FIGHTER_EXT_WIDTH_4 );
	if( this.node.fliph() ) {
		this.node.x( -(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH), true);
	}
	this.node.setAnimation(this.animations["ouch"], 
			function(node) {
		var HTMLnode = fighters[ node.id ].node;
		HTMLnode.width( FIGHTER_STD_WIDTH );
		if( HTMLnode.fliph() ) {
			HTMLnode.x(FIGHTER_EXT_WIDTH_4 - FIGHTER_STD_WIDTH, true);
		}
		fighters[ node.id ].idle();
	});
}