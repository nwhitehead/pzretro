// window
var console = {};
console.log = function(t){
	print(t);
};
var window={};
var setInterval = window.setInterval = function (updateFunc, deltaTime) {}
window.addEventListener = function(type, listener, useCapture){};
window.setInterval = setInterval;
window.console = console;
var localStorage = {};
localStorage.removeItem = function (item) {
    delete this[item];
}
localStorage.setItem = function(key,value) {
	this[key]=value;
}
localStorage.getItem = function(key) {
	return this[key] ? this[key] : null;
}
localStorage.serialize = function(){
	var data = '';
	for(var key in this){
		if(typeof this[key] !== 'function' && typeof this[key] !== 'undefined')
		{
			data += 'localStorage.' + key + '=' + this[key] + ';\n';
		}
	}

   return data;
}
window.localStorage = localStorage;

// document
var HTMLCanvasElement = {};
HTMLCanvasElement.prototype = {};

var document={};

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

function createEvent(keyCode) {
	return {keyCode: keyCode};	
}

function createContext(width, height) {
	var context = {};
	context.fillStyle="#000000";
	
	// create a new context in C++ and get it's id
	context.nativeId = native_sprite_add(width, height);
	
	context.clearRect = function(x, y, w, h){
		native_fill_rect(this.nativeId, "#000", x, y, w, h);
	};
	
	context.fillRect = function(x, y, w, h){
		native_fill_rect(this.nativeId, this.fillStyle, x, y, w, h);
	};
	
	context.drawImage = function(img, x, y){
		native_sprite_add_instance(img.context.nativeId, x, y);
	};
	return context;
}

function createCanvas(width, height){
	var canvas = {};
	canvas.width = width;
	canvas.height = height;
	canvas.context = createContext(width, height);
	canvas.getContext = function(contextType){return this.context;};
	 
	// Get display width and height from C++ engine
	canvas.parentNode = {};
	canvas.parentNode.clientWidth = getWidth();
	canvas.parentNode.clientHeight = getHeight();
	 
	return canvas;
}

 document.getElementById = function(id){
	if(id === 'separator') {
		return null;
	} else {
		return createCanvas(getWidth(), getHeight());
	}
}

document.getElementsByTagName = function(tagName){
	var res = [];
	return res;
}

document.createElement = function(tagName, options){
	return createCanvas(cellwidth, cellheight);
}

document.addEventListener = function(type, listener, useCapture){};

document.body = {};
document.body.style = {};
document.body.style.backgroundColor = '#000000';

document.URL = 'PuzzleScriptGame';


// CodeMirror
var CodeMirror = {};
CodeMirror.defaults = {mode:''};
window.CodeMirror = CodeMirror;
