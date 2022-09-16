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

Linaro toolchain:
https://releases.linaro.org/components/toolchain/binaries/


## Building

To compile, first install gn. https://gn.googlesource.com/gn/

Build with:

    gn gen out/x64
    ninja -C out/x64

The output will be `out/x64/puzzlescript_libretro.so` which can be copied to your RetroArch core folder. Mine is set to `~/.config/retroarch/cores/`.

To quickly test output, do:

    ninja -C out/x86 && retroarch -L out/x64/puzzlescript_libretro.so

To compile for ARM based mini systems such as SEGA Genesis Mini, use the cross toolchain. Set args:

    gn gen out/arm
    gn args out/arm

Add in:

    target_cpu = "arm"

Build with:

    ninja -C out/arm

## Compatibility

Using the Ubuntu 22.04 default ARM cross compiler has a glibc that is too new for the SEGA Genesis Mini. I got errors like:

    [ERROR] Failed to open libretro core: "/opt/project_lunar/opt/retroarch/config/retroarch/cores/puzzlescript_libretro.so"
    [ERROR] Error(s): /lib/libm.so.6: version `GLIBC_2.27' not found (required by /opt/project_lunar/opt/retroarch/config/retroarch/cores/puzzlescript_libretro.so)

I switched to using Linaro 7.5, that works fine. I believe it has GLIBC 2.25.
https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/

## Building V8

I did some experiments with building with V8. Main issue is that V8 does a hermetic build, if you try to use local
tools and things you will usually encounter errors. So you have to use recent clang, and the sysroot from Debian Bullseye
on ARM. In the end that means your app also needs to use those things, which is too new for the SEGA Genesis Mini system
I have with Project Lunar.

Some notes:

Download V8 following instructions at: https://v8.dev/docs/build

Cross compile with instructions at: https://v8.dev/docs/embed

Set options using this command:

    gn args out/x64.release/

The options I set are:

    is_component_build = true
    is_debug = false
    target_cpu = "x64"
    use_goma = false
    v8_enable_backtrace = true
    v8_enable_disassembler = true
    v8_enable_object_print = true
    v8_enable_verify_heap = true
    dcheck_always_on = false
    v8_use_external_startup_data = false
    use_sysroot = false

Build with:

    ninja -C out/x64.release v8

Similarly for ARM, use options:

    is_component_build = true
    is_debug = false
    target_cpu = "arm"
    v8_target_cpu = "arm"
    use_goma = false
    v8_enable_backtrace = true
    v8_enable_disassembler = true
    v8_enable_object_print = true
    v8_enable_verify_heap = true
    dcheck_always_on = false
    v8_use_external_startup_data = false

Then build with:

    ninja -C out/arm.release v8


## Using V8 build

This results in a bunch of `.so` files in the `out/x64.release` directory including things related to V8 and a custom `libc++`.

To build an application using these files, set `V8ROOT` to point to the base of the V8 project then do something like:

    clang++ \
        -std=c++17 \
        -DV8_COMPRESS_POINTERS \
        -I$V8ROOT \
        -I$V8ROOT/buildtools/third_party/libc++ \
        -I$V8ROOT/include \
        -nostdinc++ \
        -isystem $V8ROOT/buildtools/third_party/libc++/trunk/include \
        -c \
        hello-world.cc \
        -o hello-world.o

    clang++ \
        -o hello_world \
        hello-world.o \
        -L$V8ROOT/out/x64.release/ \
        -lv8 -lv8_libbase -lv8_libplatform \
        -stdlib=libc++ \
        -Wl,-rpath,$V8ROOT/out/x64.release

### NOTES

The `is_component_build` means the build will generate `.so` files instead of statically linking. You can theoretically get
a monolithic static build but I had trouble using the final monolithic build since it requires linking against the custom
libc++ library. I found it easier to build the `.so` files and then link to them, that avoids the issues of listing lots
of random `.o` files.

## Building on ARM

OLD

On Ubuntu you need to install packages with the cross compiler:

    sudo apt install gcc make gcc-arm-linux-gnueabihf binutils-arm-linux-gnueabihf g++-arm-linux-gnueabihf

    set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
    set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)
