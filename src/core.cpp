
#include <atomic>
#include <cassert>
#include <cstring>
#include <cstdlib>
#include <map>
#include <memory>
#include <mutex>
#include <iostream>
#include <sstream>
#include <string>
#include <stdexcept>
#include <thread>
#include <vector>

#include "libretro.h"
#include "namespaced_bundled.h"

#include "audio.h"
#include "event.h"
#include "graphics.h"
#include "js.h"
#include "pztime.h"
#include "sprite.h"

// Callbacks
retro_log_printf_t log_cb;
retro_video_refresh_t video_cb;
retro_input_poll_t input_poll_cb;
retro_input_state_t input_state_cb;
retro_environment_t environ_cb;
retro_audio_sample_t audio_cb;
retro_audio_sample_batch_t audio_batch_cb;

// Core options
std::string custom_font{};
std::string use_puzzlescript_plus{};

// Game source contents
std::string game_contents{};
std::string game_filename{};

unsigned retro_api_version()
{
    return RETRO_API_VERSION;
}

void retro_cheat_reset() 
{
    // Empty
}

void retro_cheat_set(unsigned /*index*/, bool /*enabled*/, const char */*code*/)
{
    // Empty
}

void update_variables()
{
    struct retro_variable var = {
        .key = "pzretro_custom_font",
        .value = "",
    };
    if (environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE, &var) && var.value) {
        char str[100];
        snprintf(str, sizeof(str), "%s", var.value);

        log_cb(RETRO_LOG_INFO, "[pzretro]: Got pzretro_custom_font=%s\n", var.value);
        custom_font = std::string(var.value);
    }
    struct retro_variable var2 = {
        .key = "pzretro_use_puzzlescript_plus",
        .value = "",
    };
    if (environ_cb(RETRO_ENVIRONMENT_GET_VARIABLE, &var2) && var2.value) {
        char str[100];
        snprintf(str, sizeof(str), "%s", var2.value);

        log_cb(RETRO_LOG_INFO, "[pzretro]: Got pzretro_use_puzzlescript_plus=%s\n", var2.value);
        use_puzzlescript_plus = std::string(var2.value);
    }
}

bool ends_with(std::string const &value, std::string const &ending)
{
    if (ending.size() > value.size()) {
        return false;
    }
    return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
}

bool should_use_puzzlescript_plus()
{
    bool filename_endswith_pzp{ends_with(game_filename, std::string{".pzp"})};
    return use_puzzlescript_plus == std::string("on") || filename_endswith_pzp;
}

class GameLoop
{
    // JavaScript context
    std::unique_ptr<js::Context> js_context;

    // JavaScript thread
    std::thread js_thread;
    std::atomic<bool> js_thread_active;

    void thread_func();
public:
    GameLoop();
    ~GameLoop();
};

void GameLoop::thread_func()
{
    js_context = std::make_unique<js::Context>();

    if (should_use_puzzlescript_plus()) {
        js_context->eval(std::string("use_puzzlescript_plus = true;"), "eval");
        js_context->eval(std::string(
            bundled::___data_custom_setup_js,
            bundled::___data_custom_setup_js + bundled::___data_custom_setup_js_len), "setup.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_storagewrapper_js,
            bundled::___data_PuzzleScriptPlus_src_js_storagewrapper_js + bundled::___data_PuzzleScriptPlus_src_js_storagewrapper_js_len), "storagewrapper.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_globalVariables_js,
            bundled::___data_PuzzleScriptPlus_src_js_globalVariables_js + bundled::___data_PuzzleScriptPlus_src_js_globalVariables_js_len), "globalVariables.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_debug_off_js,
            bundled::___data_PuzzleScriptPlus_src_js_debug_off_js + bundled::___data_PuzzleScriptPlus_src_js_debug_off_js_len), "debug_off.js");
        if (custom_font == std::string("on")) {
            js_context->eval(std::string(
                bundled::gen_custom_font_js,
                bundled::gen_custom_font_js + bundled::gen_custom_font_js_len), "font.js");
        } else {
            js_context->eval(std::string(
                bundled::___data_PuzzleScriptPlus_src_js_font_js,
                bundled::___data_PuzzleScriptPlus_src_js_font_js + bundled::___data_PuzzleScriptPlus_src_js_font_js_len), "font.js");
        }
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_riffwave_js,
            bundled::___data_PuzzleScriptPlus_src_js_riffwave_js + bundled::___data_PuzzleScriptPlus_src_js_riffwave_js_len), "riffwave.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_sfxr_js,
            bundled::___data_PuzzleScriptPlus_src_js_sfxr_js + bundled::___data_PuzzleScriptPlus_src_js_sfxr_js_len), "sfxr.js");
        js_context->eval(std::string(
            bundled::___data_custom_postsetup_js,
            bundled::___data_custom_postsetup_js + bundled::___data_custom_postsetup_js_len), "postsetup.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_rng_js,
            bundled::___data_PuzzleScriptPlus_src_js_rng_js + bundled::___data_PuzzleScriptPlus_src_js_rng_js_len), "rng.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_colors_js,
            bundled::___data_PuzzleScriptPlus_src_js_colors_js + bundled::___data_PuzzleScriptPlus_src_js_colors_js_len), "colors.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_graphics_js,
            bundled::___data_PuzzleScriptPlus_src_js_graphics_js + bundled::___data_PuzzleScriptPlus_src_js_graphics_js_len), "graphics.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_engine_js,
            bundled::___data_PuzzleScriptPlus_src_js_engine_js + bundled::___data_PuzzleScriptPlus_src_js_engine_js_len), "engine.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_parser_js,
            bundled::___data_PuzzleScriptPlus_src_js_parser_js + bundled::___data_PuzzleScriptPlus_src_js_parser_js_len), "parser.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_compiler_js,
            bundled::___data_PuzzleScriptPlus_src_js_compiler_js + bundled::___data_PuzzleScriptPlus_src_js_compiler_js_len), "compiler.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScriptPlus_src_js_inputoutput_js,
            bundled::___data_PuzzleScriptPlus_src_js_inputoutput_js + bundled::___data_PuzzleScriptPlus_src_js_inputoutput_js_len), "inputoutput.js");
        js_context->eval(std::string(
            bundled::___data_custom_overload_js,
            bundled::___data_custom_overload_js + bundled::___data_custom_overload_js_len), "overload.js");
    } else {
        js_context->eval(std::string("use_puzzlescript_plus = false;"), "eval");
        js_context->eval(std::string(
            bundled::___data_custom_setup_js,
            bundled::___data_custom_setup_js + bundled::___data_custom_setup_js_len), "setup.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_storagewrapper_js,
            bundled::___data_PuzzleScript_src_js_storagewrapper_js + bundled::___data_PuzzleScript_src_js_storagewrapper_js_len), "storagewrapper.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_globalVariables_js,
            bundled::___data_PuzzleScript_src_js_globalVariables_js + bundled::___data_PuzzleScript_src_js_globalVariables_js_len), "globalVariables.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_debug_off_js,
            bundled::___data_PuzzleScript_src_js_debug_off_js + bundled::___data_PuzzleScript_src_js_debug_off_js_len), "debug_off.js");
        if (custom_font == std::string("on")) {
            js_context->eval(std::string(
                bundled::gen_custom_font_js,
                bundled::gen_custom_font_js + bundled::gen_custom_font_js_len), "font.js");
        } else {
            js_context->eval(std::string(
                bundled::___data_PuzzleScript_src_js_font_js,
                bundled::___data_PuzzleScript_src_js_font_js + bundled::___data_PuzzleScript_src_js_font_js_len), "font.js");
        }
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_riffwave_js,
            bundled::___data_PuzzleScript_src_js_riffwave_js + bundled::___data_PuzzleScript_src_js_riffwave_js_len), "riffwave.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_sfxr_js,
            bundled::___data_PuzzleScript_src_js_sfxr_js + bundled::___data_PuzzleScript_src_js_sfxr_js_len), "sfxr.js");
        js_context->eval(std::string(
            bundled::___data_custom_postsetup_js,
            bundled::___data_custom_postsetup_js + bundled::___data_custom_postsetup_js_len), "postsetup.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_rng_js,
            bundled::___data_PuzzleScript_src_js_rng_js + bundled::___data_PuzzleScript_src_js_rng_js_len), "rng.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_colors_js,
            bundled::___data_PuzzleScript_src_js_colors_js + bundled::___data_PuzzleScript_src_js_colors_js_len), "colors.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_graphics_js,
            bundled::___data_PuzzleScript_src_js_graphics_js + bundled::___data_PuzzleScript_src_js_graphics_js_len), "graphics.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_engine_js,
            bundled::___data_PuzzleScript_src_js_engine_js + bundled::___data_PuzzleScript_src_js_engine_js_len), "engine.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_parser_js,
            bundled::___data_PuzzleScript_src_js_parser_js + bundled::___data_PuzzleScript_src_js_parser_js_len), "parser.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_compiler_js,
            bundled::___data_PuzzleScript_src_js_compiler_js + bundled::___data_PuzzleScript_src_js_compiler_js_len), "compiler.js");
        js_context->eval(std::string(
            bundled::___data_PuzzleScript_src_js_inputoutput_js,
            bundled::___data_PuzzleScript_src_js_inputoutput_js + bundled::___data_PuzzleScript_src_js_inputoutput_js_len), "inputoutput.js");
        js_context->eval(std::string(
            bundled::___data_custom_overload_js,
            bundled::___data_custom_overload_js + bundled::___data_custom_overload_js_len), "overload.js");
    }
    js_context->set("sourceCode", game_contents);
    js_context->eval(
        std::string(bundled::___data_custom_main_js,
        bundled::___data_custom_main_js + bundled::___data_custom_main_js_len), "main.js");

    while(js_thread_active) {
        js_context->eval(std::string("main();"), "main");
    }
    // Destroy js context on exit
    js_context.reset(nullptr);
}

GameLoop::GameLoop()
{
    // Setup thread
    js_thread_active = true;
    js_thread = std::thread(&GameLoop::thread_func, this);
}

GameLoop::~GameLoop()
{
    js_thread_active = false;
    js_thread.join();
}

std::unique_ptr<GameLoop> gameLoop;

void reset_game()
{
    update_variables();
    gameLoop = std::make_unique<GameLoop>();
}

bool retro_load_game(const struct retro_game_info *info)
{
    // Set source to game if given, otherwise use default bundled demo game
    if (info && info->data) {
        std::string contents{static_cast<char const*>(info->data), info->size};
        game_contents = contents;
        game_filename = std::string{info->path};
    } else {
        std::string contents{bundled::___data_demo_pz, bundled::___data_demo_pz + bundled::___data_demo_pz_len};
        game_contents = contents;
    }
    reset_game();
    return true;
}

bool retro_load_game_special(unsigned /*game_type*/, const struct retro_game_info */*info*/, size_t /*num_info*/)
{
    return false;
}

void retro_unload_game()
{
    // Empty
}

unsigned retro_get_region()
{
    return RETRO_REGION_NTSC;
}

void retro_set_controller_port_device(unsigned /*port*/, unsigned /*device*/)
{
    // Empty
}

void *retro_get_memory_data(unsigned /*id*/)
{
    return nullptr;
}

size_t retro_get_memory_size(unsigned /*id*/)
{
    return 0;
}

size_t retro_serialize_size()
{
    return 0;
}

bool retro_serialize(void */*data*/, size_t /*size*/)
{
    return false;
}

bool retro_unserialize(const void */*data*/, size_t /*size*/)
{
    return false;
}

namespace { // anonymous

struct retro_variable variables[] = {
    { "pzretro_custom_font", "Use custom anti-aliased font; off|on" },
    { "pzretro_use_puzzlescript_plus", "Use extended PuzzleScriptPlus engine; off|on" },
    { NULL, NULL },
};

} // anonymous

void retro_set_environment(retro_environment_t cb)
{
    environ_cb = cb;

    // Allow running core with no game selected
    bool no_rom = true;
    cb(RETRO_ENVIRONMENT_SET_SUPPORT_NO_GAME, &no_rom);

    cb(RETRO_ENVIRONMENT_SET_VARIABLES, variables);
}

void retro_set_audio_sample_batch(retro_audio_sample_batch_t cb)
{
    audio_batch_cb = cb;
}

void retro_set_video_refresh(retro_video_refresh_t cb)
{
    video_cb = cb;
}

void retro_set_audio_sample(retro_audio_sample_t cb)
{
    audio_cb = cb;
}

void retro_set_input_poll(retro_input_poll_t cb)
{
    input_poll_cb = cb;
}

void retro_set_input_state(retro_input_state_t cb)
{
    input_state_cb = cb;
}

void debug_print(std::string msg)
{
    if (log_cb) {
        log_cb(RETRO_LOG_WARN, msg.c_str());
    } else {
        std::cerr << msg << std::endl;
    }
}

void error_print(std::string msg)
{
    if (log_cb) {
        log_cb(RETRO_LOG_ERROR, msg.c_str());
    } else {
        std::cerr << msg << std::endl;
    }
}

void retro_init()
{
    struct retro_log_callback log;

    if (environ_cb(RETRO_ENVIRONMENT_GET_LOG_INTERFACE, &log)) {
        log_cb = log.log;
    } else {
        log_cb = NULL;
    }

    if (log_cb) {
        log_cb(RETRO_LOG_INFO, "retro_init");
        js::set_debug_print(debug_print);
        js::set_error_print(error_print);
    }
}

void retro_deinit()
{
    gameLoop.reset(nullptr);
    sprite::clear_sprites();
}

void retro_get_system_info(struct retro_system_info *info)
{
    memset(info, 0, sizeof(*info));
    info->library_name = "PuzzleScript";
    info->library_version = "0.2.1";
    info->need_fullpath = false;
    info->valid_extensions = "pz|pzp";
}

void retro_get_system_av_info(struct retro_system_av_info *info)
{
    int pixel_format = RETRO_PIXEL_FORMAT_RGB565;

    *info = retro_system_av_info{};
    info->timing.fps            = graphics::fps;
    info->timing.sample_rate    = audio::framerate;
    info->geometry.base_width   = graphics::width;
    info->geometry.base_height  = graphics::height;
    info->geometry.max_width    = graphics::width;
    info->geometry.max_height   = graphics::height;
    // Don't request any specific aspect ratio

    // the performance level is guide to frontend to give an idea of how intensive this core is to run
    environ_cb(RETRO_ENVIRONMENT_SET_PIXEL_FORMAT, &pixel_format);
}

void retro_reset()
{
    sprite::clear_sprites();
    reset_game();
}

std::map<int, char> joypad_keys = {
    { RETRO_DEVICE_ID_JOYPAD_A, 13 }, // Enter (action)
    { RETRO_DEVICE_ID_JOYPAD_L, 27 }, // Escape
    { RETRO_DEVICE_ID_JOYPAD_Y, 85 }, // Z (undo)
    { RETRO_DEVICE_ID_JOYPAD_START, 82 }, // R (restart)
    { RETRO_DEVICE_ID_JOYPAD_LEFT, 37 },
    { RETRO_DEVICE_ID_JOYPAD_UP, 38 },
    { RETRO_DEVICE_ID_JOYPAD_RIGHT, 39 },
    { RETRO_DEVICE_ID_JOYPAD_DOWN, 40 },
};

std::map<int, bool> joypad_old_state{};

// Run a single frame
void retro_run()
{
    // Run one frame

    // Get input for frame
    input_poll_cb();
    for (auto const & [key, val] : joypad_keys) {
        if (!joypad_old_state[key] && input_state_cb(0, RETRO_DEVICE_JOYPAD, 0, key)) {
            if (key == RETRO_DEVICE_ID_JOYPAD_START) {
                // Check for A+START cheatcode
                if (input_state_cb(0, RETRO_DEVICE_JOYPAD, 0, RETRO_DEVICE_ID_JOYPAD_A)) {
                    // Fake key N for next level
                    joypad_old_state[key] = true;
                    event::push(event::Event(true, 'N'));
                    continue;
                }
            }
            joypad_old_state[key] = true;
            event::push(event::Event(true, val));
        }
        if (joypad_old_state[key] && !input_state_cb(0, RETRO_DEVICE_JOYPAD, 0, key)) {
            joypad_old_state[key] = false;
            event::push(event::Event(false, val));
        }
    }

    // Render audio frame
    std::vector<float> samples{audio::consume(audio::buffer_len)};
    std::vector<int16_t> isamples(audio::buffer_len * 2); // double for stereo
    for (size_t i = 0; i < audio::buffer_len; i++) {
        float v{samples[i] * 32767.0f * 0.8f};
        v = std::max(std::min(v, 32767.0f), -32767.0f);
        isamples[i * 2] = static_cast<int16_t>(v);
        isamples[i * 2 + 1] = static_cast<int16_t>(v);
    }
    audio_batch_cb(isamples.data(), audio::buffer_len);

    // Render video frame
    {
        std::lock_guard<std::mutex> guard(graphics::screen_mutex);
        video_cb(graphics::framebuffer_screen, graphics::width, graphics::height, sizeof(uint16_t) * graphics::stride);
    }

    pztime::increment(1000 / graphics::fps);
}
