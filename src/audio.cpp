#include "audio.h"

#include <mutex>

namespace audio {

std::vector<float> buffer{};
std::mutex mutex;

std::vector<float> consume(int n)
{
    std::lock_guard<std::mutex> guard(mutex);
    std::vector<float> result(n);
    size_t len{buffer.size() < static_cast<size_t>(n) ? buffer.size() : n};
    std::copy(buffer.data(), buffer.data() + len, result.data());
    buffer.erase(buffer.begin(), buffer.begin() + len);
    return result;
}

void play(std::vector<float> &samples)
{
    std::lock_guard<std::mutex> guard(mutex);
    // len is smaller of sizes
    size_t bsize{buffer.size()};
    size_t ssize{samples.size()};
    size_t large_len{bsize < ssize ? ssize : bsize};
    buffer.resize(large_len);
    for (size_t i = 0; i < ssize; i++) {
        buffer[i] += samples[i];
    }
}

} // namespace audio
