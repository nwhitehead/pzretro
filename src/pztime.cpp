#include "time.h"

#include <mutex>

namespace pztime {

uint64_t cumulative{0};
std::mutex mutex;

uint64_t elapsed()
{
    std::lock_guard<std::mutex> guard(mutex);
    return cumulative;
}

void increment(uint64_t delta)
{
    std::lock_guard<std::mutex> guard(mutex);
    cumulative += delta;
}

} // namespace pztime
