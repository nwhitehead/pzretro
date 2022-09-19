var sourceCode = "title orthogonal rule test\n\n========\nOBJECTS\n========\n\nBackground .\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\nPlayer p\nPink\n00000\n0...0\n0...0\n0...0\n00000\n\nDiamond \nBlue\n.....\n.....\n..0..\n.....\n.....\n\nCrate\nOrange\n00000\n0...0\n0...0\n0...0\n00000\n\n=======\nLEGEND\n=======\n=======\nSOUNDS\n=======\n================\nCOLLISIONLAYERS\n================\n\nBackground\nPlayer\nCrate\nDiamond\n\n======\nRULES\n======\n\n[ ] -> [ Diamond ]\n\n==============\nWINCONDITIONS\n==============\n=======\nLEVELS\n=======\n\n.....\n.....\n..p..\n.....\n.....";

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
