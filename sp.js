var game;

var BARREL_OFFSET_X = 70,
    BARREL_OFFSET_Y = 45,
    BARREL_SPACE = 10,
    BUTTON_POS = { x : 600, y : 240};
var anim = false;
var music = new Audio();
music.src = "Giran.mp3";

//var bomj = new Image();
//   bomj.src = "0089.png";


window.onload = function()
{
    game = new Game();
   
};

window.requestAnimFrame = function(){
    return (
        window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

var draw = function ()
{
  var   disp = document.getElementById("disp");
  var   ctx = disp.getContext('2d'); 

    ctx.canvas.width  = window.innerWidth; //960; 
    ctx.canvas.height = window.innerHeight;// 524;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.textAlign = "center";
    ctx.font = "80pt Comic Sans MS";
   // initAnimation ();
    game.render(ctx);
    requestAnimationFrame(draw);
}










function Game()
{
    var me = this;
    //load files, when loaded callback to run()
    Files('images.json', me.run , me);
      music.play();
      

}

Game.prototype.run = function()
{
    var me = this;

	me.barrels  = [];
    Barrel.init(Files.sym);

    var barrelWidth = Files.sym[0].width;
    for (var i = 0; i < 3; i++)
    {
        var b = new Barrel(BARREL_OFFSET_X + (barrelWidth + BARREL_SPACE)*i , BARREL_OFFSET_Y, barrelWidth, Files.bg.height - BARREL_OFFSET_Y*2, 5*(i+1), me.checkResults , me);
        me.barrels.push(b);
    }
	
	me.button = new Button(Files.btnSpin, BUTTON_POS.x, BUTTON_POS.y, me.spin, me);
    me.message = "";
	
	draw();
}

Game.prototype.render = function(ctx)
{
    var me = this;

    ctx.drawImage(Files.bg, 0, 0);
  //  ctx.drawImage(bomj, 650, 100); //650б 100




    for(var key in me.barrels)
    {
        ctx.drawImage(me.barrels[key].getFrame(), me.barrels[key].x, me.barrels[key].y);
    }

    ctx.drawImage(me.button.getFrame(), me.button.x, me.button.y);
    ctx.drawImage(Files.betLine, 80, 150);

    var textX = Math.ceil( Files.bg.width/2);
    var textY = Math.ceil( Files.bg.height/2 - 50)

    ctx.fillText(me.message,  textX, textY);
    ctx.strokeText(me.message,  textX, textY);


}

Game.prototype.spin = function()
{
    var me = this;

    me.message = "";

    for(var key in game.barrels)
    {
        me.barrels[key].startRolling();
    }
}

Game.prototype.checkResults = function()
{
    var me = this;
    var allReady = true;
    var results = [];

    for (var key in me.barrels)
    {
        allReady = allReady & me.barrels[key].postGame;
        results[Math.ceil((me.barrels[key].dh - me.barrels[key].dhforcentering)/ Barrel.tileHeight)] = 1;
    }

    if (allReady) {
        var n = 0;
        for(var key in results) n++;

        switch (n){
            case 1 : me.message = "JACKPOT!!"
                break;
            case 2 : me.message = "Almost there"
                break;
            case 3 : me.message = "Try again"
           
           // game.animation(650, 100); ///!!!!!!!!
            animation(650, 100);
          
            console.log("RRRRR");
                break;
        }
    }
    me.button.active = true;
}



function Barrel(x, y, w, h, incY, callback, context)
{
    var me = this;

    me.x = x;
    me.y = y;
    me.height = h;
    me.width = w;
    me.incY = incY; //скорость вращения барабана

    me.canvas = document.createElement('canvas');
    me.ctx = this.canvas.getContext('2d');
    me.canvas.width = this.width;
    me.canvas.height = this.height;

    me.callback = callback;
    me.callbackContext = context;

    me.isRolling = false;
    me.dhforcentering = Math.ceil(me.height/Barrel.tileHeight) % 2 == 0 ?  Math.ceil((me.height % Barrel.tileHeight)/2) : Math.ceil((Barrel.tileHeight)) ;
    me.dh = me.dhforcentering;
    me.finalRoll = false;

    me.postGame = false;
}

//Static part
Barrel.init = function(a_sym)
{
    Barrel.tiles = [];
    Barrel.sprite = document.createElement('canvas');
    var ctx = Barrel.sprite.getContext('2d');
    Barrel.tileHeight = a_sym[0].height;
    Barrel.sprite.height = Barrel.tileHeight*a_sym.length;
    Barrel.lineHeight = 0;

    for(var key in a_sym)
    {
        ctx.drawImage(a_sym[key], 0, Barrel.lineHeight);
        Barrel.tiles.push (
            {
                "n"     : key*1.0 + 1,
                "start" : Barrel.lineHeight,
                "end"   : Barrel.lineHeight + a_sym[key].height
            } );
        Barrel.lineHeight += a_sym[key].height;
    }
}

Barrel.prototype.getFrame = function()
{   
    this.roll();
    this.ctx.clearRect(0,0, this.width, this.height);
    this.ctx.drawImage(Barrel.sprite, 0, this.dh - Barrel.lineHeight);
    if (this.dh < this.height) {
        this.ctx.drawImage(Barrel.sprite, 0, this.dh);
    }
    return this.canvas;
}

Barrel.prototype.roll = function()
{
    var me = this;

    me.dh = !me.isRolling && !me.finalRoll ? me.dh : (me.dh + me.incY)  % Barrel.lineHeight;
    me.finalRoll = (me.finalRoll && !(Math.abs((this.dh % Barrel.tileHeight) - me.dhforcentering) < me.incY + 1))

}
    
Barrel.prototype.startRolling = function()
{
    var me = this;

    me.isRolling = true;
    me.finalRoll = false;
    me.postGame = false;

    //Run stop rollin at random time
    setTimeout(function()
        {
            me.stopRolling();
        },

        2000 + Math.ceil(Math.random()*500));
}

Barrel.prototype.stopRolling = function()
{
    var me = this;
    me.finalRoll = true;
    me.isRolling = false;
    me.postGame = true;
    me.callback.call(me.callbackContext);

}

function Button(sprites, x, y, pressCallback, context)
{
    var me = this;

    me.activeSprite = sprites["active"];
    me.disabledSprite = sprites["disabled"];
    me.x = x;
    me.y = y;

    me.pressCallback = pressCallback;
    me.callbackContext = context;

    me.active = true;

    document.addEventListener("click", function (e) {
        me.press(e, me)
    });
}

Button.prototype.getFrame = function()
{
    return (this.active ? this.activeSprite : this.disabledSprite);
}

Button.prototype.press = function(e, context)
{
    var me = context;
    if (!me.active) return;




var xPosition = e.clientX ;
var yPosition = e.clientY ;
  console.log(xPosition);
    
  /*  var xPosition = e.pageX;//e.clientX;
    var yPosition = e.pageY;//e.clientY;

e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;

    */



    if (xPosition > me.x && xPosition < me.x + me.activeSprite.width
        && yPosition > me.y && yPosition < me.y + me.activeSprite.height)
    {
        me.pressCallback.call(me.callbackContext);
        me.active = false;
    }

}

function Files(filepath, callback, context)
{
    // Static variables
    Files.callback = callback;
    Files.callbackContext = context;
    Files.bg = new Image();
    Files.bg.onload = Files.ChackAndCall;
    Files.betLine = new Image();
    Files.betLine.onload = Files.ChackAndCall;
    Files.sym = [];
    Files.btnSpin = { active : new Image(), disabled : new Image() };
    Files.btnSpin.active.onload = Files.checkAndCall;
    Files.btnSpin.disabled.onload = Files.checkAndCall;
    
    var request = new XMLHttpRequest();
    request.open('GET', filepath, true);
    request.onreadystatechange = function() {
        
        if(request.readyState == 4) {
          if(request.status == 200) {
            var fileJson = JSON.parse(request.responseText);
            Files.bg.src = fileJson.bg;
            Files.btnSpin.active.src = fileJson.btnSpin.active;
            Files.btnSpin.disabled.src = fileJson.btnSpin.disabled;
            Files.betLine.src = fileJson.betLine;
            for (var key in fileJson.sym)
            {
                Files.sym[key] = new Image();
                Files.sym[key].onload = Files.ChackAndCall;
                Files.sym[key].src = fileJson.sym[key];
            }
          }
        }
      };
      request.send(null);
}

Files.checkAndCall = function()
{
    var result = Files.bg.complete && Files.btnSpin.active.complete 
                && Files.btnSpin.disabled.complete && Files.betLine.complete;
    if  (Files.sym.length < 1) return;

    for (var key in Files.sym)
    {
        result = result && Files.sym[key].complete;
    }
    
    if (result) Files.callback.call(Files.callbackContext);
}























/*

var animation = function(xPos,yPos,x2Pos) {
    var msPerFrame = 200,
        width = 200,
        height = 360,
        frames = 6,
        currentFrame = 0, 
        lastUpdateTime = 0,
        acDelta = 0; 
        var me = this;  

   //*  var   disp = document.getElementById("disp");
 // var   ctx = disp.getContext('2d'); 

    
   var image = new Image();
   image.src = "111.png"; 
   
    var redraw = function(){ 
    
        requestAnimationFrame(redraw);  
        
    var delta = Date.now() - lastUpdateTime;
        if (acDelta > msPerFrame) {
            acDelta = 0;
     // ctx.clearRect(0,0, width, height);
   //   ctx.drawImage(Files.bg, 0, 0);
    //  ctx.drawImage(bomj, 650, 100);
    var   disp = document.getElementById("disp");
  var   ctx = disp.getContext('2d'); 
        ctx.drawImage(image, 0, height * currentFrame, width, height, xPos, yPos, width, height);
        currentFrame++; 
        console.log("this1 = " + this ); //window
        
        var context = function() {
          console.log("this2 = " + this ); // game
         // this.gameOver();
         // this.animPlay = false;
        }
        context.apply(game);
        } //end if
                if (currentFrame < frames) {
                    acDelta += delta;
                }   // end if               
                 lastUpdateTime = Date.now();  
                
 
        
    }  
    
    requestAnimationFrame(redraw);
    
}; */