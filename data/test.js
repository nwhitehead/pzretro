print("Hello JS world");

id = native_sprite_add(64, 64);
native_fill_rect(id, '#ff0000', 0, 0, 16, 64);
native_fill_rect(id, '#00ff00', 16, 0, 16, 64);
native_fill_rect(id, '#0000ff', 32, 0, 16, 64);
x = 0;
main = function() {
    native_fill_rect(id, '#888', 0, 0, 64, 64);
    native_fill_rect(id, '#ffff00', x, 0, 16, 64);
    x++;
    native_sleep(0.2);
}
