
compile(["restart"], sourceCode);

var simulator_time = -1;

main = function() {
    var evt = native_get_event();
    while (evt.key !== 0) {
        if (evt.key === 78 /* N */) {
            nextLevel();
            evt = native_get_event();
            continue;
        }
        if (evt.isPress) {
            onKeyDown({keyCode: evt.key});
        } else {
            onKeyUp({keyCode: evt.key});
        }
        evt = native_get_event();
    }
    if (simulator_time === -1) {
        simulator_time = native_time_elapsed();
    } else {
        let new_time = native_time_elapsed();
        let delta = simulator_time + deltatime - new_time;
        if (delta > 0) {
            native_sleep(delta / 1000.0);
            update();
        } else {
            // Print underrun if we are very late
            if (-delta > deltatime*2) {
                print('UNDERRUN of ' + -delta + 'ms');
                simulator_time += -delta - deltatime;
            }
            update();
        }
        simulator_time += deltatime;
    }
}

function buf2hex(buffer) {
    // Function to hex encode an Int32Array
    if (buffer.length === 0) {
        return "";
    }
    // Handle negatives
    const buffer2 = new Uint32Array(buffer.buffer);
    return [...buffer2]
        .map(x => x.toString(16).padStart(8, '0'))
        .join('');
}

function hex2buf(value) {
    if (value === "") {
        return new Int32Array(0);
    }
    return new Int32Array(value.match(/[\da-f]{8}/gi).map(function (h) {
      return parseInt(h, 16);
    }));
}

const serialize_keys = [
    'curlevel',
    'restartTarget',
    'backups',
    'titleScreen',
    'randomseed',
    'oldflickscreendat',
];

serialize = function() {
    // JSON stringify can take a function that replaces things as they are encountered
    function replacer(key, value) {
        if (value instanceof Int32Array) {
            return {
                type:'Int32Array',
                value:buf2hex(value),
            };
        } else {
            return value;
        }
    }
    // Collect various things together into one serializable state
    // Include current state of level by calling backupLevel()
    const dstate = {
        bak:backupLevel()
    };
    // Add in various global variables
    for (let i = 0; i < serialize_keys.length; i++) {
        const key = serialize_keys[i];
        dstate[key] = globalThis[key];
    }
    // If option is set to include backups, then include them
    if (globalThis._serialize_truncate_backups) {
        dstate.backups = [];
    }
    // Keep track of local storage
    dstate['localstorage'] = storage_get(document.URL);
    dstate['localstorage_checkpoint'] = storage_get(document.URL + '_checkpoint');
    return JSON.stringify(dstate, replacer);
}

function string_of_array(arr) {
    let result = '';
    for (let i = 0; i < arr.length; i++) {
        if (i > 0) {
            result += ' ';
        }
        result += arr[i];
    }
    return result;
}

deserialize = function(data) {
    // JSON parsing takes a reviver function that reverses replacer function
    function reviver(key, value) {
        if (value && value.type && value.type === 'Int32Array') {
            return hex2buf(value.value);
        } else {
            return value;
        }
    }
    const dstate = JSON.parse(data, reviver);
    // Set localstorage
    storage_set(document.URL, dstate['localstorage']);
    storage_set(document.URL + '_checkpoint', dstate['localstorage_checkpoint']);
    // Add in various global variables
    for (let i = 0; i < serialize_keys.length; i++) {
        const key = serialize_keys[i];
        globalThis[key] = dstate[key];
    }
    loadLevelFromState(state, dstate.curlevel);
    // loadLevelFromState resets restartTarget and backups, so get them again
    restartTarget = dstate.restartTarget;
    backups = dstate.backups;
    if (dstate.bak.dat.length > 0) {
        addUndoState(dstate.bak);
        DoUndo(/*force=*/true, /*ignoreDuplicates=*/false);
    }
    if (dstate.titleScreen) {
        goToTitleScreen();
    }
    canvasResize();
    regenSpriteImages();
    redraw();
}
