#pragma once

#include <cstdint>

namespace pztime {

// Get time elapsed since start of core (ms)
uint64_t elapsed();

// Increment elapsed time
void increment(uint64_t delta);

} // namespace pztime
