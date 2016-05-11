(function(){

    //variables
    var canvas, ctx;
    var resizeId;
    var star_num = 50;
    var stars = [];       //create stars
    
    
    //constants
    var RATE =  10;//100
    var BASE_SIZE = 5;
    var LIGHT = ["#ccff66","#FFD700", "#66ccff", "#ff6fcf", "#ff6666", "#72E6DA"];
    var VIBRANT = ["#7FFF00", "#0276FD", "#00FFFF", "#FF1493", "#FF0000"];    
    var TWOPI = Math.PI * 2;
    var PI180 = Math.PI / 180;
    var VELOCITY_FACTOR = 5;
    var N_CUTOFF = 6;
    var SPEED = 5;
    var DEBUG = true;
    var DEBUG2 = false;
    
    //edge requirements  - defined in configure canvas
    var build_threshhold;
    var break_threshhold;

    //when we are ready to get going
    $(document).ready(function(){
	    
	    //grab dat canvas
	    canvas = document.getElementById('canvas');
            
	    //if its working(?)
	    if ( canvas.getContext ){
		//get two-d context (as opposed to 3d)
		ctx = canvas.getContext('2d');
				
		//configure the size of the canvas + thresholds
		configureCanvas();

		//create all the stars, pseudo randomly
		createStars();
		// phase 1: draw hubs
		drawStars();
		// phase 2: draw edges
		drawEdges();
		
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
	this.Move = function(n){
	    if (DEBUG){
		console.log("move 1 - x: ", this.x);
		console.log("move 1 - y: ", this.y);
		console.log("TWOPI: ", PI180);
		console.log("calc: ", Math.round(this.vy * Math.cos(PI180 * this.x)));
	    }
	    
	    //if out of bounds, move towards inbounds - note: this may be unnesscesarily expensive
	    if ((this.x > canvas.width) && (this.vx > 0)) this.vx *= -1;
	    if ((this.y > canvas.width) && (this.vy > 0)) this.vy *= -1;
	    if ((this.x < 0) && (this.vy < 0)) this.vy *= -1;
	    if ((this.y < 0) && (this.vy < 0)) this.vy *= -1;

	    //move
	    var vf = (VELOCITY_FACTOR / (n + 2));
	    
	    //goal: stop just going in ducking circles
	    if(true){
		this.x += Math.round(vf * this.vx * Math.cos(PI180 * this.y));
		this.y += Math.round(vf * this.vy * Math.cos(PI180 * this.x));
	    } else {
		this.x += Math.round(vf * this.vx * Math.cos(PI180 * this.x));
		this.y += Math.round(vf * this.vy * Math.cos(PI180 * this.y));

	    }
	    if (DEBUG){
		console.log("move 2 - x: ", this.x);
		console.log("move 2 - y: ", this.y);
	    }
	};

	//draw
	this.Draw = function(n){
	    if (DEBUG){
		console.log("draw 1 - x: ", this.x);
		console.log("draw 1 - y: ", this.y);
	    }

	    ctx.fillStyle = paint.color(n); //getShade(this.color, ratio); 
	    ctx.globalAlpha = ((!(n>1)) ? .05  : (n < N_CUTOFF) ? (.05 * n) : (n < (N_CUTOFF * 2 > 10 ? 10 : N_CUTOFF * 2) ? .1 * n : 1));
	    ctx.beginPath();
	    //it may be considerably faster to draw triangles over circles
	    ctx.arc(Math.round(this.x), Math.round(this.y), paint.size(n), 0, TWOPI, true);
	    ctx.closePath();
	    ctx.fill();
	    if (DEBUG){
		console.log("draw 2 - x: ", this.x);
		console.log("draw 2 - y: ", this.y);
	    }
	};
    }

    
   /**
    * createStars :: (void) -> (void)
    * fills `array` with new stars at random locations
    * in the inner 1/3 box of the canvas
    */
    function createStars(){
	for ( var i = 0; i < star_num; i++)
	    {
		var x = util.random((1/3)*canvas.width, (2/3)*canvas.width);
		var y = util.random((1/3)*canvas.height, (2/3)*canvas.height);
		var vx = util.random(1, SPEED, .1);
		var vy = util.random(1, SPEED, .1);

		stars.push( new Star(x, y, vx, vy) );
	    }
    }


    //todo: fix the conditional + setTimeOut
    function loop(){
       
	if ( canvas.getContext ) 
	    setTimeout(function(){
	
		    // phase 1: draw hubs
		    drawStars();
		    // phase 2: draw edges
		    drawEdges();  
			  
                    loop();
		    
                }, RATE);
    }


    function onResizeDraw(){
	configureCanvas();
	drawStars();
    }
 
    

          
    function drawStars() {
	ctx = canvas.getContext('2d');
	//	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		//speed
		//die
		//color
		//direction
	var n; //direction, neighbor
		
		//I mean, really do we need to check both ways -> this is n^2
		//I feel like we could check half, like n^2 / 2
	var ss, zz;

	if(DEBUG2){
	    var xxx = 0;
	    var yyy = 0;
	}
	   

	for (s in stars) {
	    ss = stars[s];
	    n = 0;
	    for (z in stars) {
		zz = stars[z];
		if (util.distance(ss.GetX(), ss.GetY(), zz.GetX(), zz.GetY()) < (build_threshhold * break_threshhold)) n+=1;
	    }
	    n -= 1; //remove itself from the count
		    //speed and color should be inverses
		    //higher number of neighbors, the brighter the color
		    //lower number of neighbors, the more 'colored' the color
	    
	    //consider what we want speed to be really start off as
	  

  //definitely inverse with # of neighors
	    //	    xx = ( OFFSET / n ) * this.velocity * cos
	    
	    if (DEBUG){
		console.log("ss: ", ss);
		console.log("getx: ", ss.GetX());
		if(n == -1) { console.log("ERROR-> n:",n); return;}
		else console.log("SUCCESS-> n:", n);
	    }
	    if(DEBUG2){
		if (ss.GetX() > canvas.width || ss.GetX() < 0) xxx+=1;
		if (ss.GetY() > canvas.width || ss.GetY() < 0) yyy+=1;
	    }
	    
	    ss.Move(n);
	    ss.Draw(n);
	}
	if(DEBUG2){
	    console.log(xxx, yyy);
	    }
    }
    function drawEdges(){
	//todo
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
	
	build_threshhold = Math.round((w * (canvas.devicePixelRatio || 1)) * (1/8));
	break_threshhold = 1.3;
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
	    return Math.round((1 / n) * BASE_SIZE);
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


        /*
        ublic static Color Lighten(Color inColor, double inAmount)
{
  return Color.FromArgb(
    inColor.A,
    (int) Math.Min(255, inColor.R + 255 * inAmount),
    (int) Math.Min(255, inColor.G + 255 * inAmount),
    (int) Math.Min(255, inColor.B + 255 * inAmount) );
}
*/



		    
//from last project
                    //target = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};

                    

                      //    var colors    = [ "#ccff66", "#FFD700","#66ccff", "#ff6fcf", "#ff6666", "#F70000", "#D1FF36", "#7FFF00", "#72E6DA", "#1FE3C7", "#4DF8FF", "#0276FD", "#FF00FF"];
		    
		    /* may add interactions later */
		    /*
                    canvas.addEventListener("mousemove", function(eventInfo) {
                        seek = true;
                        target = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};
                    });

                    canvas.addEventListener("mouseup", function(eventInfo){
                        //may want to do more here ... EXPLODE
                        seek = false;
                        lagger = 150;
                        target = {x: eventInfo.offsetX || eventInfo.layerX, y:eventInfo.offsetY || eventInfo.layerY};
                    });

                    canvas.addEventListener("mouseout", function(eventInfo){
                        seek = false;
                        i = 2;
                    });

                    $(window).resize(function(){
                        clearTimeout(resizeId);
                        resizeId = setTimeout(onResizeDraw, 300);
                    });
		    */

//what other information kept is still unclear.
		// most should be context driven
		
		/*
                this.x = Math.floor((Math.random() * canvas.width) + 1);
                this.y = Math.floor((Math.random() * canvas.height) + 1);
                this.lag = Math.random() < 0.8 ? Math.floor((Math.random() * 13) + 2) : ( Math.random() * 48 + 2 );//Math.floor((Math.random() * 48) + 2);
                this.r = 5;
                this.color = getColor(i);//"#" + ("000000" + (0xFFFFFF*Math.random()).toString(16)).substr(-6); //original random color
                this.t;
                //this.color = {r: Math.floor(255 * Math.random()), g: Math.floor(255 * Math.random()), b: Math.floor(255 * Math.random())};
                this.i = 1;
                this.t = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};
		*/
    /*
                this.React = function(){
        
                    //abrupt change from resting to this
                    var ratio = (Math.sqrt( square(target.x - this.x) + square(target.y - this.y) ) / (canvas.width));
                    if (this.i == 2) {
                        this.r = ((Math.floor ( 25 * ratio ) + 1) + this.r * 3) / 4;
                    } else {


                        this.r =  Math.floor ( 25 * ratio ) + 1;
                    }

                    if (seek){

                        if (this.i == 0){
                            
                            this.x += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );
                            this.y += (Math.round(Math.random()) * 2 - 1) * (Math.floor((Math.random() * 5) + 1)) * .5 /  ( this.r );

                            if (Math.abs(target.x - this.x) > 35 || Math.abs(target.y - this.y) > 35 ){
                                this.i = 1;
                            }

                        } else {

                            this.x += (target.x - this.x) * .5 / (this.r + this.lag + lagger);
                            this.y += (target.y - this.y) * .5 / (this.r + this.lag + lagger);


                            if (Math.abs(target.x - this.x) < 3 && Math.abs(target.y - this.y) < 3){
                                this.i = 0;
                            }

                        }

                    } else {

                        var xx = (target.x - this.x);
                        var yy = (target.y - this.y);

                        if (this.i == 2 || xx > canvas.width / 4 || yy > canvas.height / 4){
                            

                            this.i = 2;

                            var ratio = (Math.sqrt( square(this.t.x - this.x) + square(this.t.y - this.y) ) / (canvas.width));
                            this.r =  Math.floor ( 25 * ratio ) + 1;

                            this.x += (this.t.x - this.x) * .5 / (this.r + this.lag);
                            this.y += (this.t.y - this.y) * .5 / (this.r + this.lag);


                        } else {

                            this.t = {x: Math.floor((Math.random() * canvas.width) + 1), y: Math.floor((Math.random() * canvas.height) + 1)};

                            this.x += 4 * xx; 
                            this.y += 4 * yy;

                        }

                    }
                    
                    

                    //closer to hide -> faster move away

                    //closer to target -> faster move in

                    //closer to target -> smaller

                    //further from target -> more colorful
                }*/
//drawStars();
//                    if (seek && lagger > 0) lagger -= 10;


