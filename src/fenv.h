/**
 * PuzzleScript fenv.h
 * 
 * Override's QuickJS's usage of fenv.h so that we don't require linking it directly.
 * 
 * This aims to address `libretro-build-dingux-odbeta-mips32` build errors.
 */

#ifndef PUZZLESCRIPT_SRC_FENV_H__
#define PUZZLESCRIPT_SRC_FENV_H__

#define FE_INVALID    0x01
#define FE_DIVBYZERO  0x02
#define FE_OVERFLOW   0x04
#define FE_UNDERFLOW  0x08
#define FE_INEXACT    0x10
#define FE_DENORMAL   0x80
#define FE_ALL_EXCEPT (FE_DIVBYZERO | FE_INEXACT | FE_INVALID | FE_OVERFLOW | FE_UNDERFLOW | FE_DENORMAL)
#define FE_TONEAREST  0x0
#define FE_UPWARD     0x1
#define FE_DOWNWARD   0x2
#define FE_TOWARDZERO 0x3

/**
 * Our own implementation of fesetround() to override how QuickJS handles setting the float-rounding.
 * 
 * @see quickjs.c
 */
int fesetround(int /* value */) {
    return 0;
}

#endif