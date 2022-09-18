#include "time.h"

#include <atomic>

namespace pztime {

std::atomic<uint64_t> cumulative{0};

uint64_t elapsed()
{
    return cumulative;
}

void increment(uint64_t delta)
{
    cumulative += delta;
}

} // namespace pztime
