#include "js.h"

#include <algorithm>
#include <chrono>
#include <cstdlib>
#include <iostream>
#include <sstream>

#include "graphics.h"
#include "pztime.h"
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
    duk_push_int(ctx, sprite::add_sprite(width, height));
    return 1;
}

duk_ret_t native_sprite_clear(duk_context */*ctx*/)
{
    sprite::clear_sprites();
    return 0;
}

duk_ret_t native_sprite_instances_clear(duk_context */*ctx*/)
{
    sprite::clear_instances();
    return 0;
}

duk_ret_t native_sprite_add_instance(duk_context *ctx)
{
    int index{duk_get_int(ctx, 0)};
    int width{duk_get_int(ctx, 1)};
    int height{duk_get_int(ctx, 2)};
    duk_push_int(ctx, sprite::add_instance(index, width, height));
    return 1;
}

duk_ret_t native_sprite_draw_instances(duk_context */*ctx*/)
{
    sprite::draw_instances();
    return 0;
}

duk_ret_t native_fill_rect(duk_context *ctx)
{
    int id{duk_get_int(ctx, 0)};
    std::string fill{duk_safe_to_string(ctx, 1)};
    int x{duk_get_int(ctx, 2)};
    int y{duk_get_int(ctx, 3)};
    int w{duk_get_int(ctx, 4)};
    int h{duk_get_int(ctx, 5)};
    uint16_t color{webcolor(fill)};
    sprite::fill_rect(id, x, y, w, h, color);
    return 0;
}

duk_ret_t native_sleep(duk_context *ctx)
{
    using namespace std::chrono_literals;
    double delay_s{duk_get_number(ctx, 0)};
    std::this_thread::sleep_for(1s * delay_s);
    return 0;
}

duk_ret_t native_elapsed(duk_context *ctx)
{
    duk_push_int(ctx, pztime::elapsed());
    return 1;
}

duk_ret_t native_get_width(duk_context *ctx)
{
    duk_push_int(ctx, graphics::width);
    return 1;
}

duk_ret_t native_get_height(duk_context *ctx)
{
    duk_push_int(ctx, graphics::height);
    return 1;
}

Context::Context()
: ctx(duk_create_heap(nullptr, nullptr, nullptr, this, fatal_handler))
{
    // Register native functions
	duk_push_c_function(ctx, native_print, DUK_VARARGS);
	duk_put_global_string(ctx, "print");
	duk_push_c_function(ctx, native_sprite_add, 2);
	duk_put_global_string(ctx, "native_sprite_add");
	duk_push_c_function(ctx, native_sprite_add_instance, 3);
	duk_put_global_string(ctx, "native_sprite_add_instance");
	duk_push_c_function(ctx, native_sprite_clear, 0);
	duk_put_global_string(ctx, "native_sprite_clear");
	duk_push_c_function(ctx, native_sprite_instances_clear, 0);
	duk_put_global_string(ctx, "native_sprite_instances_clear");
	duk_push_c_function(ctx, native_fill_rect, 6);
	duk_put_global_string(ctx, "native_fill_rect");
	duk_push_c_function(ctx, native_sprite_draw_instances, 0);
	duk_put_global_string(ctx, "native_sprite_draw_instances");
    duk_push_c_function(ctx, native_sleep, 1);
    duk_put_global_string(ctx, "native_sleep");
    duk_push_c_function(ctx, native_elapsed, 0);
    duk_put_global_string(ctx, "native_elapsed");
    duk_push_c_function(ctx, native_get_width, 0);
    duk_put_global_string(ctx, "native_get_width");
    duk_push_c_function(ctx, native_get_height, 0);
    duk_put_global_string(ctx, "native_get_height");
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

void Context::start_thread(std::string code)
{
    thread_code = code;
    js_thread_active = true;
    js_thread = std::thread(&Context::thread_loop, this);
}

void Context::stop_thread()
{
    js_thread_active = false;
    js_thread.join();
}

void Context::thread_loop()
{
    while(js_thread_active) {
        eval(thread_code);
    }
}

} // namespace js
