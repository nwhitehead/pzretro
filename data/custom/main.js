compile(["restart"], sourceCode);

main = function() {
    var evt = native_get_event();
    if (evt.key !== 0) {
        if (evt.isPress) {
            onKeyDown({keyCode: evt.key});
        } else {
            onKeyUp({keyCode: evt.key});
        }
    }
    native_sleep(deltatime / 1000.0);
    update();
}
