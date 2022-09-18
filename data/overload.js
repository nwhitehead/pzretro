var old_redraw = redraw;
redraw = function() {
    native_sprite_instances_clear();
    old_redraw();
};
consolePrint = console.log;
verbose_logging = true;
canYoutube = false;
