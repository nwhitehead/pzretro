#include "rng.h"

#include <cassert>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace { // anonymous

std::vector<uint8_t> vectorOfString(std::string txt)
{
    std::vector<uint8_t> v;
    for (char c : txt)
    {
        v.push_back(c);
    }
    return v;
}

std::vector<uint8_t> vectorOfInt(int i)
{
    std::stringstream ss;
    ss << i;
    return vectorOfString(ss.str());
}

} // anonymous


RNG::RNG(std::vector<uint8_t> seed) : stateI(0), stateJ(0)
{
    for (int i = 0; i < 256; i++)
    {
        table[i] = i;
    }
    uint8_t j = 0;
    for (int i = 0; i < 256; i++)
    {
        j += table[i] + seed[i % seed.size()];
        std::swap(table[i], table[j]);
    }
}
RNG::RNG(std::string seed) : RNG(vectorOfString(seed)) {}
RNG::RNG(int seed) : RNG(vectorOfInt(seed)) {}

double RNG::uniform()
{
    int BYTES = 7;  // 56 bits to make a 53-bit double
    double output = 0.0;
    for (int i = 0; i < BYTES; i++)
    {
        output *= 256.0;
        output += nextByte();
    }
    return output / (std::pow(2.0, BYTES * 8.0) - 1.0);
}

int RNG::irnd(int max)
{
    return uniform() * max;
}

int RNG::rnd(int max)
{
    return uniform() * (max + 1);
}

double RNG::frnd(double max)
{
    return uniform() * max;
}

uint8_t RNG::nextByte()
{
    stateI++;
    stateJ += table[stateI];
    std::swap(table[stateI], table[stateJ]);
    uint8_t index = table[stateI] + table[stateJ];
    return table[index];
}
