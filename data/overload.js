var old_redraw = redraw;
redraw = function() {
    native_sprite_instances_clear();
    old_redraw();
    native_sprite_draw_instances();
    native_flip();
};
consolePrint = console.log;
verbose_logging = true;
canYoutube = false;
