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

## Building V8

Download V8 following instructions at: https://v8.dev/docs/build

Cross compile with instructions at: https://v8.dev/docs/embed

Set options using this command:

    gn args out.gn/arm.release/

The options I set are:

    dcheck_always_on = false
    is_debug = false
    target_os = "linux"
    target_cpu = "arm"
    v8_target_cpu = "arm"
    is_component_build = false
    v8_monolithic = true
    use_custom_libcxx = false
    v8_use_external_startup_data = false
    is_clang = false
    use_sysroot = false

Then build with:

    ninja -C out.gn/arm.release v8_monolith

### WIP

Trying to get monolithic static lib to work, but building sample and linking it is hard. The hello world embedded sample works with:

    ninja -C out/x64.release/ v8_hello_world -v -d keeprsp

To duplicate this by hand, I'm doing (from `out/x64.release`):

    clang++ \
        -std=c++17 \
        -I../.. \
        -I../../buildtools/third_party/libc++ \
        -I../../include \
        -nostdinc++ \
        -isystem../../buildtools/third_party/libc++/trunk/include \
        -c \
        ../../samples/hello-world.cc \
        -o obj/v8_hello_world/hello-world.o \
        -DV8_COMPRESS_POINTERS

    clang++ -o v8_hello_world -Wl,--start-group @"./v8_hello_world.rsp" -Wl,--end-group

Some notes:

* Building the sample needs to be done with clang, mixing g++ and clang doesn't work for serious C++ linking.
* The `v8_hello_world.rsp` file doesn't use the monolith library, it lists all the objs separately.
