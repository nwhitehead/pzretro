#include "js.h"

#include <algorithm>
#include <cassert>
#include <chrono>
#include <cstdlib>
#include <iostream>
#include <map>
#include <mutex>
#include <sstream>
#include <vector>

#include "audio.h"
#include "event.h"
#include "graphics.h"
#include "pztime.h"
#include "sfxr.h"
#include "sprite.h"

#include <sstream>

namespace js {

void default_print(std::string msg)
{
    std::cout << msg << std::endl;
}

std::function<void(std::string)> debug_print{default_print};
std::function<void(std::string)> error_print{default_print};

void set_debug_print(std::function<void(std::string)> func)
{
    debug_print = func;
}

void set_error_print(std::function<void(std::string)> func)
{
    error_print = func;
}

void fatal_handler(void */*udata*/, const char *msg)
{
    std::stringstream ss;
    ss << "******* JS ERROR: " << msg << std::endl;
    ss << "FATAL, ABORTING" << std::endl;
    // Output to cerr just in case logging not setup
    std::cerr << ss.str();
    // Call error callback
    error_print(ss.str());
    // Abort...
    abort();
}

int js_getInt32(JSContext *ctx, JSValueConst &arg)
{
    int value{-1};
    if (JS_ToInt32(ctx, &value, arg)) {
        throw std::runtime_error("js_getInt32 exception");
    }
    return value;
}

double js_getNumber(JSContext *ctx, JSValueConst &arg)
{
    double value{0};
    if (JS_ToFloat64(ctx, &value, arg)) {
        throw std::runtime_error("js_getNumber exception");
    }
    return value;
}

std::string js_getString(JSContext *ctx, JSValueConst &arg)
{
    size_t len{};
    const char *str = JS_ToCStringLen(ctx, &len, arg);
    if (!str) {
        throw std::runtime_error("js_getString exception");
    }
    std::string msg{str};
    JS_FreeCString(ctx, str);
    return msg;
}

JSValue js_print(JSContext *ctx, JSValueConst /*this_val*/, int argc, JSValueConst *argv)
{
    assert(argc == 1);
    std::string msg{js_getString(ctx, argv[0])};
    // Do actual print operation
    std::stringstream ss;
	ss << "[" << msg.size() << "] " << msg << std::endl;
    debug_print(ss.str());
	return JS_UNDEFINED;
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

JSValue js_sprite_add(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int width{js_getInt32(ctx, argv[0])};
    int height{js_getInt32(ctx, argv[1])};
    return JS_NewInt32(ctx, sprite::add_sprite(width, height));
}

JSValue js_sprite_clear(JSContext */*ctx*/, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    sprite::clear_sprites();
    return JS_UNDEFINED;
}

JSValue js_fill_rect(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int id{js_getInt32(ctx, argv[0])};
    std::string fill{js_getString(ctx, argv[1])};
    int x{js_getInt32(ctx, argv[2])};
    int y{js_getInt32(ctx, argv[3])};
    int w{js_getInt32(ctx, argv[4])};
    int h{js_getInt32(ctx, argv[5])};
    uint16_t color{webcolor(fill)};
    sprite::fill_rect(id, x, y, w, h, color);
    return JS_UNDEFINED;
}

JSValue js_sprite_draw(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int dst{js_getInt32(ctx, argv[0])};
    int src{js_getInt32(ctx, argv[1])};
    int x{js_getInt32(ctx, argv[2])};
    int y{js_getInt32(ctx, argv[3])};
    sprite::draw(dst, src, x, y);
    return JS_UNDEFINED;
}

JSValue js_sprite_draw_partial(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int dst{js_getInt32(ctx, argv[0])};
    int src{js_getInt32(ctx, argv[1])};
    int sx{js_getInt32(ctx, argv[2])};
    int sy{js_getInt32(ctx, argv[3])};
    int sw{js_getInt32(ctx, argv[4])};
    int sh{js_getInt32(ctx, argv[5])};
    int dx{js_getInt32(ctx, argv[6])};
    int dy{js_getInt32(ctx, argv[7])};
    int dw{js_getInt32(ctx, argv[8])};
    int dh{js_getInt32(ctx, argv[9])};
    if (sw != dw || sh != dh) {
        std::stringstream ss;
        ss << "native_sprite_draw_partial failed, sw=" << sw << " dw=" << dw << " sh=" << sh << " dh=" << dh << std::endl;
        debug_print(ss.str());
        return JS_UNDEFINED;
    }
    sprite::draw_partial(dst, src, sx, sy, sw, sh, dx, dy);
    sx = sx; sy = sy;
    return JS_UNDEFINED;
}

JSValue js_sprite_render(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int id{js_getInt32(ctx, argv[0])};
    sprite::render(id);
    return JS_UNDEFINED;
}

JSValue js_sleep(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    double delay_s{js_getNumber(ctx, argv[0])};
    std::this_thread::sleep_for(std::chrono::duration<double>(delay_s));
    return JS_UNDEFINED;
}

JSValue js_elapsed(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    return JS_NewInt32(ctx, pztime::elapsed());
}

JSValue js_get_width(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    return JS_NewInt32(ctx, graphics::width);
}

JSValue js_get_height(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    return JS_NewInt32(ctx, graphics::height);
}

JSValue js_get_event(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    event::Event evt{event::pop()};
    JSValue result{JS_NewObject(ctx)};
    JS_SetPropertyStr(ctx, result, "key", JS_NewInt32(ctx, evt.key));
    JS_SetPropertyStr(ctx, result, "isPress", JS_NewBool(ctx, evt.isPress));
    return result;
}

JSValue js_flip(JSContext */*ctx*/, JSValueConst /*this_val*/, int /*argc*/, JSValueConst */*argv*/)
{
    graphics::flip();
    return JS_UNDEFINED;
}

JSValue js_screen_fill(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    std::string fill{js_getString(ctx, argv[0])};
    uint16_t color{webcolor(fill)};
    graphics::fill(0, 0, graphics::width, graphics::height, color);
    return JS_UNDEFINED;
}

std::map<int, std::vector<float>> soundbank{};

JSValue js_generate_sound(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int seed{js_getInt32(ctx, argv[0])};
    if (soundbank.find(seed) == soundbank.end()) {
        auto samps = sfxr::generate(seed);
        sfxr::lofi(samps);
        soundbank[seed] = samps;
    }
    return JS_UNDEFINED;
}

JSValue js_play_sound(JSContext *ctx, JSValueConst /*this_val*/, int /*argc*/, JSValueConst *argv)
{
    int seed{js_getInt32(ctx, argv[0])};
    if (soundbank.find(seed) == soundbank.end()) {
        std::cerr << "Could not find sound " << seed << std::endl;
        return JS_UNDEFINED;
    }
    audio::play(soundbank[seed]);
    return JS_UNDEFINED;
}

Context::Context()
{

    qjs_rt = JS_NewRuntime();
    if (!qjs_rt) {
        std::cerr << "Could not create QuickJS Runtime" << std::endl;
        abort();
    }
    qjs_ctx = JS_NewContext(qjs_rt);
    if (!qjs_ctx) {
        std::cerr << "Could not allocate QuickJS context" << std::endl;
        abort();
    }
    JSValue global_obj = JS_GetGlobalObject(qjs_ctx);
    JS_SetPropertyStr(qjs_ctx, global_obj, "print", JS_NewCFunction(qjs_ctx, js_print, "js_print", 1));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sprite_add", JS_NewCFunction(qjs_ctx, js_sprite_add, "js_sprite_add", 2));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sprite_clear", JS_NewCFunction(qjs_ctx, js_sprite_clear, "js_sprite_clear", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_fill_rect", JS_NewCFunction(qjs_ctx, js_fill_rect, "js_fill_rect", 6));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sprite_draw", JS_NewCFunction(qjs_ctx, js_sprite_draw, "js_sprite_draw", 4));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sprite_draw_partial", JS_NewCFunction(qjs_ctx, js_sprite_draw_partial, "js_sprite_draw_partial", 10));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sprite_render", JS_NewCFunction(qjs_ctx, js_sprite_render, "js_sprite_render", 1));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_sleep", JS_NewCFunction(qjs_ctx, js_sleep, "js_sleep", 1));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_elapsed", JS_NewCFunction(qjs_ctx, js_elapsed, "js_elapsed", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_get_width", JS_NewCFunction(qjs_ctx, js_get_width, "js_get_width", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_get_height", JS_NewCFunction(qjs_ctx, js_get_height, "js_get_height", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_get_event", JS_NewCFunction(qjs_ctx, js_get_event, "js_get_event", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_flip", JS_NewCFunction(qjs_ctx, js_flip, "js_flip", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_screen_fill", JS_NewCFunction(qjs_ctx, js_screen_fill, "js_screen_fill", 1));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_time_elapsed", JS_NewCFunction(qjs_ctx, js_elapsed, "js_elapsed", 0));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_generate_sound", JS_NewCFunction(qjs_ctx, js_generate_sound, "js_generate_sound", 1));
    JS_SetPropertyStr(qjs_ctx, global_obj, "native_play_sound", JS_NewCFunction(qjs_ctx, js_play_sound, "js_play_sound", 1));
    JS_FreeValue(qjs_ctx, global_obj);
}

Context::~Context()
{
    JS_FreeContext(qjs_ctx);
    JS_FreeRuntime(qjs_rt);
}

void Context::eval(std::string code, std::string filename)
{
    std::lock_guard<std::mutex> guard(mutex);
    JSValue val = JS_Eval(qjs_ctx, code.c_str(), code.size(), filename.c_str(), 0);
    if (JS_IsException(val)) {
        std::cerr << "***** JavaScript error *****" << std::endl;
        JSValue exval = JS_GetException(qjs_ctx);
        const char *str = JS_ToCString(qjs_ctx, exval);
        if (str) {
            std::cerr << str << std::endl;
            JS_FreeCString(qjs_ctx, str);
        } else {
            std::cerr << "[[exception]]" << std::endl;
        }
        if (JS_IsError(qjs_ctx, exval)) {
            JSValue v = JS_GetPropertyStr(qjs_ctx, exval, "name");
            if (!JS_IsUndefined(v)) {
                const char *str = JS_ToCString(qjs_ctx, v);
                if (str) {
                    std::cerr << str << std::endl;
                    JS_FreeCString(qjs_ctx, str);
                }
            }
            JS_FreeValue(qjs_ctx, v);
        }
        JS_FreeValue(qjs_ctx, exval);
    }
    JS_FreeValue(qjs_ctx, val);
}

void Context::set(std::string name, std::string value)
{
    std::lock_guard<std::mutex> guard(mutex);
    JSValue global_obj = JS_GetGlobalObject(qjs_ctx);
    JS_SetPropertyStr(qjs_ctx, global_obj, name.c_str(), JS_NewStringLen(qjs_ctx, value.c_str(), value.size()));
    JS_FreeValue(qjs_ctx, global_obj);
}

std::string Context::get(std::string name)
{
    std::lock_guard<std::mutex> guard(mutex);
    std::string result;
    JSValue global_obj = JS_GetGlobalObject(qjs_ctx);
    JSValue v = JS_GetPropertyStr(qjs_ctx, global_obj, name.c_str());
    if (!JS_IsUndefined(v)) {
        const char *str = JS_ToCString(qjs_ctx, v);
        if (str) {
            result = std::string{str};
            JS_FreeCString(qjs_ctx, str);
        }
    }
    JS_FreeValue(qjs_ctx, v);
    JS_FreeValue(qjs_ctx, global_obj);
    return result;
}

} // namespace js
