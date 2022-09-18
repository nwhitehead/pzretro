#include "sprite.h"

#include <algorithm>
#include <mutex>
#include <vector>

#include "graphics.h"

namespace sprite {

std::mutex mutex;
std::vector<Sprite> sprites{};
std::vector<Instance> instances{};

void clear_sprites()
{
    std::lock_guard<std::mutex> guard(mutex);
    sprites.clear();
}

int add_sprite(int width, int height)
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
        std::fill(
            sprite.data.data() + x + pitch * j + pitch * y,
            sprite.data.data() + x + pitch * j + pitch * y + w,
            color);
    }
}

int add_instance(int index, int x, int y)
{
    std::lock_guard<std::mutex> guard(mutex);
    Instance i;
    i.index = index;
    i.x = x;
    i.y = y;
    instances.push_back(i);
    return instances.size() - 1;
}

void clear_instances()
{
    std::lock_guard<std::mutex> guard(mutex);
    instances.clear();
}

void Sprite::draw(int x, int y)
{
    for (int r = 0; r < height; r++) {
        std::copy(
            data.data() + r * width,
            data.data() + r * width + width,
            graphics::framebuffer + y * graphics::stride + r * graphics::stride + x);
    }
}

void draw_instances()
{
    std::lock_guard<std::mutex> guard(mutex);
    for (auto &instance : instances)
    {
        int index = instance.index;
        if (index >= 0 && static_cast<size_t>(index) < sprites.size())
        {
            Sprite &sprite{sprites.at(index)};
            sprite.draw(instance.x, instance.y);
        }
    }
}

int sprites_size()
{
    std::lock_guard<std::mutex> guard(mutex);
    return sprites.size();
}

int instances_size()
{
    std::lock_guard<std::mutex> guard(mutex);
    return instances.size();
}

} // namespace sprite
