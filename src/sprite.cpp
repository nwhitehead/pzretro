#include "sprite.h"

namespace sprite {

std::vector<Sprite> sprites{};

void clear()
{
    sprites.clear();
}

int add(int width, int height)
{
    sprites.emplace_back(width, height);
    return sprites.size() - 1;
}

Sprite &get(int index)
{
    return sprites.at(index);
}

} // namespace sprite
