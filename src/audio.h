#pragma once

#include <mutex>

#include "graphics.h"

namespace audio {

constexpr int framerate{44100};
constexpr int buffer_len{framerate / graphics::fps * 2};
extern int16_t buffer[];
// Mutex for all audio access to buffer
extern std::mutex mutex;

} // namespace audio
