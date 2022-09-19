#pragma once

#include <cassert>
#include <cstdint>
#include <vector>

namespace sprite
{

class Sprite {
public:
    int width{-1};
    int height{-1};
    std::vector<uint16_t> data{};

    Sprite(int width, int height) :
        width(width),
        height(height),
        data(width * height, 0xDEAD) {
    }

    ~Sprite() {
    }
};

// Clear all sprites
void clear_sprites();

// Add a sprite, returns index of added sprite in list
int add_sprite(int width, int height);

// Fill in rect on sprite
void fill_rect(int index, int x, int y, int w, int h, uint16_t color);

// Draw one sprite into another one
void draw(int index_destination, int index_source, int x, int y);

// Render sprite to framebuffer
void render(int index);

// Get numbers
int sprites_size();

} // namespace sprite
