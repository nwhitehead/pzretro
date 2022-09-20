compile(["restart"], sourceCode);

var simulator_time = -1;

main = function() {
    var evt = native_get_event();
    while (evt.key !== 0) {
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
        } else {
            // Underrun, no sleeping
            // Ignore if it's smaller than deltatime
            if (-delta > deltatime) {
                print('UNDERRUN of ' + -delta + 'ms');
            }
        }
        simulator_time = new_time;
    }
    update();
}
