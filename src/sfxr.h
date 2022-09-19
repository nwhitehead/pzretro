/*

Aims to be compatible with PuzzleScript sounds
    https://www.puzzlescript.net/

Based on BFXR by increpare
    https://www.bfxr.net/

Based on the origina SFXR by Thomas Petersson
    http://www.drpetter.se/project_sfxr.html


*/

#include <cassert>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "generator.h"
#include "patch.h"
#include "rng.h"

namespace sfxr
{

Patch pickupCoin(RNG rng);
Patch laserShoot(RNG rng);
Patch explosion(RNG rng);
Patch powerUp(RNG rng);
Patch hitHurt(RNG rng);
Patch jump(RNG rng);
Patch blipSelect(RNG rng);
Patch pushSound(RNG rng);
Patch random(RNG rng);
Patch bird(RNG rng);

void saveWAV(std::vector<float> samples, std::string filename);

void unit_tests();

std::vector<float> generate(int seed);

// Convert signal to lower sampling rate, 8-bit quantized (still in float format)
void lofi(std::vector<float> &data);

} //namespace sfxr
