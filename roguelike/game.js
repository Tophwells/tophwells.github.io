var Game = {
    display: null,
 
    init: function() {
		var options = {
			width: 60,
			height: 40,
			fontSize: 14,
			forceSquareRatio:false
		}
		
		container = document.getElementById("GameContainer");
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
		
		
		
		this.display.drawText(20, 25, "%c{#00ff00}Congratulations!%c{} The game has started! But it's not doing anything yet.", 20);
    }
}