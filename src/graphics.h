#pragma once

#include <cstdint>

namespace graphics {

constexpr int fps{30};
constexpr int width{640};
constexpr int height{480};
constexpr int stride{width};
constexpr int framebuffer_len{stride * height};

// Format is always fixed RGB 565
extern uint16_t framebuffer[];

// Clear all framebuffer
void clear();

// Fill rectangle in framebuffer with solid color
void fill(int x, int y, int w, int h, uint16_t color);

} // namespace graphics
