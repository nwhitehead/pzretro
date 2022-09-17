#pragma once

#include <cassert>
#include <vector>

#include "graphics.h"

namespace sprite
{

struct Instance {
    int id;
    int x;
    int y;
};

class Sprite {
public:
    int width{-1};
    int height{-1};
    std::vector<uint16_t> data{};

    Sprite(int width, int height) :
        width(width),
        height(height),
        data(width * height) {
    }

    ~Sprite() {
    }

    void draw(int x, int y, int w, int h) {
        assert(w == width);
        assert(h == height);
        for (int r = 0; r < h; r++) {
            for (int c = 0; c < w; c++) {
                *(graphics::framebuffer + y * graphics::stride + r * graphics::stride + x + c) = data[r * w + c];
            }
        }
    }
};

// Sprite Lists
extern std::vector<Sprite> sprites;

// Clear all sprites
void clear();

// Add a sprite, returns index of added sprite in list
int add(int width, int height);

// Fill in rect on sprite
void fill_rect(int index, int x, int y, int w, int h, uint16_t color);

} // namespace sprite
