var old_redraw = redraw;
redraw = function() {
    old_redraw();
    native_screen_fill(state.bgcolor);
    native_sprite_render(canvas.context.nativeId);
    native_flip();
};
consolePrint = console.log;
verbose_logging = true;
canYoutube = false;
