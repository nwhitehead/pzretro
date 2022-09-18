print("Hello JS world");
print("Screen size is " + native_get_width() + " x " + native_get_height());

var evt = native_get_event();
print('evt is ' + JSON.stringify(evt));

var rng = new RNG(123);
for (var i = 0; i < 5; i++) {
    print(rng.random(0, 10));
}
var sourceCode = "title orthogonal rule test\n\n========\nOBJECTS\n========\n\nBackground .\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\nPlayer p\nPink\n00000\n0...0\n0...0\n0...0\n00000\n\nDiamond \nBlue\n.....\n.....\n..0..\n.....\n.....\n\nCrate\nOrange\n00000\n0...0\n0...0\n0...0\n00000\n\n=======\nLEGEND\n=======\n=======\nSOUNDS\n=======\n================\nCOLLISIONLAYERS\n================\n\nBackground\nPlayer\nCrate\nDiamond\n\n======\nRULES\n======\n\n[ ] -> [ Diamond ]\n\n==============\nWINCONDITIONS\n==============\n=======\nLEVELS\n=======\n\n.....\n.....\n..p..\n.....\n.....";

compile(["restart"], sourceCode);


print("Game title is '" + state.metadata.title + "'");
print(JSON.stringify(state));
print("Cells are " + cellwidth +" x " + cellheight);
print("deltatime is " + deltatime);
localStorage.setItem('level', '0');
print("State serialization is " + localStorage.serialize());

main = function() {
    var evt = native_get_event();
    if (evt.key !== 0) {
        print("Event " + JSON.stringify(evt));
        if (evt.isPress) {
            onKeyDown({keyCode: evt.key});
        } else {
            onKeyUp({keyCode: evt.key});
        }
    }
    native_sleep(0.1);
}
