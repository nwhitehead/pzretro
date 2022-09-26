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
