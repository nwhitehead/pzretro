# PuzzleScript Retroarch Core

In progress

PuzzleScript project:
https://github.com/increpare/PuzzleScript

For making retroarch core, looking at tutorial:
https://web.archive.org/web/20190219134028/http://www.beardypig.com/2016/01/22/emulator-build-along-2/

Project using V8 to do standalone PuzzleScript games:
https://github.com/Narkhos/Puzzlescript-Wrapper

Docs for using V8:
https://v8.dev/docs/embed

## Building

To compile, do something like:

    mkdir build
    cd build
    cmake ..
    make

The output will be `src/puzzlescript_libretro.so` which can be copied to your RetroArch core folder. Mine is set to `~/.config/retroarch/cores/`.

To compile for ARM based mini systems such as SEGA Genesis Mini, use the cross toolchain.

    mkdir build
    cd build
    cmake -DCMAKE_TOOLCHAIN_FILE=../arm.cmake ..
    make

The output will be the same file, should be copied to the appropriate place for your installation of RetroArch. You will need to install cross-compile
toolchain, the `arm.cmake` file has some comments on which packages are needed.


