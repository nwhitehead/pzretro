#include "graphics.h"

#include <algorithm>

namespace graphics {

uint16_t framebuffer[framebuffer_len];

void clear()
{
    std::fill(framebuffer, framebuffer + framebuffer_len, 0x0080);
}

void fill(int x, int y, int w, int h, uint16_t color)
{
    for (int i = 0; i < h; i++) {
        std::fill(framebuffer + x + y * stride + i * stride, framebuffer + x + y * stride + i * stride + w, color);
    }
}

} // namespace graphics
