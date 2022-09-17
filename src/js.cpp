#include "js.h"

#include <algorithm>
#include <chrono>
#include <cstdlib>
#include <iostream>
#include <sstream>

#include "sprite.h"

namespace js {

void fatal_handler(void *udata, const char *msg)
{
    std::cerr << "******* JS ERROR: " << msg << "\nContext = 0x" << udata << std::endl;
    abort();
}

duk_ret_t native_print(duk_context *ctx)
{
	duk_push_string(ctx, " ");
	duk_insert(ctx, 0);
	duk_join(ctx, duk_get_top(ctx) - 1);
    std::string msg{duk_safe_to_string(ctx, -1)};
    // Do actual print operation
	std::cout << msg << std::endl;
	return 0;
}

uint16_t webcolor(std::string hexcolor)
{
    std::string r;
    std::string g;
    std::string b;
    uint16_t ri{0};
    uint16_t gi{0};
    uint16_t bi{0};
    if (hexcolor.size() == 4) {
        r = hexcolor.substr(1, 1) + hexcolor.substr(1, 1);
        g = hexcolor.substr(2, 1) + hexcolor.substr(2, 1);
        b = hexcolor.substr(3, 1) + hexcolor.substr(3, 1);
    } else if (hexcolor.size() >= 7) {
        r = hexcolor.substr(1, 2);
        g = hexcolor.substr(3, 2);
        b = hexcolor.substr(5, 2);
    } else {
        throw std::invalid_argument("Illegal color");
    }
    std::stringstream sr;
    sr << std::hex << r;
    sr >> ri;
    std::stringstream sg;
    sg << std::hex << g;
    sg >> gi;
    std::stringstream sb;
    sb << std::hex << b;
    sb >> bi;
    return ((ri >> (8 - 5)) << (6 + 5)) | ((gi >> (8 - 6)) << 5) | (bi >> (8 - 5));
}

duk_ret_t native_sprite_add(duk_context *ctx)
{
    int width{duk_get_int(ctx, 0)};
    int height{duk_get_int(ctx, 1)};
    duk_push_int(ctx, sprite::add(width, height));
    return 1;
}

duk_ret_t native_sprite_clear(duk_context */*ctx*/)
{
    sprite::clear();
    return 0;
}

duk_ret_t native_fill_rect(duk_context *ctx) {
    int id{duk_get_int(ctx, 0)};
    std::string fill{duk_safe_to_string(ctx, 1)};
    int x{duk_get_int(ctx, 2)};
    int y{duk_get_int(ctx, 3)};
    int w{duk_get_int(ctx, 4)};
    int h{duk_get_int(ctx, 5)};
    uint16_t color{webcolor(fill)};
    sprite::Sprite &sprite{sprite::get(id)};
    int pitch{sprite.width};
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
    for (int j = 0; j < h; j++) {
        std::fill(sprite.data.data() + x + pitch * j + pitch * y, sprite.data.data() + x + pitch * j + pitch * y + w, color);
    }
    return 0;
}

Context::Context()
: ctx(duk_create_heap(nullptr, nullptr, nullptr, this, fatal_handler))
{
    // Register native functions
	duk_push_c_function(ctx, native_print, DUK_VARARGS);
	duk_put_global_string(ctx, "print");
	duk_push_c_function(ctx, native_sprite_add, 2);
	duk_put_global_string(ctx, "native_sprite_add");
	duk_push_c_function(ctx, native_sprite_clear, 0);
	duk_put_global_string(ctx, "native_sprite_clear");
	duk_push_c_function(ctx, native_fill_rect, 6);
	duk_put_global_string(ctx, "native_fill_rect");
}

Context::~Context()
{
    if (js_thread_active) {
        stop_thread();
    }
    duk_destroy_heap(ctx);
}

void Context::eval(std::string code)
{
    std::lock_guard<std::mutex> guard(mutex);
    duk_eval_string(ctx, code.c_str());
}

void Context::start_thread()
{
    js_thread_active = true;
    js_thread = std::thread(&Context::logic_update, this);
}

void Context::stop_thread()
{
    js_thread_active = false;
    js_thread.join();
}

void Context::logic_update()
{
    using namespace std::chrono_literals;

    eval("x = 0;");
    while(js_thread_active) {
        eval("native_fill_rect(id, '#ffff00', x, 0, 16, 64); x++;");
        std::this_thread::sleep_for(100ms);
    }
}

} // namespace js
