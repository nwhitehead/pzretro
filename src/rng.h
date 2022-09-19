#pragma once

#include <cstdint>
#include <string>
#include <vector>

class RNG
{
public:
    RNG(std::vector<uint8_t> seed);
    RNG(std::string seed);
    RNG(int seed);
    double uniform();
    int irnd(int max);
    int rnd(int max);
    double frnd(double max);

private:
    uint8_t nextByte();
    uint8_t stateI;
    uint8_t stateJ;
    uint8_t table[256]{};
};
