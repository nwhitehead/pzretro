#pragma once

#include <cstdint>
#include <vector>

#include "graphics.h" // for fps

namespace audio {

constexpr int framerate{44100};
constexpr int buffer_len{framerate / graphics::fps};

// Remove samples from start of buffer
std::vector<float> consume(int n);

// Mix in samples at current head of buffer
void play(std::vector<float> &samples);

} // namespace audio
