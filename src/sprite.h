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

    void draw(int x, int y);
};

// Clear all sprites
void clear_sprites();

// Add a sprite, returns index of added sprite in list
int add_sprite(int width, int height);

// Fill in rect on sprite
void fill_rect(int index, int x, int y, int w, int h, uint16_t color);

struct Instance {
    int index;
    int x;
    int y;
};

// Draw an instance of a sprite
int add_instance(int index, int x, int y);

// Clear all sprite instances
void clear_instances();

// Draw all instances of sprites to framebuffer
void draw_instances();

// Get numbers
int sprites_size();
int instances_size();

} // namespace sprite
