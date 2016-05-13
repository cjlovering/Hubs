(function(){

    //variables
    var canvas, ctx;
    var resizeId;
    //    var star_num = 40;
    var stars = [];       //create stars
    var ractive;
    
    //constants
    //var RATE =  10;//100
    var BASE_SIZE = 4;
    var LIGHT = ["#ccff66","#FFD700", "#66ccff", "#ff6fcf", "#ff6666", "#72E6DA"];
    var VIBRANT = ["#7FFF00", "#0276FD", "#00FFFF", "#FF1493", "#FF0000"];    
    var TWOPI = Math.PI * 2;
    var PI180 = Math.PI / 180;
    var N_CUTOFF = 6;
    var SPEED = 2;
    
    //edge requirements  - defined in configure canvas
    var build_threshold;
    //var break_threshold;

    //when we are ready to get going
    $(document).ready(function(){
	    
	    /** RACTIVE CONTROLS **/
	    $.get( 'Scripts/template.html' ).then( function ( template ) {
		    ractive = new Ractive({
			    el: '#template-container',

			    template: template,

			    data: {
				threshold: .15,
				star_num: 30,
				rate: 15
			    }
			});






	    //grab dat canvas
	    canvas = document.getElementById('canvas');
            
	    //if its working(?)
	    if ( canvas.getContext ){

		//get two-d context (as opposed to 3d)
		ctx = canvas.getContext('2d');
				
		//configure the size of the canvas + thresholds
		configureCanvas();

		//create all the stars, pseudo randomly
		createStars(ractive.get("star_num"));
		// phase 1: draw hubs
		drawStars();
		// phase 2: draw edges
		//drawEdges();
		
		//loops
		loop();
	    }
	});

    /**
     * Star :: num num num num -> lambda (object)
     * x -> vert location
     * y -> horz location
     * vx -> vert velocity
     * vy -> horz velocity
     */
    function Star(x, y, vx, vy) {
	//stars in random locations that are passed in
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.GetX = function(){ return this.x; };
	this.GetY = function(){ return this.y; };
	
	//move
	this.Move = function(){
	    
	    //if out of bounds, move towards inbounds - note: this may be unnesscesarily expensive
	    //the other option would be spawning anew
	    if ((this.x > canvas.width) && (this.vx > 0)) this.vx *= -1;
	    if ((this.y > canvas.width) && (this.vy > 0)) this.vy *= -1;
	    if ((this.x < 0) && (this.vy < 0)) this.vy *= -1;
	    if ((this.y < 0) && (this.vy < 0)) this.vy *= -1;
       
	    //goal: stop just going in ducking circles
	    this.x += Math.round(this.vx * Math.cos(PI180 * this.y));
	    this.y += Math.round(this.vy * Math.cos(PI180 * this.x));
	    
	};

	//draw
	this.Draw = function(n){

	    ctx.fillStyle = paint.color(n);
	    ctx.globalAlpha = (.20 + .20 * n);
	    ctx.beginPath();
	    
	    //option -> switch on n: 2*n, polygon
	    //it may be considerably faster to draw triangles over circles
	    ctx.arc(Math.round(this.x), Math.round(this.y), paint.size(n), 0, TWOPI, true);
	    ctx.closePath();
	    ctx.fill();
	};
    }

    
   /**
    * createStars :: (void) -> (void)
    * fills `array` with new stars at random locations
    * in the inner 1/3 box of the canvas
    */
    function createStars(x){
	for ( var i = 0; i < x; i++)
	    {
		var x = util.random(0,  canvas.width);
		var y = util.random(0, canvas.height);
		var vx = util.random(1, SPEED, .1);
		var vy = util.random(1, SPEED, .1);

		stars.push( new Star(x, y, vx, vy) );
	    }
    }
    
    /**
     * loop :: (void) -> (void)
     * the main 'meat' of the program
     */
    function loop(){       
	if ( canvas.getContext ) 
	    setTimeout(function(){
		    ctx = canvas.getContext('2d');
		    ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		    var l = ractive.get("star_num");
		    var ll = stars.length;

		    if (l > ll) createStars(l - ll);
		    else if (ll > l) reduceStars (ll - l);
    
		    // phase 1: move stars
		    moveStars();

		    // phase 2: draw stars & edges
		    drawStars();
		    
		    loop();
		    
                }, ractive.get("rate"));
    }


    function onResizeDraw(){
	configureCanvas();
	drawStars();
    }
 
    
    /**
     * moveStars :: (void) -> (void)
     * moves all the stars
     */
    function moveStars(){
	for (s in stars) stars[s].Move();
    }
          
    function reduceStars(x){
	for (var i = 0; i < x; i++){stars.pop();}
    }
    

    
    function drawStars() {
	
	var n;
	var ss, zz;
	for (s in stars) {
	    var oo = 0;
	    ss = stars[s];
	    n = 0;
	    for (z in stars) {
		zz = stars[z];
		var d = util.distance(ss.GetX(), ss.GetY(), zz.GetX(), zz.GetY());
		var o = (ractive.get("threshold") - d)/ractive.get("threshold");
		if (o > 0 && o != 1) { 
		    ctx.beginPath();
		    ctx.moveTo(ss.GetX(), ss.GetY());
		    ctx.lineTo(zz.GetX(), zz.GetY());
		    //		    ctx.strokeStyle = 'rgba(112, 226, 255, ' + o + ')';

		    ctx.strokeStyle = 'rgba(0, 0, 0, ' + o + ')';	
		    ctx.stroke();
		    n+=1;
		}
	    }
       
	    ss.Draw(n, 1 - (oo / n));
	}
    }
    
    /**
     *  configureCanvas :: (void) -> (void)
     *  sizes canvas to be the size of the window
     *  sizes thresholds
     */
    function configureCanvas(){
	var h = $(window).height();
	var w = $(window).width();
	
	canvas.width = w;
	canvas.height = h;
	
	ractive.set("threshold", Math.round(Math.sqrt(util.square(w) + util.square(h))*(1/9)));
	//	build_threshold = Math.round(Math.sqrt(util.square(w) + util.square(h))*(1/9)); //* (canvas.devicePixelRatio || 1)
    }

    //colors, size, and other painting helpers
    var paint = {
	
	/** 
	 * paint.color :: num -> color
	 * gets the color
	 */
	color: function(n){
	    
	    //light
	    if ( n < N_CUTOFF ) {
		return LIGHT[n]
	    //vibrant
	    } else {
		return VIBRANT[(n%VIBRANT.length)];
	    }
	},
	/**
	 * paint.radius :: num -> num
	 * computes the size of the hub/star
	 */
	size: function(n){
	    return BASE_SIZE;
	    if (n - N_CUTOFF < 1) return BASE_SIZE;
	    else return Math.round(BASE_SIZE * (n / N_CUTOFF));
	 
	}
    }

    //basic math and utility funcitons
    var util = {
	/**
	 * random :: num num num -> num
	 * generates a random number from min to max (with optional step val)
	 */
	random: function(min, max, step) {
	    step = step || 1;
	    return (Math.round(Math.random() * ((max - min) / step)) * step) + min;
	},
	/**
	 * distance :: num num num num -> num
	 * calculates the distance between the points
	 */
	distance: function(x, y, xx, yy){
	    return Math.round(Math.sqrt(this.square(xx - x) + this.square(yy - y)));
	},
	/**
	 * square :: num -> num
	 * squares the number
	 */
	square: function(i){
	    return i * i;
	}
    }
})(); 
