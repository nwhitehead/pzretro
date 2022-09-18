/*
credits

brunt of the work by increpare (www.increpare.com)

all open source mit license blah blah

testers:
none, yet

code used

colors used
color values for named colours from arne, mostly (and a couple from a 32-colour palette attributed to him)
http://androidarts.com/palette/16pal.htm

the editor is a slight modification of codemirro (codemirror.net), which is crazy awesome.

for post-launch credits, check out activty on github.com/increpare/PuzzleScript

*/
var MAX_ERRORS_FOR_REAL = 100;
var compiling = false;
var errorStrings = []; //also stores warning strings

var errorCount = 0; //only counts errors

function TooManyErrors() {
  consolePrint("Too many errors/warnings; aborting compilation.", true);
  throw new Error("Too many errors/warnings; aborting compilation.");
}

function logErrorCacheable(str, lineNumber, urgent) {
  if (compiling || urgent) {
    if (lineNumber === undefined) {
      return logErrorNoLine(str, urgent);
    }

    var errorString = '<a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);"><span class="errorTextLineNumber"> line ' + lineNumber.toString() + '</span></a> : ' + '<span class="errorText">' + str + '</span>';

    if (errorStrings.indexOf(errorString) >= 0 && !urgent) {//do nothing, duplicate error
    } else {
      consolePrint(errorString);
      errorStrings.push(errorString);
      errorCount++;

      if (errorStrings.length > MAX_ERRORS_FOR_REAL) {
        TooManyErrors();
      }
    }
  }
}

function logError(str, lineNumber, urgent) {
  if (compiling || urgent) {
    if (lineNumber === undefined) {
      return logErrorNoLine(str, urgent);
    }

    var errorString = '<a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);"><span class="errorTextLineNumber"> line ' + lineNumber.toString() + '</span></a> : ' + '<span class="errorText">' + str + '</span>';

    if (errorStrings.indexOf(errorString) >= 0 && !urgent) {//do nothing, duplicate error
    } else {
      consolePrint(errorString, true);
      errorStrings.push(errorString);
      errorCount++;

      if (errorStrings.length > MAX_ERRORS_FOR_REAL) {
        TooManyErrors();
      }
    }
  }
}

function logWarning(str, lineNumber, urgent) {
  if (compiling || urgent) {
    if (lineNumber === undefined) {
      return logWarningNoLine(str, urgent);
    }

    var errorString = '<a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);"><span class="errorTextLineNumber"> line ' + lineNumber.toString() + '</span></a> : ' + '<span class="warningText">' + str + '</span>';

    if (errorStrings.indexOf(errorString) >= 0 && !urgent) {//do nothing, duplicate error
    } else {
      consolePrint(errorString, true);
      errorStrings.push(errorString);

      if (errorStrings.length > MAX_ERRORS_FOR_REAL) {
        TooManyErrors();
      }
    }
  }
}

function logWarningNoLine(str, urgent) {
  if (compiling || urgent) {
    var errorString = '<span class="warningText">' + str + '</span>';

    if (errorStrings.indexOf(errorString) >= 0 && !urgent) {//do nothing, duplicate error
    } else {
      consolePrint(errorString, true);
      errorStrings.push(errorString);
      errorCount++;

      if (errorStrings.length > MAX_ERRORS_FOR_REAL) {
        TooManyErrors();
      }
    }
  }
}

function logErrorNoLine(str, urgent) {
  if (compiling || urgent) {
    var errorString = '<span class="errorText">' + str + '</span>';

    if (errorStrings.indexOf(errorString) >= 0 && !urgent) {//do nothing, duplicate error
    } else {
      consolePrint(errorString, true);
      errorStrings.push(errorString);
      errorCount++;

      if (errorStrings.length > MAX_ERRORS_FOR_REAL) {
        TooManyErrors();
      }
    }
  }
}

function blankLineHandle(state) {
  if (state.section === 'levels') {
    if (state.levels[state.levels.length - 1].length > 0) {
      state.levels.push([]);
    }
  } else if (state.section === 'objects') {
    state.objects_section = 0;
  }
} //returns null if not delcared, otherwise declaration
//note to self: I don't think that aggregates or properties know that they're aggregates or properties in and of themselves.


function wordAlreadyDeclared(state, n) {
  n = n.toLowerCase();

  if (n in state.objects) {
    return state.objects[n];
  }

  for (var i = 0; i < state.legend_aggregates.length; i++) {
    var a = state.legend_aggregates[i];

    if (a[0] === n) {
      return state.legend_aggregates[i];
    }
  }

  for (var i = 0; i < state.legend_properties.length; i++) {
    var a = state.legend_properties[i];

    if (a[0] === n) {
      return state.legend_properties[i];
    }
  }

  for (var i = 0; i < state.legend_synonyms.length; i++) {
    var a = state.legend_synonyms[i];

    if (a[0] === n) {
      return state.legend_synonyms[i];
    }
  }

  return null;
} //for IE support


if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict'; // We must check against these specific cases.

      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];

        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }

      return output;
    };
  })();
}

var codeMirrorFn = function codeMirrorFn() {
  'use strict';

  function checkNameDefined(state, candname) {
    if (state.objects[candname] !== undefined) {
      return;
    }

    for (var i = 0; i < state.legend_synonyms.length; i++) {
      var entry = state.legend_synonyms[i];

      if (entry[0] == candname) {
        return;
      }
    }

    for (var i = 0; i < state.legend_aggregates.length; i++) {
      var entry = state.legend_aggregates[i];

      if (entry[0] == candname) {
        return;
      }
    }

    for (var i = 0; i < state.legend_properties.length; i++) {
      var entry = state.legend_properties[i];

      if (entry[0] == candname) {
        return;
      }
    }

    logError("You're talking about ".concat(candname.toUpperCase(), " but it's not defined anywhere."), state.lineNumber);
  }

  function registerOriginalCaseName(state, candname, mixedCase, lineNumber) {
    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    var nameFinder = new RegExp("\\b" + escapeRegExp(candname) + "\\b", "i");
    var match = mixedCase.match(nameFinder);

    if (match != null) {
      state.original_case_names[candname] = match[0];
      state.original_line_numbers[candname] = lineNumber;
    }
  }

  var absolutedirs = ['up', 'down', 'right', 'left'];
  var relativedirs = ['^', 'v', '<', '>', 'moving', 'stationary', 'parallel', 'perpendicular', 'no'];
  var logicWords = ['all', 'no', 'on', 'some'];
  var sectionNames = ['objects', 'legend', 'sounds', 'collisionlayers', 'rules', 'winconditions', 'levels'];
  var commandwords = ["sfx0", "sfx1", "sfx2", "sfx3", "sfx4", "sfx5", "sfx6", "sfx7", "sfx8", "sfx9", "sfx10", "cancel", "checkpoint", "restart", "win", "message", "again"];
  var reg_commands = /[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*(sfx0|sfx1|sfx2|sfx3|Sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10|cancel|checkpoint|restart|win|message|again)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_name = /(?:[0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDCD0-\uDCEB\uDCF0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/; ///\w*[a-uw-zA-UW-Z0-9_]/;

  var reg_number = /[\d]+/;
  var reg_soundseed = /[0-9]+\b/;
  var reg_spriterow = /[\.0-9]{5}[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_sectionNames = /(objects|collisionlayers|legend|sounds|rules|winconditions|levels)(?!(?:[0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDCD0-\uDCEB\uDCF0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF]))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_equalsrow = /[\=]+/;
  var reg_notcommentstart = /[^\(]+/;
  var reg_match_until_commentstart_or_whitespace = /(?:(?![\t-\r \(\)\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_csv_separators = /[ \,]*/;
  var reg_soundverbs = /(move|action|create|destroy|cantmove)\b[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var soundverbs_directional = ['move', 'cantmove'];
  var reg_soundverbs_directional = /(move|cantmove)\b[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_soundverbs_nondirectional = /(action|create|destroy)\b[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_soundevents = /(undo|restart|titlescreen|startgame|cancel|endgame|startlevel|endlevel|showmessage|closemessage|sfx0|sfx1|sfx2|sfx3|sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10)\b[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_directions = /^(action|up|down|left|right|\^|v|\<|\>|moving|stationary|parallel|perpendicular|horizontal|orthogonal|vertical|no|randomdir|random)$/;
  var reg_loopmarker = /^(startloop|endloop)$/;
  var reg_ruledirectionindicators = /^(up|down|left|right|horizontal|vertical|orthogonal|late|rigid)$/;
  var reg_sounddirectionindicators = /[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*(up|down|left|right|horizontal|vertical|orthogonal)(?!(?:[0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDCD0-\uDCEB\uDCF0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF]))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/;
  var reg_winconditionquantifiers = /^(all|any|no|some)$/;
  var reg_keywords = /(checkpoint|objects|collisionlayers|legend|sounds|rules|winconditions|\.\.\.|levels|up|down|left|right|^|\||\[|\]|v|\>|\<|no|horizontal|orthogonal|vertical|any|all|no|some|moving|stationary|parallel|perpendicular|action|move|action|create|destroy|cantmove|sfx0|sfx1|sfx2|sfx3|Sfx4|sfx5|sfx6|sfx7|sfx8|sfx9|sfx10|cancel|checkpoint|restart|win|message|again|undo|restart|titlescreen|startgame|cancel|endgame|startlevel|endlevel|showmessage|closemessage)/;
  var keyword_array = ['checkpoint', 'objects', 'collisionlayers', 'legend', 'sounds', 'rules', '...', 'winconditions', 'levels', '|', '[', ']', 'up', 'down', 'left', 'right', 'late', 'rigid', '^', 'v', '\>', '\<', 'no', 'randomdir', 'random', 'horizontal', 'vertical', 'any', 'all', 'no', 'some', 'moving', 'stationary', 'parallel', 'perpendicular', 'action', 'message', "move", "action", "create", "destroy", "cantmove", "sfx0", "sfx1", "sfx2", "sfx3", "Sfx4", "sfx5", "sfx6", "sfx7", "sfx8", "sfx9", "sfx10", "cancel", "checkpoint", "restart", "win", "message", "again", "undo", "restart", "titlescreen", "startgame", "cancel", "endgame", "startlevel", "endlevel", "showmessage", "closemessage"];

  function errorFallbackMatchToken(stream) {
    var match = stream.match(reg_match_until_commentstart_or_whitespace, true);

    if (match === null) {
      //just in case, I don't know for sure if it can happen but, just in case I don't 
      //understand unicode and the above doesn't match anything, force some match progress.
      match = stream.match(reg_notcommentstart, true);
    }

    return match;
  }

  function processLegendLine(state, mixedCase) {
    var ok = true;
    var splits = state.current_line_wip_array;

    if (splits.length === 0) {
      return;
    }

    if (splits.length === 1) {
      logError('Incorrect format of legend - should be one of "A = B", "A = B or C [ or D ...]", "A = B and C [ and D ...]".', state.lineNumber);
      ok = false;
    } else if (splits.length % 2 === 0) {
      logError("Incorrect format of legend - should be one of \"A = B\", \"A = B or C [ or D ...]\", \"A = B and C [ and D ...]\", but it looks like you have a dangling \"".concat(state.current_line_wip_array[state.current_line_wip_array.length - 1].toUpperCase(), "\"?"), state.lineNumber);
      ok = false;
    } else {
      var candname = splits[0];
      var alreadyDefined = wordAlreadyDeclared(state, candname);

      if (alreadyDefined !== null) {
        logError("Name \"".concat(candname.toUpperCase(), "\" already in use (on line <a onclick=\"jumpToLine(").concat(alreadyDefined.lineNumber, ");\" href=\"javascript:void(0);\"><span class=\"errorTextLineNumber\">line ").concat(alreadyDefined.lineNumber, "</span></a>)."), state.lineNumber);
        ok = false;
      }

      if (keyword_array.indexOf(candname) >= 0) {
        logWarning('You named an object "' + candname.toUpperCase() + '", but this is a keyword. Don\'t do that!', state.lineNumber);
      }

      for (var i = 2; i < splits.length; i += 2) {
        var nname = splits[i];

        if (nname === candname) {
          logError("You can't define object " + candname.toUpperCase() + " in terms of itself!", state.lineNumber);
          ok = false;
          var idx = splits.indexOf(candname, 2);

          while (idx >= 2) {
            if (idx >= 4) {
              splits.splice(idx - 1, 2);
            } else {
              splits.splice(idx, 2);
            }

            idx = splits.indexOf(candname, 2);
          }
        }

        for (var j = 2; j < i; j += 2) {
          var oname = splits[j];

          if (oname === nname) {
            logWarning("You're repeating the object " + oname.toUpperCase() + " here multiple times on the RHS.  This makes no sense.  Don't do that.", state.lineNumber);
          }
        }
      } //for every other word, check if it's a valid name


      for (var i = 2; i < splits.length; i += 2) {
        var defname = splits[i];

        if (defname !== candname) {
          //we already have an error message for that just above.
          checkNameDefined(state, defname);
        }
      }

      if (splits.length === 3) {
        //SYNONYM
        var synonym = [splits[0], splits[2]];
        synonym.lineNumber = state.lineNumber;
        registerOriginalCaseName(state, splits[0], mixedCase, state.lineNumber);
        state.legend_synonyms.push(synonym);
      } else if (splits[3] === 'and') {
        //AGGREGATE
        var _substitutor2 = function substitutor(n) {
          n = n.toLowerCase();

          if (n in state.objects) {
            return [n];
          }

          for (var i = 0; i < state.legend_synonyms.length; i++) {
            var a = state.legend_synonyms[i];

            if (a[0] === n) {
              return _substitutor2(a[1]);
            }
          }

          for (var i = 0; i < state.legend_aggregates.length; i++) {
            var a = state.legend_aggregates[i];

            if (a[0] === n) {
              return [].concat.apply([], a.slice(1).map(_substitutor2));
            }
          }

          for (var i = 0; i < state.legend_properties.length; i++) {
            var a = state.legend_properties[i];

            if (a[0] === n) {
              logError("Cannot define an aggregate (using 'and') in terms of properties (something that uses 'or').", state.lineNumber);
              ok = false;
              return [n];
            }
          }

          return [n];
        };

        var newlegend = [splits[0]].concat(_substitutor2(splits[2])).concat(_substitutor2(splits[4]));

        for (var i = 6; i < splits.length; i += 2) {
          newlegend = newlegend.concat(_substitutor2(splits[i]));
        }

        newlegend.lineNumber = state.lineNumber;
        registerOriginalCaseName(state, newlegend[0], mixedCase, state.lineNumber);
        state.legend_aggregates.push(newlegend);
      } else if (splits[3] === 'or') {
        var malformed = true;

        var _substitutor2 = function _substitutor(n) {
          n = n.toLowerCase();

          if (n in state.objects) {
            return [n];
          }

          for (var i = 0; i < state.legend_synonyms.length; i++) {
            var a = state.legend_synonyms[i];

            if (a[0] === n) {
              return _substitutor2(a[1]);
            }
          }

          for (var i = 0; i < state.legend_aggregates.length; i++) {
            var a = state.legend_aggregates[i];

            if (a[0] === n) {
              logError("Cannot define a property (something defined in terms of 'or') in terms of aggregates (something that uses 'and').", state.lineNumber);
              malformed = false;
            }
          }

          for (var i = 0; i < state.legend_properties.length; i++) {
            var a = state.legend_properties[i];

            if (a[0] === n) {
              var result = [];

              for (var j = 1; j < a.length; j++) {
                if (a[j] === n) {//error here superfluous, also detected elsewhere (cf 'You can't define object' / #789)
                  //logError('Error, recursive definition found for '+n+'.', state.lineNumber);                                
                } else {
                  result = result.concat(_substitutor2(a[j]));
                }
              }

              return result;
            }
          }

          return [n];
        };

        for (var i = 5; i < splits.length; i += 2) {
          if (splits[i].toLowerCase() !== 'or') {
            malformed = false;
            break;
          }
        }

        if (malformed) {
          var newlegend = [splits[0]].concat(_substitutor2(splits[2])).concat(_substitutor2(splits[4]));

          for (var i = 6; i < splits.length; i += 2) {
            newlegend.push(splits[i].toLowerCase());
          }

          newlegend.lineNumber = state.lineNumber;
          registerOriginalCaseName(state, newlegend[0], mixedCase, state.lineNumber);
          state.legend_properties.push(newlegend);
        }
      } else {
        if (ok) {
          //no it's not ok but we don't know why
          logError('This legend-entry is incorrectly-formatted - it should be one of A = B, A = B or C ( or D ...), A = B and C (and D ...)', state.lineNumber);
          ok = false;
        }
      }
    }
  }

  function processSoundsLine(state) {
    if (state.current_line_wip_array.length === 0) {
      return;
    } //if last entry in array is 'ERROR', do nothing


    if (state.current_line_wip_array[state.current_line_wip_array.length - 1] === 'ERROR') {} else {
      //take the first component from each pair in the array
      var soundrow = state.current_line_wip_array; //.map(function(a){return a[0];});

      soundrow.push(state.lineNumber);
      state.sounds.push(soundrow);
    }
  } // because of all the early-outs in the token function, this is really just right now attached
  // too places where we can early out during the legend. To make it more versatile we'd have to change 
  // all the early-outs in the token function to flag-assignment for returning outside the case 
  // statement.


  function endOfLineProcessing(state, mixedCase) {
    if (state.section === 'legend') {
      processLegendLine(state, mixedCase);
    } else if (state.section === 'sounds') {
      processSoundsLine(state);
    }
  } //  var keywordRegex = new RegExp("\\b(("+cons.join(")|(")+"))$", 'i');


  var fullSpriteMatrix = ['00000', '00000', '00000', '00000', '00000'];
  return {
    copyState: function copyState(state) {
      var objectsCopy = {};

      for (var i in state.objects) {
        if (state.objects.hasOwnProperty(i)) {
          var o = state.objects[i];
          objectsCopy[i] = {
            colors: o.colors.concat([]),
            lineNumber: o.lineNumber,
            spritematrix: o.spritematrix.concat([])
          };
        }
      }

      var collisionLayersCopy = [];

      for (var i = 0; i < state.collisionLayers.length; i++) {
        collisionLayersCopy.push(state.collisionLayers[i].concat([]));
      }

      var legend_synonymsCopy = [];
      var legend_aggregatesCopy = [];
      var legend_propertiesCopy = [];
      var soundsCopy = [];
      var levelsCopy = [];
      var winConditionsCopy = [];
      var rulesCopy = [];

      for (var i = 0; i < state.legend_synonyms.length; i++) {
        legend_synonymsCopy.push(state.legend_synonyms[i].concat([]));
      }

      for (var i = 0; i < state.legend_aggregates.length; i++) {
        legend_aggregatesCopy.push(state.legend_aggregates[i].concat([]));
      }

      for (var i = 0; i < state.legend_properties.length; i++) {
        legend_propertiesCopy.push(state.legend_properties[i].concat([]));
      }

      for (var i = 0; i < state.sounds.length; i++) {
        soundsCopy.push(state.sounds[i].concat([]));
      }

      for (var i = 0; i < state.levels.length; i++) {
        levelsCopy.push(state.levels[i].concat([]));
      }

      for (var i = 0; i < state.winconditions.length; i++) {
        winConditionsCopy.push(state.winconditions[i].concat([]));
      }

      for (var i = 0; i < state.rules.length; i++) {
        rulesCopy.push(state.rules[i].concat([]));
      }

      var original_case_namesCopy = Object.assign({}, state.original_case_names);
      var original_line_numbersCopy = Object.assign({}, state.original_line_numbers);
      var nstate = {
        lineNumber: state.lineNumber,
        objects: objectsCopy,
        collisionLayers: collisionLayersCopy,
        commentLevel: state.commentLevel,
        section: state.section,
        visitedSections: state.visitedSections.concat([]),
        line_should_end: state.line_should_end,
        line_should_end_because: state.line_should_end_because,
        sol_after_comment: state.sol_after_comment,
        objects_candname: state.objects_candname,
        objects_section: state.objects_section,
        objects_spritematrix: state.objects_spritematrix.concat([]),
        tokenIndex: state.tokenIndex,
        current_line_wip_array: state.current_line_wip_array.concat([]),
        legend_synonyms: legend_synonymsCopy,
        legend_aggregates: legend_aggregatesCopy,
        legend_properties: legend_propertiesCopy,
        sounds: soundsCopy,
        rules: rulesCopy,
        names: state.names.concat([]),
        winconditions: winConditionsCopy,
        original_case_names: original_case_namesCopy,
        original_line_numbers: original_line_numbersCopy,
        abbrevNames: state.abbrevNames.concat([]),
        metadata: state.metadata.concat([]),
        metadata_lines: Object.assign({}, state.metadata_lines),
        levels: levelsCopy,
        STRIDE_OBJ: state.STRIDE_OBJ,
        STRIDE_MOV: state.STRIDE_MOV
      };
      return nstate;
    },
    blankLine: function blankLine(state) {
      if (state.section === 'levels') {
        if (state.levels[state.levels.length - 1].length > 0) {
          state.levels.push([]);
        }
      }
    },
    token: function token(stream, state) {
      var mixedCase = stream.string;
      var sol = stream.sol();

      if (sol) {
        state.current_line_wip_array = [];
        stream.string = stream.string.toLowerCase();
        state.tokenIndex = 0;
        state.line_should_end = false;
        /*   if (state.lineNumber==undefined) {
                state.lineNumber=1;
        }
        else {
            state.lineNumber++;
        }*/
      }

      if (state.sol_after_comment) {
        sol = true;
        state.sol_after_comment = false;
      }

      stream.eatWhile(/[ \t]/); ////////////////////////////////
      // COMMENT PROCESSING BEGIN
      ////////////////////////////////
      //NESTED COMMENTS

      var ch = stream.peek();

      if (ch === '(' && state.tokenIndex !== -4) {
        // tokenIndex -4 indicates message command
        stream.next();
        state.commentLevel++;
      } else if (ch === ')') {
        stream.next();

        if (state.commentLevel > 0) {
          state.commentLevel--;

          if (state.commentLevel === 0) {
            return 'comment';
          }
        } else {
          logWarning("You're trying to close a comment here, but I can't find any opening bracket to match it? [This is highly suspicious; you probably want to fix it.]", state.lineNumber);
          return 'ERROR';
        }
      }

      if (state.commentLevel > 0) {
        if (sol) {
          state.sol_after_comment = true;
        }

        while (true) {
          stream.eatWhile(/[^\(\)]+/);

          if (stream.eol()) {
            break;
          }

          ch = stream.peek();

          if (ch === '(') {
            state.commentLevel++;
          } else if (ch === ')') {
            state.commentLevel--;
          }

          stream.next();

          if (state.commentLevel === 0) {
            break;
          }
        }

        if (stream.eol()) {
          endOfLineProcessing(state, mixedCase);
        }

        return 'comment';
      }

      stream.eatWhile(/[ \t]/);

      if (sol && stream.eol()) {
        endOfLineProcessing(state, mixedCase);
        return blankLineHandle(state);
      }

      if (state.line_should_end && !stream.eol()) {
        logError('Only comments should go after ' + state.line_should_end_because + ' on a line.', state.lineNumber);
        stream.skipToEnd();
        return 'ERROR';
      } //MATCH '==="s AT START OF LINE


      if (sol && stream.match(reg_equalsrow, true)) {
        state.line_should_end = true;
        state.line_should_end_because = 'a bunch of equals signs (\'===\')';
        return 'EQUALSBIT';
      } //MATCH SECTION NAME


      var sectionNameMatches = stream.match(reg_sectionNames, true);

      if (sol && sectionNameMatches) {
        state.section = sectionNameMatches[0].trim();

        if (state.visitedSections.indexOf(state.section) >= 0) {
          logError('cannot duplicate sections (you tried to duplicate \"' + state.section.toUpperCase() + '").', state.lineNumber);
        }

        state.line_should_end = true;
        state.line_should_end_because = "a section name (\"".concat(state.section.toUpperCase(), "\")");
        state.visitedSections.push(state.section);
        var sectionIndex = sectionNames.indexOf(state.section);

        if (sectionIndex == 0) {
          state.objects_section = 0;

          if (state.visitedSections.length > 1) {
            logError('section "' + state.section.toUpperCase() + '" must be the first section', state.lineNumber);
          }
        } else if (state.visitedSections.indexOf(sectionNames[sectionIndex - 1]) == -1) {
          if (sectionIndex === -1) {
            logError('no such section as "' + state.section.toUpperCase() + '".', state.lineNumber);
          } else {
            logError('section "' + state.section.toUpperCase() + '" is out of order, must follow  "' + sectionNames[sectionIndex - 1].toUpperCase() + '" (or it could be that the section "' + sectionNames[sectionIndex - 1].toUpperCase() + "\"is just missing totally.  You have to include all section headings, even if the section itself is empty).", state.lineNumber);
          }
        }

        if (state.section === 'sounds') {
          //populate names from rules
          for (var n in state.objects) {
            if (state.objects.hasOwnProperty(n)) {
              /*                                if (state.names.indexOf(n)!==-1) {
                                              logError('Object "'+n+'" has been declared to be multiple different things',state.objects[n].lineNumber);
                                          }*/
              state.names.push(n);
            }
          } //populate names from legends


          for (var i = 0; i < state.legend_synonyms.length; i++) {
            var n = state.legend_synonyms[i][0];
            /*
            if (state.names.indexOf(n)!==-1) {
                logError('Object "'+n+'" has been declared to be multiple different things',state.legend_synonyms[i].lineNumber);
            }
            */

            state.names.push(n);
          }

          for (var i = 0; i < state.legend_aggregates.length; i++) {
            var n = state.legend_aggregates[i][0];
            /*
            if (state.names.indexOf(n)!==-1) {
                logError('Object "'+n+'" has been declared to be multiple different things',state.legend_aggregates[i].lineNumber);
            }
            */

            state.names.push(n);
          }

          for (var i = 0; i < state.legend_properties.length; i++) {
            var n = state.legend_properties[i][0];
            /*
            if (state.names.indexOf(n)!==-1) {
                logError('Object "'+n+'" has been declared to be multiple different things',state.legend_properties[i].lineNumber);
            }                           
            */

            state.names.push(n);
          }
        } else if (state.section === 'levels') {
          //populate character abbreviations
          for (var n in state.objects) {
            if (state.objects.hasOwnProperty(n) && n.length == 1) {
              state.abbrevNames.push(n);
            }
          }

          for (var i = 0; i < state.legend_synonyms.length; i++) {
            if (state.legend_synonyms[i][0].length == 1) {
              state.abbrevNames.push(state.legend_synonyms[i][0]);
            }
          }

          for (var i = 0; i < state.legend_aggregates.length; i++) {
            if (state.legend_aggregates[i][0].length == 1) {
              state.abbrevNames.push(state.legend_aggregates[i][0]);
            }
          }
        }

        return 'HEADER';
      } else {
        if (state.section === undefined) {
          logError('must start with section "OBJECTS"', state.lineNumber);
        }
      }

      if (stream.eol()) {
        endOfLineProcessing(state, mixedCase);
        return null;
      } //if color is set, try to set matrix
      //if can't set matrix, try to parse name
      //if color is not set, try to parse color


      switch (state.section) {
        case 'objects':
          {
            var tryParseName = function tryParseName() {
              //LOOK FOR NAME
              var match_name = sol ? stream.match(reg_name, true) : stream.match(/(?:(?![\t-\r \(\)\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);

              if (match_name == null) {
                stream.match(reg_notcommentstart, true);

                if (stream.pos > 0) {
                  logWarning('Unknown junk in object section (possibly: sprites have to be 5 pixels wide and 5 pixels high exactly. Or maybe: the main names for objects have to be words containing only the letters a-z0.9 - if you want to call them something like ",", do it in the legend section).', state.lineNumber);
                }

                return 'ERROR';
              } else {
                var candname = match_name[0].trim();

                if (state.objects[candname] !== undefined) {
                  logError('Object "' + candname.toUpperCase() + '" defined multiple times.', state.lineNumber);
                  return 'ERROR';
                }

                for (var i = 0; i < state.legend_synonyms.length; i++) {
                  var entry = state.legend_synonyms[i];

                  if (entry[0] == candname) {
                    logError('Name "' + candname.toUpperCase() + '" already in use.', state.lineNumber);
                  }
                }

                if (keyword_array.indexOf(candname) >= 0) {
                  logWarning('You named an object "' + candname.toUpperCase() + '", but this is a keyword. Don\'t do that!', state.lineNumber);
                }

                if (sol) {
                  state.objects_candname = candname;
                  registerOriginalCaseName(state, candname, mixedCase, state.lineNumber);
                  state.objects[state.objects_candname] = {
                    lineNumber: state.lineNumber,
                    colors: [],
                    spritematrix: []
                  };
                } else {
                  //set up alias
                  registerOriginalCaseName(state, candname, mixedCase, state.lineNumber);
                  var synonym = [candname, state.objects_candname];
                  synonym.lineNumber = state.lineNumber;
                  state.legend_synonyms.push(synonym);
                }

                state.objects_section = 1;
                return 'NAME';
              }
            };

            if (sol && state.objects_section == 2) {
              state.objects_section = 3;
            }

            if (sol && state.objects_section == 1) {
              state.objects_section = 2;
            }

            switch (state.objects_section) {
              case 0:
              case 1:
                {
                  state.objects_spritematrix = [];
                  return tryParseName();
                  break;
                }

              case 2:
                {
                  //LOOK FOR COLOR
                  state.tokenIndex = 0;
                  var match_color = stream.match(reg_color, true);

                  if (match_color == null) {
                    var str = stream.match(reg_name, true) || stream.match(reg_notcommentstart, true);
                    logError('Was looking for color for object ' + state.objects_candname.toUpperCase() + ', got "' + str + '" instead.', state.lineNumber);
                    return null;
                  } else {
                    if (state.objects[state.objects_candname].colors === undefined) {
                      state.objects[state.objects_candname].colors = [match_color[0].trim()];
                    } else {
                      state.objects[state.objects_candname].colors.push(match_color[0].trim());
                    }

                    var candcol = match_color[0].trim().toLowerCase();

                    if (candcol in colorPalettes.arnecolors) {
                      return 'COLOR COLOR-' + candcol.toUpperCase();
                    } else if (candcol === "transparent") {
                      return 'COLOR FADECOLOR';
                    } else {
                      return 'MULTICOLOR' + match_color[0];
                    }
                  }

                  break;
                }

              case 3:
                {
                  var ch = stream.eat(/[.\d]/);
                  var spritematrix = state.objects_spritematrix;

                  if (ch === undefined) {
                    if (spritematrix.length === 0) {
                      return tryParseName();
                    }

                    logError('Unknown junk in spritematrix for object ' + state.objects_candname.toUpperCase() + '.', state.lineNumber);
                    stream.match(reg_notcommentstart, true);
                    return null;
                  }

                  if (sol) {
                    spritematrix.push('');
                  }

                  var o = state.objects[state.objects_candname];
                  spritematrix[spritematrix.length - 1] += ch;

                  if (spritematrix[spritematrix.length - 1].length > 5) {
                    logWarning('Sprites must be 5 wide and 5 high.', state.lineNumber);
                    stream.match(reg_notcommentstart, true);
                    return null;
                  }

                  o.spritematrix = state.objects_spritematrix;

                  if (spritematrix.length === 5 && spritematrix[spritematrix.length - 1].length == 5) {
                    state.objects_section = 0;
                  }

                  if (ch !== '.') {
                    var n = parseInt(ch);

                    if (n >= o.colors.length) {
                      logError("Trying to access color number " + n + " from the color palette of sprite " + state.objects_candname.toUpperCase() + ", but there are only " + o.colors.length + " defined in it.", state.lineNumber);
                      return 'ERROR';
                    }

                    if (isNaN(n)) {
                      logError('Invalid character "' + ch + '" in sprite for ' + state.objects_candname.toUpperCase(), state.lineNumber);
                      return 'ERROR';
                    }

                    return 'COLOR BOLDCOLOR COLOR-' + o.colors[n].toUpperCase();
                  }

                  return 'COLOR FADECOLOR';
                }

              default:
                {
                  window.console.logError("EEK shouldn't get here.");
                }
            }

            break;
          }

        case 'legend':
          {
            var resultToken = "";
            var match_name = null;

            if (state.tokenIndex === 0) {
              match_name = stream.match(/(?:(?![\t-\r \(=\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])*([ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])*/, true);
              var new_name = match_name[0].trim();

              if (wordAlreadyDeclared(state, new_name)) {
                resultToken = 'ERROR';
              } else {
                resultToken = 'NAME';
              } //if name already declared, we have a problem                            


              state.tokenIndex++;
            } else if (state.tokenIndex === 1) {
              match_name = stream.match(/=/, true);

              if (match_name === null || match_name[0].trim() !== "=") {
                logError("In the legend, define new items using the equals symbol - declarations must look like \"A = B\", \"A = B or C [ or D ...]\", \"A = B and C [ and D ...]\".", state.lineNumber);
                stream.match(reg_notcommentstart, true);
                resultToken = 'ERROR';
                match_name = ["ERROR"]; //just to reduce the chance of crashes
              }

              stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);
              state.tokenIndex++;
              resultToken = 'ASSSIGNMENT';
            } else if (state.tokenIndex >= 3 && state.tokenIndex % 2 === 1) {
              //matches AND/OR
              match_name = stream.match(reg_name, true);

              if (match_name === null) {
                logError("Something bad's happening in the LEGEND", state.lineNumber);
                match = stream.match(reg_notcommentstart, true);
                resultToken = 'ERROR';
              } else {
                var candname = match_name[0].trim();

                if (candname === "and" || candname === "or") {
                  resultToken = 'LOGICWORD';

                  if (state.tokenIndex >= 5) {
                    if (candname !== state.current_line_wip_array[3]) {
                      logError("Hey! You can't go mixing ANDs and ORs in a single legend entry.", state.lineNumber);
                      resultToken = 'ERROR';
                    }
                  }
                } else {
                  logError("Expected and 'AND' or an 'OR' here, but got ".concat(candname.toUpperCase(), " instead. In the legend, define new items using the equals symbol - declarations must look like 'A = B' or 'A = B and C' or 'A = B or C'."), state.lineNumber);
                  resultToken = 'ERROR'; // match_name=["and"];//just to reduce the chance of crashes
                }
              }

              state.tokenIndex++;
            } else {
              match_name = stream.match(reg_name, true);

              if (match_name === null) {
                logError("Something bad's happening in the LEGEND", state.lineNumber);
                match = stream.match(reg_notcommentstart, true);
                resultToken = 'ERROR';
              } else {
                var candname = match_name[0].trim();

                if (wordAlreadyDeclared(state, candname)) {
                  resultToken = 'NAME';
                } else {
                  resultToken = 'ERROR';
                }

                state.tokenIndex++;
              }
            }

            if (match_name !== null) {
              state.current_line_wip_array.push(match_name[0].trim());
            }

            if (stream.eol()) {
              processLegendLine(state, mixedCase);
            }

            return resultToken;
            break;
          }

        case 'sounds':
          {
            /*
            SOUND DEFINITION:
                SOUNDEVENT ~ INT (Sound events take precedence if there's name overlap)
                OBJECT_NAME
                    NONDIRECTIONAL_VERB ~ INT
                    DIRECTIONAL_VERB
                        INT
                        DIR+ ~ INT
            */
            var tokentype = "";

            if (state.current_line_wip_array.length > 0 && state.current_line_wip_array[state.current_line_wip_array.length - 1] === 'ERROR') {
              // match=stream.match(reg_notcommentstart, true);
              //if there was an error earlier on the line just try to do greedy matching here
              var match = null; //events

              if (match === null) {
                match = stream.match(reg_soundevents, true);

                if (match !== null) {
                  tokentype = 'SOUNDEVENT';
                }
              } //verbs


              if (match === null) {
                match = stream.match(reg_soundverbs, true);

                if (match !== null) {
                  tokentype = 'SOUNDVERB';
                }
              } //directions


              if (match === null) {
                match = stream.match(reg_sounddirectionindicators, true);

                if (match !== null) {
                  tokentype = 'DIRECTION';
                }
              } //sound seeds


              if (match === null) {
                var match = stream.match(reg_soundseed, true);

                if (match !== null) {
                  tokentype = 'SOUND';
                }
              } //objects


              if (match === null) {
                match = stream.match(reg_name, true);

                if (match !== null) {
                  if (wordAlreadyDeclared(state, match[0])) {
                    tokentype = 'NAME';
                  } else {
                    tokentype = 'ERROR';
                  }
                }
              } //error


              if (match === null) {
                match = errorFallbackMatchToken(stream);
                tokentype = 'ERROR';
              }
            } else if (state.current_line_wip_array.length === 0) {
              //can be OBJECT_NAME or SOUNDEVENT
              var match = stream.match(reg_soundevents, true);

              if (match == null) {
                match = stream.match(reg_name, true);

                if (match == null) {
                  tokentype = 'ERROR';
                  match = errorFallbackMatchToken(stream);
                  state.current_line_wip_array.push("ERROR");
                  logWarning("Was expecting a sound event (like SFX3, or ENDLEVEL) or an object name, but didn't find either.", state.lineNumber);
                } else {
                  var matched_name = match[0].trim();

                  if (!wordAlreadyDeclared(state, matched_name)) {
                    tokentype = 'ERROR';
                    state.current_line_wip_array.push("ERROR");
                    logError("unexpected sound token \"".concat(matched_name, "\"."), state.lineNumber);
                  } else {
                    tokentype = 'NAME';
                    state.current_line_wip_array.push([matched_name, tokentype]);
                    state.tokenIndex++;
                  }
                }
              } else {
                tokentype = 'SOUNDEVENT';
                state.current_line_wip_array.push([match[0].trim(), tokentype]);
                state.tokenIndex++;
              }
            } else if (state.current_line_wip_array.length === 1) {
              var is_soundevent = state.current_line_wip_array[0][1] === 'SOUNDEVENT';

              if (is_soundevent) {
                var match = stream.match(reg_soundseed, true);

                if (match !== null) {
                  tokentype = 'SOUND';
                  state.current_line_wip_array.push([match[0].trim(), tokentype]);
                  state.tokenIndex++;
                } else {
                  match = errorFallbackMatchToken(stream);
                  logError("Was expecting a sound seed here (a number like 123123, like you generate by pressing the buttons above the console panel), but found something else.", state.lineNumber);
                  tokentype = 'ERROR';
                  state.current_line_wip_array.push("ERROR");
                }
              } else {
                //[0] is object name
                //it's a sound verb
                var match = stream.match(reg_soundverbs, true);

                if (match !== null) {
                  tokentype = 'SOUNDVERB';
                  state.current_line_wip_array.push([match[0].trim(), tokentype]);
                  state.tokenIndex++;
                } else {
                  match = errorFallbackMatchToken(stream);
                  logError("Was expecting a soundverb here (MOVE, DESTROY, CANTMOVE, or the like), but found something else.", state.lineNumber);
                  tokentype = 'ERROR';
                  state.current_line_wip_array.push("ERROR");
                }
              }
            } else {
              var is_soundevent = state.current_line_wip_array[0][1] === 'SOUNDEVENT';

              if (is_soundevent) {
                match = errorFallbackMatchToken(stream);
                logError("I wasn't expecting anything after the sound declaration ".concat(state.current_line_wip_array[state.current_line_wip_array.length - 1][0].toUpperCase(), " on this line, so I don't know what to do with \"").concat(match[0].trim().toUpperCase(), "\" here."), state.lineNumber);
                tokentype = 'ERROR';
                state.current_line_wip_array.push("ERROR");
              } else {
                //if there's a seed on the right, any additional content is superfluous
                var is_seedonright = state.current_line_wip_array[state.current_line_wip_array.length - 1][1] === 'SOUND';

                if (is_seedonright) {
                  match = errorFallbackMatchToken(stream);
                  logError("I wasn't expecting anything after the sound declaration ".concat(state.current_line_wip_array[state.current_line_wip_array.length - 1][0].toUpperCase(), " on this line, so I don't know what to do with \"").concat(match[0].trim().toUpperCase(), "\" here."), state.lineNumber);
                  tokentype = 'ERROR';
                  state.current_line_wip_array.push("ERROR");
                } else {
                  var directional_verb = soundverbs_directional.indexOf(state.current_line_wip_array[1][0]) >= 0;

                  if (directional_verb) {
                    //match seed or direction                          
                    var is_direction = stream.match(reg_sounddirectionindicators, true);

                    if (is_direction !== null) {
                      tokentype = 'DIRECTION';
                      state.current_line_wip_array.push([is_direction[0].trim(), tokentype]);
                      state.tokenIndex++;
                    } else {
                      var is_seed = stream.match(reg_soundseed, true);

                      if (is_seed !== null) {
                        tokentype = 'SOUND';
                        state.current_line_wip_array.push([is_seed[0].trim(), tokentype]);
                        state.tokenIndex++;
                      } else {
                        match = errorFallbackMatchToken(stream); //depending on whether the verb is directional or not, we log different errors

                        logError("Ah I was expecting direction or a sound seed here after ".concat(state.current_line_wip_array[state.current_line_wip_array.length - 1][0].toUpperCase(), ", but I don't know what to make of \"").concat(match[0].trim().toUpperCase(), "\"."), state.lineNumber);
                        tokentype = 'ERROR';
                        state.current_line_wip_array.push("ERROR");
                      }
                    }
                  } else {
                    //only match seed
                    var is_seed = stream.match(reg_soundseed, true);

                    if (is_seed !== null) {
                      tokentype = 'SOUND';
                      state.current_line_wip_array.push([is_seed[0].trim(), tokentype]);
                      state.tokenIndex++;
                    } else {
                      match = errorFallbackMatchToken(stream); //depending on whether the verb is directional or not, we log different errors

                      logError("Ah I was expecting a sound seed here after ".concat(state.current_line_wip_array[state.current_line_wip_array.length - 1][0].toUpperCase(), ", but I don't know what to make of \"").concat(match[0].trim().toUpperCase(), "\"."), state.lineNumber);
                      tokentype = 'ERROR';
                      state.current_line_wip_array.push("ERROR");
                    }
                  }
                }
              }
            }

            if (stream.eol()) {
              processSoundsLine(state);
            }

            return tokentype;
            break;
          }

        case 'collisionlayers':
          {
            if (sol) {
              //create new collision layer
              state.collisionLayers.push([]); //empty current_line_wip_array

              state.current_line_wip_array = [];
              state.tokenIndex = 0;
            }

            var match_name = stream.match(reg_name, true);

            if (match_name === null) {
              //then strip spaces and commas
              var prepos = stream.pos;
              stream.match(reg_csv_separators, true);

              if (stream.pos == prepos) {
                logError("error detected - unexpected character " + stream.peek(), state.lineNumber);
                stream.next();
              }

              return null;
            } else {
              //have a name: let's see if it's valid
              var candname = match_name[0].trim();

              var substitutor = function substitutor(n) {
                n = n.toLowerCase();

                if (n in state.objects) {
                  return [n];
                }

                for (var i = 0; i < state.legend_synonyms.length; i++) {
                  var a = state.legend_synonyms[i];

                  if (a[0] === n) {
                    return substitutor(a[1]);
                  }
                }

                for (var i = 0; i < state.legend_aggregates.length; i++) {
                  var a = state.legend_aggregates[i];

                  if (a[0] === n) {
                    logError('"' + n + '" is an aggregate (defined using "and"), and cannot be added to a single layer because its constituent objects must be able to coexist.', state.lineNumber);
                    return [];
                  }
                }

                for (var i = 0; i < state.legend_properties.length; i++) {
                  var a = state.legend_properties[i];

                  if (a[0] === n) {
                    var result = [];

                    for (var j = 1; j < a.length; j++) {
                      if (a[j] === n) {//error here superfluous, also detected elsewhere (cf 'You can't define object' / #789)
                        //logError('Error, recursive definition found for '+n+'.', state.lineNumber);                                
                      } else {
                        result = result.concat(substitutor(a[j]));
                      }
                    }

                    return result;
                  }
                }

                logError('Cannot add "' + candname.toUpperCase() + '" to a collision layer; it has not been declared.', state.lineNumber);
                return [];
              };

              if (candname === 'background') {
                if (state.collisionLayers.length > 0 && state.collisionLayers[state.collisionLayers.length - 1].length > 0) {
                  logError("Background must be in a layer by itself.", state.lineNumber);
                }

                state.tokenIndex = 1;
              } else if (state.tokenIndex !== 0) {
                logError("Background must be in a layer by itself.", state.lineNumber);
              }

              var ar = substitutor(candname);

              if (state.collisionLayers.length === 0) {
                logError("no layers found.", state.lineNumber);
                return 'ERROR';
              }

              var foundOthers = [];
              var foundSelves = [];

              for (var i = 0; i < ar.length; i++) {
                var tcandname = ar[i];

                for (var j = 0; j <= state.collisionLayers.length - 1; j++) {
                  var clj = state.collisionLayers[j];

                  if (clj.indexOf(tcandname) >= 0) {
                    if (j !== state.collisionLayers.length - 1) {
                      foundOthers.push(j);
                    } else {
                      foundSelves.push(j);
                    }
                  }
                }
              }

              if (foundOthers.length > 0) {
                var warningStr = 'Object "' + candname.toUpperCase() + '" included in multiple collision layers ( layers ';

                for (var i = 0; i < foundOthers.length; i++) {
                  warningStr += "#" + (foundOthers[i] + 1) + ", ";
                }

                warningStr += "#" + state.collisionLayers.length;
                logWarning(warningStr + ' ). You should fix this!', state.lineNumber);
              }

              if (state.current_line_wip_array.indexOf(candname) >= 0) {
                var warningStr = 'Object "' + candname.toUpperCase() + '" included explicitly multiple times in the same layer. Don\'t do that innit.';
                logWarning(warningStr, state.lineNumber);
              }

              state.current_line_wip_array.push(candname);
              state.collisionLayers[state.collisionLayers.length - 1] = state.collisionLayers[state.collisionLayers.length - 1].concat(ar);

              if (ar.length > 0) {
                return 'NAME';
              } else {
                return 'ERROR';
              }
            }

            break;
          }

        case 'rules':
          {
            if (sol) {
              var rule = reg_notcommentstart.exec(stream.string)[0];
              state.rules.push([rule, state.lineNumber, mixedCase]);
              state.tokenIndex = 0; //in rules, records whether bracket has been found or not
            }

            if (state.tokenIndex === -4) {
              stream.skipToEnd();
              return 'MESSAGE';
            }

            if (stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\x2D>[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true)) {
              return 'ARROW';
            }

            if (ch === '[' || ch === '|' || ch === ']' || ch === '+') {
              if (ch !== '+') {
                state.tokenIndex = 1;
              }

              stream.next();
              stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);
              return 'BRACKET';
            } else {
              var m = stream.match(/(?:(?![\t-\r \[\]\|\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])*/, true)[0].trim();

              if (state.tokenIndex === 0 && reg_loopmarker.exec(m)) {
                return 'BRACKET';
              } else if (state.tokenIndex === 0 && reg_ruledirectionindicators.exec(m)) {
                stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);
                return 'DIRECTION';
              } else if (state.tokenIndex === 1 && reg_directions.exec(m)) {
                stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);
                return 'DIRECTION';
              } else {
                if (state.names.indexOf(m) >= 0) {
                  if (sol) {
                    logError('Objects cannot appear outside of square brackets in rules, only directions can.', state.lineNumber);
                    return 'ERROR';
                  } else {
                    stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true);
                    return 'NAME';
                  }
                } else if (m === '...') {
                  return 'DIRECTION';
                } else if (m === 'rigid') {
                  return 'DIRECTION';
                } else if (m === 'random') {
                  return 'DIRECTION';
                } else if (commandwords.indexOf(m) >= 0) {
                  if (m === 'message') {
                    state.tokenIndex = -4;
                  }

                  return 'COMMAND';
                } else {
                  logError('Name "' + m + '", referred to in a rule, does not exist.', state.lineNumber);
                  return 'ERROR';
                }
              }
            }

            break;
          }

        case 'winconditions':
          {
            if (sol) {
              var tokenized = reg_notcommentstart.exec(stream.string);
              var splitted = tokenized[0].split(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/);
              var filtered = splitted.filter(function (v) {
                return v !== '';
              });
              filtered.push(state.lineNumber);
              state.winconditions.push(filtered);
              state.tokenIndex = -1;
            }

            state.tokenIndex++;
            var match = stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*(?:[0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDCD0-\uDCEB\uDCF0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/);

            if (match === null) {
              logError('incorrect format of win condition.', state.lineNumber);
              stream.match(reg_notcommentstart, true);
              return 'ERROR';
            } else {
              var candword = match[0].trim();

              if (state.tokenIndex === 0) {
                if (reg_winconditionquantifiers.exec(candword)) {
                  return 'LOGICWORD';
                } else {
                  logError('Expecting the start of a win condition ("ALL","SOME","NO") but got "' + candword.toUpperCase() + "'.", state.lineNumber);
                  return 'ERROR';
                }
              } else if (state.tokenIndex === 2) {
                if (candword != 'on') {
                  logError('Expecting the word "ON" but got "' + candword.toUpperCase() + "\".", state.lineNumber);
                  return 'ERROR';
                } else {
                  return 'LOGICWORD';
                }
              } else if (state.tokenIndex === 1 || state.tokenIndex === 3) {
                if (state.names.indexOf(candword) === -1) {
                  logError('Error in win condition: "' + candword.toUpperCase() + '" is not a valid object name.', state.lineNumber);
                  return 'ERROR';
                } else {
                  return 'NAME';
                }
              } else {
                logError("Error in win condition: I don't know what to do with " + candword.toUpperCase() + ".", state.lineNumber);
                return 'ERROR';
              }
            }

            break;
          }

        case 'levels':
          {
            if (sol) {
              if (stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*message\b[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true)) {
                state.tokenIndex = -4; //-4/2 = message/level

                var newdat = ['\n', mixedCase.slice(stream.pos).trim(), state.lineNumber];

                if (state.levels[state.levels.length - 1].length == 0) {
                  state.levels.splice(state.levels.length - 1, 0, newdat);
                } else {
                  state.levels.push(newdat);
                }

                return 'MESSAGE_VERB'; //a duplicate of the previous section as a legacy thing for #589 
              } else if (stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*message[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/, true)) {
                //duplicating previous section because of #589
                logWarning("You probably meant to put a space after 'message' innit.  That's ok, I'll still interpret it as a message, but you probably want to put a space there.", state.lineNumber);
                state.tokenIndex = -4; //-4/2 = message/level

                var newdat = ['\n', mixedCase.slice(stream.pos).trim(), state.lineNumber];

                if (state.levels[state.levels.length - 1].length == 0) {
                  state.levels.splice(state.levels.length - 1, 0, newdat);
                } else {
                  state.levels.push(newdat);
                }

                return 'MESSAGE_VERB';
              } else {
                var matches = stream.match(reg_notcommentstart, false);

                if (matches === null || matches.length === 0) {
                  logError("Detected a comment where I was expecting a level. Oh gosh; if this is to do with you using '(' as a character in the legend, please don't do that ^^", state.lineNumber);
                  state.commentLevel++;
                  stream.skipToEnd();
                  return 'comment';
                } else {
                  var line = matches[0].trim();
                  state.tokenIndex = 2;
                  var lastlevel = state.levels[state.levels.length - 1];

                  if (lastlevel[0] == '\n') {
                    state.levels.push([state.lineNumber, line]);
                  } else {
                    if (lastlevel.length == 0) {
                      lastlevel.push(state.lineNumber);
                    }

                    lastlevel.push(line);

                    if (lastlevel.length > 1) {
                      if (line.length != lastlevel[1].length) {
                        logWarning("Maps must be rectangular, yo (In a level, the length of each row must be the same).", state.lineNumber);
                      }
                    }
                  }
                }
              }
            } else {
              if (state.tokenIndex == -4) {
                stream.skipToEnd();
                return 'MESSAGE';
              }
            }

            if (state.tokenIndex === 2 && !stream.eol()) {
              var ch = stream.peek();
              stream.next();

              if (state.abbrevNames.indexOf(ch) >= 0) {
                return 'LEVEL';
              } else {
                logError('Key "' + ch.toUpperCase() + '" not found. Do you need to add it to the legend, or define a new object?', state.lineNumber);
                return 'ERROR';
              }
            }

            break;
          }

        default:
          //if you're in the preamble
          {
            if (sol) {
              state.tokenIndex = 0;
            }

            if (state.tokenIndex == 0) {
              var match = stream.match(/[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*(?:[0-9A-Z_a-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDF70-\uDF81\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDF50-\uDF59\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDE70-\uDEBE\uDEC0-\uDEC9\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEC0-\uDED3\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD839[\uDCD0-\uDCEB\uDCF0-\uDCF9\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/);

              if (match !== null) {
                var token = match[0].trim();

                if (sol) {
                  if (['title', 'author', 'homepage', 'background_color', 'text_color', 'key_repeat_interval', 'realtime_interval', 'again_interval', 'flickscreen', 'zoomscreen', 'color_palette', 'youtube'].indexOf(token) >= 0) {
                    if (token === 'author' || token === 'homepage' || token === 'title') {
                      stream.string = mixedCase;
                    }

                    if (token === "youtube") {
                      logWarning("Unfortunately, YouTube support hasn't been working properly for a long time - it was always a hack and it hasn't gotten less hacky over time, so I can no longer pretend to support it.", state.lineNumber);
                    }

                    var m2 = stream.match(reg_notcommentstart, false);

                    if (m2 !== null) {
                      state.metadata.push(token);
                      state.metadata.push(m2[0].trim());

                      if (token in state.metadata_lines) {
                        var otherline = state.metadata_lines[token];
                        logWarning("You've already defined a ".concat(token.toUpperCase(), " in the prelude on line <a onclick=\"jumpToLine(").concat(otherline, ")>").concat(otherline, "</a>."), state.lineNumber);
                      }

                      state.metadata_lines[token] = state.lineNumber;
                    } else {
                      logError('MetaData "' + token + '" needs a value.', state.lineNumber);
                    }

                    state.tokenIndex = 1;
                    return 'METADATA';
                  } else if (['run_rules_on_level_start', 'norepeat_action', 'require_player_movement', 'debug', 'verbose_logging', 'throttle_movement', 'noundo', 'noaction', 'norestart', 'scanline'].indexOf(token) >= 0) {
                    state.metadata.push(token);
                    state.metadata.push("true");
                    state.tokenIndex = -1;
                    var m2 = stream.match(reg_notcommentstart, false);

                    if (m2 !== null) {
                      var extra = m2[0].trim();
                      logWarning('MetaData ' + token.toUpperCase() + ' doesn\'t take any parameters, but you went and gave it "' + extra + '".', state.lineNumber);
                    }

                    return 'METADATA';
                  } else {
                    logError('Unrecognised stuff in the prelude.', state.lineNumber);
                    return 'ERROR';
                  }
                } else if (state.tokenIndex == -1) {
                  logError('MetaData "' + token + '" has no parameters.', state.lineNumber);
                  return 'ERROR';
                }

                return 'METADATA';
              }
            } else {
              stream.match(reg_notcommentstart, true);
              state.tokenIndex++;
              var key = state[state.metadata.length - 3];
              var val = state.metadata[state.metadata.length - 2];
              var oldLineNum = state.metadata[state.metadata.length - 1];

              if (state.tokenIndex > 2) {
                logWarning("Error: you can't embed comments in metadata values. Anything after the comment will be ignored.", state.lineNumber);
                return 'ERROR';
              }

              if (key === "background_color" || key === "text_color") {
                var candcol = val.trim().toLowerCase();

                if (candcol in colorPalettes.arnecolors) {
                  return 'COLOR COLOR-' + candcol.toUpperCase();
                } else if (candcol === "transparent") {
                  return 'COLOR FADECOLOR';
                } else if (candcol.length === 4 || candcol.length === 7) {
                  var color = candcol.match(/#[0-9a-fA-F]+/);

                  if (color !== null) {
                    return 'MULTICOLOR' + color[0];
                  }
                }
              }

              return "METADATATEXT";
            }

            break;
          }
      }

      if (stream.eol()) {
        return null;
      }

      if (!stream.eol()) {
        stream.next();
        return null;
      }
    },
    startState: function startState() {
      return {
        /*
            permanently useful
        */
        objects: {},

        /*
            for parsing
        */
        lineNumber: 0,
        commentLevel: 0,
        section: '',
        visitedSections: [],
        line_should_end: false,
        line_should_end_because: '',
        sol_after_comment: false,
        objects_candname: '',
        objects_section: 0,
        //whether reading name/color/spritematrix
        objects_spritematrix: [],
        collisionLayers: [],
        tokenIndex: 0,
        current_line_wip_array: [],
        legend_synonyms: [],
        legend_aggregates: [],
        legend_properties: [],
        sounds: [],
        rules: [],
        names: [],
        winconditions: [],
        metadata: [],
        metadata_lines: {},
        original_case_names: {},
        original_line_numbers: {},
        abbrevNames: [],
        levels: [[]],
        subsection: ''
      };
    }
  };
};

window.CodeMirror.defineMode('puzzle', codeMirrorFn);