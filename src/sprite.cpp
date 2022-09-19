#include "sprite.h"

#include <algorithm>
#include <chrono>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

#include "graphics.h"

namespace sprite {

std::mutex mutex;
std::vector<Sprite> sprites{};

int add_sprite(int width, int height)
{
    std::lock_guard<std::mutex> guard(mutex);
    sprites.emplace_back(width, height);
    return sprites.size() - 1;
}

void clear_sprites()
{
    std::lock_guard<std::mutex> guard(mutex);
    sprites.clear();
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
        std::fill(
            sprite.data.data() + x + pitch * j + pitch * y,
            sprite.data.data() + x + pitch * j + pitch * y + w,
            color);
    }
}

void draw(int index_destination, int index_source, int x, int y)
{
    std::lock_guard<std::mutex> guard(mutex);
    Sprite &dst{sprites.at(index_destination)};
    Sprite &src{sprites.at(index_source)};
    for (int r = 0; r < src.height; r++) {
        for (int c = 0; c < src.width; c++) {
            uint16_t pixel{src.data[r * src.width + c]};
            if (pixel != 0xDEAD) {
                dst.data[y * dst.width + r * dst.width + x + c] = pixel;
            }
        }
    }
    // // Uncomment these lines to test flicker
    // using namespace std::chrono_literals;
    // std::this_thread::sleep_for(1s * 0.001f);
}

void render(int index)
{
    std::lock_guard<std::mutex> guard1(mutex);
    std::lock_guard<std::mutex> guard2(graphics::mutex);
    Sprite &sprite{sprites.at(index)};
    for (int r = 0; r < sprite.height; r++) {
        std::copy(
            sprite.data.data() + r * sprite.width,
            sprite.data.data() + r * sprite.width + sprite.width,
            graphics::framebuffer + r * graphics::stride);
    }
}

int sprites_size()
{
    std::lock_guard<std::mutex> guard(mutex);
    return sprites.size();
}

} // namespace sprite
