#include "sprite.h"

#include <algorithm>
#include <mutex>

namespace sprite {

std::mutex mutex;
std::vector<Sprite> sprites{};

void clear()
{
    std::lock_guard<std::mutex> guard(mutex);
    sprites.clear();
}

int add(int width, int height)
{
    std::lock_guard<std::mutex> guard(mutex);
    sprites.emplace_back(width, height);
    return sprites.size() - 1;
}

void fill_rect(int index, int x, int y, int w, int h, uint16_t color)
{
    std::lock_guard<std::mutex> guard(mutex);
    if (index < 0 || static_cast<size_t>(index) >= sprites.size())
    {
        return;
    }
    Sprite &sprite{sprites.at(index)};
    if (x < 0) {
        x = 0;
    }
    if (x > sprite.width) {
        x = sprite.width;
    }
    if (y < 0) {
        y = 0;
    }
    if (y > sprite.height) {
        y = sprite.height;
    }
    if (x + w > sprite.width) {
        w = sprite.width - x;
    }
    if (y + h > sprite.height) {
        h = sprite.height - y;
    }
    int pitch{sprite.width};
    for (int j = 0; j < h; j++) {
        std::fill(sprite.data.data() + x + pitch * j + pitch * y, sprite.data.data() + x + pitch * j + pitch * y + w, color);
    }
}

} // namespace sprite
