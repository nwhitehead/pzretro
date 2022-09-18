// navigator
Object.setAttribute = function() {}
var navigator = {}
navigator.userAgent={}
navigator.userAgent.match = function(version) {
	return 'version number';
}
navigator.vendor={};
navigator.platform={};

// window
var console = {};
console.log = function(t){
	print(t);
};
var consoleCacheDump = function() {}
var window = {};
var setInterval = window.setInterval = function (updateFunc, deltaTime) {}
window.addEventListener = function(type, listener, useCapture) {};
var setTimeout = window.setTimeout = function (updateFunc, deltaTime) {}
window.console = console;
var localStorage = {};
localStorage.removeItem = function (item) {
    delete this[item];
}
localStorage.setItem = function(key, value) {
	this[key] = value;
}
localStorage.getItem = function(key) {
	return this[key] ? this[key] : null;
}
localStorage.serialize = function() {
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
	canvas.parentNode.clientWidth = native_get_width();
	canvas.parentNode.clientHeight = native_get_height();
	 
	return canvas;
}

 document.getElementById = function(id){
	if(id === 'separator') {
		return null;
	} else {
		return createCanvas(native_get_width(), native_get_height());
	}
}

document.getElementsByTagName = function(tagName) {
	var res = [];
	return res;
}

document.createElement = function(tagName, options) {
	return createCanvas(cellwidth, cellheight);
}

document.addEventListener = function(type, listener, useCapture) {};

document.body = {};
document.body.style = {};
document.body.style.backgroundColor = '#000000';

document.URL = 'PuzzleScriptGame';


// CodeMirror
var CodeMirror = {};
CodeMirror.defaults = {mode:''};
window.CodeMirror = CodeMirror;
 // MODE DEFINITION AND QUERYING

// Known modes, by name and by MIME
var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};

// Extra arguments are stored as the mode's dependencies, which is
// used by (legacy) mechanisms like loadmode.js to automatically
// load a mode. (Preferred mechanism is the require/define calls.)
CodeMirror.defineMode = function(name, mode) {
if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
if (arguments.length > 2) {
    mode.dependencies = [];
    for (var i = 2; i < arguments.length; ++i) mode.dependencies.push(arguments[i]);
}
modes[name] = mode;
};

CodeMirror.defineMIME = function(mime, spec) {
mimeModes[mime] = spec;
};


// STRING STREAM

// Fed to the mode parsers, provides helper functions to make
// parsers more succinct.

var StringStream = CodeMirror.StringStream = function(string, tabSize) {
this.pos = this.start = 0;
this.string = string;
this.tabSize = tabSize || 8;
this.lastColumnPos = this.lastColumnValue = 0;
this.lineStart = 0;
};

StringStream.prototype = {
eol: function() {return this.pos >= this.string.length;},
sol: function() {return this.pos == this.lineStart;},
peek: function() {return this.string.charAt(this.pos) || undefined;},
next: function() {
    if (this.pos < this.string.length)
    return this.string.charAt(this.pos++);
},
eat: function(match) {
    var ch = this.string.charAt(this.pos);
    if (typeof match == "string") var ok = ch == match;
    else var ok = ch && (match.test ? match.test(ch) : match(ch));
    if (ok) {++this.pos; return ch;}
},
eatWhile: function(match) {
    var start = this.pos;
    while (this.eat(match)){}
    return this.pos > start;
},
eatSpace: function() {
    var start = this.pos;
    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
    return this.pos > start;
},
skipToEnd: function() {this.pos = this.string.length;},
skipTo: function(ch) {
    var found = this.string.indexOf(ch, this.pos);
    if (found > -1) {this.pos = found; return true;}
},
backUp: function(n) {this.pos -= n;},
column: function() {
    if (this.lastColumnPos < this.start) {
    this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
    this.lastColumnPos = this.start;
    }
    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
},
indentation: function() {
    return countColumn(this.string, null, this.tabSize) -
    (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
},
match: function(pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
    var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
    var substr = this.string.substr(this.pos, pattern.length);
    if (cased(substr) == cased(pattern)) {
        if (consume !== false) this.pos += pattern.length;
        return true;
    }
    } else {
    var match = this.string.slice(this.pos).match(pattern);
    if (match && match.index > 0) return null;
    if (match && consume !== false) this.pos += match[0].length;
    return match;
    }
},
current: function(){return this.string.slice(this.start, this.pos);},
hideFirstChars: function(n, inner) {
    this.lineStart += n;
    try { return inner(); }
    finally { this.lineStart -= n; }
}
};
