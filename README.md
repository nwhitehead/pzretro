# PuzzleScript Retroarch Core

This is a libretro core that plays PuzzleScript games.

PuzzleScript games are usually online at the main PuzzleScript site:
https://www.puzzlescript.net/

To play games in the core, you will need to download the source for the game and save it as a `.pz` file.

The behavior of the core is designed to be as close as possible to the official website. Input bindings for
the core are done in terms of the RetroPad buttons. Depending on your actual input method this may be
somewhat confusing, especially if you have keyboard bindings to RetroPad buttons that differ from the standard
PuzzleScript keyboard bindings.

Input bindings are:

* Directional pad on RetroPad is movement (normally cursor keys on keyboard)
* `A` RetroPad button is ACTION (normally `X` on the keyboard)
* `Y` RetroPad button is UNDO (normally `Z` on the keyboard)
* `START` RetroPad button is RESTART (normally `R` on the keyboard)
* `L` RetroPad button is ESCAPE (normally `ESC` on the keyboard)
* `SELECT+START` together is WIN level (this is cheating!!!)

### Building

First install `gn` following instructions here:
https://gn.googlesource.com/gn/

Make sure NPM is installed:
https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Install dependencies:

    npm install

Build with:

    gn gen out/x64
    ninja -C out/x64

The output will be `out/x64/puzzlescript_libretro.so` which can be copied to your RetroArch core folder.
Mine is set to `~/.config/retroarch/cores/`.

To quickly test output, do:

    ninja -C out/x86 && retroarch -L out/x64/puzzlescript_libretro.so

### ARM

To compile for ARM based mini systems such as SEGA Genesis Mini, use the cross compile toolchain. Set args with:

    gn gen out/arm
    gn args out/arm

Add in configuration lines:

    target_cpu = "arm"
    linaro = "~/linaro"

Download and uncompress and untar the linaro gcc toolchain and sysroot into `~/linaro`. Files are available here:

    https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/

You want these two:

    https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/gcc-linaro-7.5.0-2019.12-x86_64_arm-linux-gnueabihf.tar.xz
    https://releases.linaro.org/components/toolchain/binaries/7.5-2019.12/arm-linux-gnueabihf/sysroot-glibc-linaro-2.25-2019.12-arm-linux-gnueabihf.tar.xz

After the args are set as above, build with:

    ninja -C out/arm

The output will again be `puzzlescript_libretro.so` in the `out/arm` directory. For the SEGA Genesis Mini, I use
Project Lunar and load cores from a USB stick. I copy the file to `/project_lunar/retroarch/cores/` and then run
RetroArch to find the cores and PZ files.

## Notes


### Babel

I had to convert the PuzzleScript JS sources to older version of JavaScript to make it compatible with Duktape, there were
some issues with backtick literals (template strings). I used Babel and the CLI for this. Installed and converted the
directory.

    npm install --save-dev @babel/core @babel/cli
    npm install @babel/preset-env

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

## References

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
