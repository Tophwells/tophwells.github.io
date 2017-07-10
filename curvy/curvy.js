if (!curvy)
	var curvy = {};

curvy.Point = function(xx,yy) {
	this.x = xx;
	this.y = yy;
}

curvy.Graph = function(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.canvas.graph = this; //change this once you need several graphs per canvas
	this.canvas.onclick = function(e) {this.graph.onmouseup(e);};
	this.canvas.onmousedown = function(e) {this.graph.onmousedown(e);};
	this.canvas.onmousemove = function(e) {this.graph.onmousemove(e);};
	this.canvas.onmouseleave = function(e) {this.graph.onmouseleave(e);};
	this.points = new Set();
	this.slope = 0;
	this.curve = [];
	this.fillStyle = "#808080";
	this.strokeStyle = "#000000";
	this.backStyle = "#FFFFFF";
	this.pointdragged = null;
	this.redraw();
}

curvy.Graph.prototype.renderPoint = function(p) {
	this.context.fillStyle=this.fillStyle;
	this.context.strokeStyle=this.strokeStyle;
	this.context.beginPath();
	this.context.arc(p.x,p.y,5,0,2*Math.PI);
	this.context.fill();
	this.context.stroke();
}

curvy.Graph.prototype.onmousemove = function(e) {
if (this.pointdragged)
{
	this.pointdragged.x=e.pageX-this.canvas.offsetLeft;
	this.pointdragged.y=e.pageY-this.canvas.offsetTop;
	this.redraw();
}
}

curvy.Graph.prototype.onmousedown = function(e) {
	var selected = null;
	var mouse_x = e.pageX-this.canvas.offsetLeft;
	var mouse_y = e.pageY-this.canvas.offsetTop;
	this.points.forEach(function(p) {
	if ((p.x-mouse_x)*(p.x-mouse_x) + (p.y-mouse_y)*(p.y-mouse_y) <= 100)
			selected = p;
		});
	if (e.shiftKey)
	{
		if (selected != null)
		{
			this.points.delete(selected);
		}
	}
	else
	{
		if (selected == null)
		{
			this.pointdragged = new curvy.Point(e.pageX-this.canvas.offsetLeft,e.pageY-this.canvas.offsetTop);
		}
		else
		{
			this.pointdragged = selected;
		}
		this.points.add(this.pointdragged);
	}
	this.redraw();
}

curvy.Graph.prototype.onmouseup = function(e) {
	this.pointdragged = null;
	this.redraw();
}

curvy.Graph.prototype.onmouseleave = function() {
	if (this.pointdragged)
	{
		this.points.delete(this.pointdragged);
		this.redraw();
	}
	this.pointdragged = null;
}

curvy.Graph.prototype.redraw = function() {
	this.recalculate();
	this.context.fillStyle = this.backStyle;
	this.context.fillRect(0,0,600,400);
	this.context.beginPath();
	if (this.curve[0] != undefined)
	{
		this.context.moveTo(this.curve[0].x,this.curve[0].y);
		this.curve.forEach(function(yy,xx) {this.context.lineTo(xx*5,yy);},this);
	}
	this.context.strokeStyle = this.fillStyle;
	this.context.stroke();
	this.points.forEach(this.renderPoint,this);
}

curvy.Graph.prototype.recalculate = function() {
	function clamp(a,b,c)
	{
		return (b<a)?a:((b<c)?b:c)
	}
	var p = Array.from(this.points);
	p.push(new curvy.Point(0,this.slope?0:400),new curvy.Point(600,400));
	p.sort(function(a,b){return (a.x - b.x)});
	for (var i = 1; i < p.length - 1; i++)
	{
		if (p[i].x == p[i-1].x)
		p.splice(i,1);
	}
	var m = []
	m[0] = 0;
	m[p.length - 1] = 0;
	if (this.slope)
	{
		for (var i = 1; i < p.length - 1; i++)
		{
			if (p[i].y > p[i+1].y)
			{
				p[i].y = (p[i+1].y + p[i].y)/2;
			}
			if (p[i].y < p[i-1].y)
			{
				p[i].y = p[i-1].y
			}
		}
	}
	for (var i = 1; i < p.length - 1; i++)
	{
		m[i] = ( (p[i+1].y - p[i].y)/(p[i+1].x - p[i].x) + (p[i-1].y - p[i].y)/(p[i-1].x - p[i].x) )/2;
		m[i] = clamp(-1,m[i],1);
	}
	this.curve = [];
	var i = 0;
	for (var xx=0; xx<=600; xx+=5)
	{
		while (p[i+1].x < xx)
		{
			i++;
		}
		var d = (p[i+1].x - p[i].x);
		var t = (xx - p[i].x)/d;
		this.curve[xx/5] = (1+2*t)*(1-t)*(1-t)*p[i].y + t*(1-t)*(1-t)*d*m[i] + t*t*(3-2*t)*p[i+1].y + t*t*(t-1)*d*m[i+1];
		this.curve[xx/5] = clamp(0,this.curve[xx/5],400)
	}
}