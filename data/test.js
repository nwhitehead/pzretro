print("Hello JS world");
var rng = new RNG(123);
for (var i = 0; i < 10; i++) {
    print(rng.random(0, 10));
}

id = native_sprite_add(64, 64);
native_sprite_add_instance(id, 100, 100);
native_fill_rect(id, '#ff0000', 0, 0, 16, 64);
native_fill_rect(id, '#00ff00', 16, 0, 16, 64);
native_fill_rect(id, '#0000ff', 32, 0, 16, 64);
x = 0;
main = function() {
    print("Elapsed time is " + native_elapsed())
    native_fill_rect(id, '#888', 0, 0, 64, 64);
    native_fill_rect(id, '#ffff00', x, 0, 16, 64);
    x++;
    native_sleep(0.1);
}
