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
    if (w == -1) {
        w = sprite.width - x;
    }
    if (h == -1) {
        h = sprite.height - y;
    }
    if (x + w > sprite.width || y + h > sprite.height) {
        // Drawing outside size limit dynamically adjusts sprite size
        int new_width = std::max(sprite.width, x + w);
        int new_height = std::max(sprite.height, y + h);
        std::vector<uint16_t> new_data(new_width * new_height, 0xDEAD);
        for (int i = 0; i < sprite.height; i++) {
            for (int j = 0; j < sprite.width; j++) {
                new_data[j + i * new_width] = sprite.data[j + i * sprite.width];
            }
        }
        sprite.width = new_width;
        sprite.height = new_height;
        sprite.data = new_data;
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
    int width;
    int height;
    {
        std::lock_guard<std::mutex> guard(mutex);
        Sprite &src{sprites.at(index_source)};
        width = src.width;
        height = src.height;
    }
    draw_partial(index_destination, index_source, 0, 0, width, height, x, y);
}

void draw_partial(int index_destination, int index_source, int sx, int sy, int width, int height, int dx, int dy)
{
    std::lock_guard<std::mutex> guard(mutex);
    Sprite &dst{sprites.at(index_destination)};
    Sprite &src{sprites.at(index_source)};
    // Compute clipped start and end ranges on source sprite
    int start_r{sy};
    int start_c{sx};
    int end_r{sy + height};
    int end_c{sx + width};
    if (dx < 0) {
        dx = 0;
        start_c += -dx;
    }
    if (dy < 0) {
        dy = 0;
        start_r += -dy;
    }
    if (height + dy > dst.height) {
        height = dst.height - dy;
        end_r = sy + height;
    }
    if (width + dx > dst.width) {
        width = dst.width - dx;
        end_c = sx + width;
    }
    // All addresses should be in bounds now
    for (int r = start_r, dr = dy; r < end_r; r++, dr++) {
        for (int c = start_c, dc = dx; c < end_c; c++, dc++) {
            uint16_t pixel{src.data[r * src.width + c]};
            if (pixel != 0xDEAD) {
                dst.data[dr * dst.width + dc] = pixel;
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
