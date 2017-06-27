var Game = {
    display: null,
 
	w: 60,
	h: 40,
 
    init: function() {
		
		//perform canvas setup
		var options = {
			width: this.w,
			height: this.h,
			fontSize: 14,
			forceSquareRatio:true,
			fontFamily: "Helvetica"
		}
		
		var container = document.getElementById("GameContainer");
		if (!("ROT" in window))
		{
			container.innerHTML = "Error: rot.js has not been loaded.";
			return;
		}
		if (!ROT.isSupported())
		{
			container.innerHTML = "Error: Your browser does not support rot.js.";
			return;
		}
		container.innerHTML = "";
		
        this.display = new ROT.Display(options);
        container.appendChild(this.display.getContainer());
		
		//setup player
		var Player = function(x, y) {
			this._x = x;
			this._y = y;
		}
		Player.prototype.draw = function() {
			Game.display.draw(this._x, this._y, "@", "#fff");
		}
		
		Player.prototype.move = function(xDelta, yDelta) {
			if (Math.abs(xDelta) + Math.abs(yDelta) != 1) //can't move more than one tile at a time
				return;
			
			var newX = this._x + xDelta;
			var newY = this._y + yDelta;
			if (newX < 0 || newX >= Game.w || newY < 0 || newY >= Game.h) //can't move out of bounds
				return;
			if (Game.map[newX][newY]) //can't move into a wall (this implies moving *out* of a wall is fine, but that should never happen)
				return;
			this._x = newX;
			this._y = newY;
			
		}
		
		//setup map generation
		this.map = [];
		for (var x = 0; x < this.w; x++)
		{
			this.map[x] = []; 
		}
		var mapCallback = function(x, y, value) {
        this.map[x][y] = value;
		}
		this.generateMap = function() {
			var cellular = new ROT.Map.Cellular(this.w, this.h,{topology: 4, born:[3,4], survive: [2,3,4]});
			cellular.randomize(0.5);
			cellular.create();
			cellular.create();
			cellular.create();
			cellular.set(30, 20, false); //empty spot for the player to start in
			cellular.connect();
			cellular.serviceCallback(mapCallback.bind(this));
		}
		this.drawEverything = function() {
			this.drawWholeMap();
			this.player.draw();
		}
		this.drawWholeMap = function() {
			for (var x = 0; x < this.w; x++)
			{
				for (var y = 0; y < this.h; y++)
				{
					if (this.map[x][y]) //wall
					{
						this.display.draw(x, y, " ", "#000", "#fff");
					}
					else //floor
					{
						this.display.draw(x, y, ".", "#fff", "#000");
					}
				}
			}
		}
		
		
		//generate map
		this.generateMap();
		this.player = new Player(30,20);
		this.drawEverything();

		
		//update loop
		document.addEventListener("keydown", function(e) { //TODO: figure out what the best behaviour is if the user has something else selected
			var code = e.keyCode;
			if (code == ROT.VK_UP)
				Game.player.move(0,-1);
			if (code == ROT.VK_DOWN)
				Game.player.move(0,1);
			if (code == ROT.VK_LEFT)
				Game.player.move(-1,0);
			if (code == ROT.VK_RIGHT)
				Game.player.move(1,0);
			Game.drawEverything();
		});
    }
}