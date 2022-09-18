//This script has just the CodeMirror bits to make shared & exported games work, without loading the entire thing
//from https://github.com/Auroriax/PuzzleScript/commit/463e8069218dbde0901627e8dac124d2856eb394
function CodeMirror(place, options) {}

;

CodeMirror.defineMode = function (name, mode) {};

var StringStream = CodeMirror.StringStream = function (string, tabSize) {
  this.pos = this.start = 0;
  this.string = string;
  this.tabSize = tabSize || 8;
  this.lastColumnPos = this.lastColumnValue = 0;
  this.lineStart = 0;
};

StringStream.prototype = {
  eol: function eol() {
    return this.pos >= this.string.length;
  },
  sol: function sol() {
    return this.pos == this.lineStart;
  },
  peek: function peek() {
    return this.string.charAt(this.pos) || undefined;
  },
  next: function next() {
    if (this.pos < this.string.length) return this.string.charAt(this.pos++);
  },
  eat: function eat(match) {
    var ch = this.string.charAt(this.pos);
    if (typeof match == "string") var ok = ch == match;else var ok = ch && (match.test ? match.test(ch) : match(ch));

    if (ok) {
      ++this.pos;
      return ch;
    }
  },
  eatWhile: function eatWhile(match) {
    var start = this.pos;

    while (this.eat(match)) {}

    return this.pos > start;
  },
  eatSpace: function eatSpace() {
    var start = this.pos;

    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) {
      ++this.pos;
    }

    return this.pos > start;
  },
  skipToEnd: function skipToEnd() {
    this.pos = this.string.length;
  },
  skipTo: function skipTo(ch) {
    var found = this.string.indexOf(ch, this.pos);

    if (found > -1) {
      this.pos = found;
      return true;
    }
  },
  backUp: function backUp(n) {
    this.pos -= n;
  },
  column: function column() {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }

    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  },
  indentation: function indentation() {
    return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  },
  match: function match(pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      var cased = function cased(str) {
        return caseInsensitive ? str.toLowerCase() : str;
      };

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
  current: function current() {
    return this.string.slice(this.start, this.pos);
  },
  hideFirstChars: function hideFirstChars(n, inner) {
    this.lineStart += n;

    try {
      return inner();
    } finally {
      this.lineStart -= n;
    }
  }
};