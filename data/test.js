print("Hello JS world");
print("Screen size is " + native_get_width() + " x " + native_get_height());
var rng = new RNG(123);
for (var i = 0; i < 5; i++) {
    print(rng.random(0, 10));
}
var sourceCode = "title orthogonal rule test\n\n========\nOBJECTS\n========\n\nBackground .\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\nPlayer p\nPink\n00000\n0...0\n0...0\n0...0\n00000\n\nDiamond \nBlue\n.....\n.....\n..0..\n.....\n.....\n\nCrate\nOrange\n00000\n0...0\n0...0\n0...0\n00000\n\n=======\nLEGEND\n=======\n=======\nSOUNDS\n=======\n================\nCOLLISIONLAYERS\n================\n\nBackground\nPlayer\nCrate\nDiamond\n\n======\nRULES\n======\n\n[ ] -> [ Diamond ]\n\n==============\nWINCONDITIONS\n==============\n=======\nLEVELS\n=======\n\n.....\n.....\n..p..\n.....\n.....";

compile(["restart"], sourceCode);

onKeyDown({keyCode: 13});

print("Game title is '" + state.metadata.title + "'");
print(JSON.stringify(state));
print("Cells are " + cellwidth +" x " + cellheight);
print("deltatime is " + deltatime);
localStorage.setItem('level', '0');
print("State serialization is " + localStorage.serialize());

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
