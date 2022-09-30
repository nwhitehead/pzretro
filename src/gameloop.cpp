#include "gameloop.h"

#include <iostream>
#include <string>

#include "namespaced_bundled.h"

void GameLoop::thread_func()
{
    js_context = std::unique_ptr<js::Context>(new js::Context());

    if (use_puzzlescript_plus) {
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
        if (use_custom_font) {
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
        if (use_custom_font) {
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
        if (waiting_serialize) {
            if (truncate_backups) {
                js_context->eval(std::string("_serialize_truncate_backups = true;"), "serialize");
            } else {
                js_context->eval(std::string("_serialize_truncate_backups = false;"), "serialize");
            }
            js_context->eval(std::string("_serialized = serialize();"), "serialize");
            serialized = js_context->get("_serialized");
            waiting_serialize = false;
        }
        if (waiting_deserialize) {
            js_context->set("_serialized", serialized);
            js_context->eval(std::string("deserialize(_serialized);"), "deserialize");
            waiting_deserialize = false;
        }
        js_context->eval(std::string("main();"), "main");
    }
    // Destroy js context on exit
    js_context.reset(nullptr);
}

GameLoop::GameLoop(std::string game_contents, bool use_puzzlescript_plus, bool use_custom_font)
: game_contents(game_contents)
, use_puzzlescript_plus(use_puzzlescript_plus)
, use_custom_font(use_custom_font)
, truncate_backups(false)
{
    // Setup thread
    js_thread_active = true;
    waiting_serialize = false;
    waiting_deserialize = false;
    js_thread = std::thread(&GameLoop::thread_func, this);
}

GameLoop::~GameLoop()
{
    waiting_serialize = false;
    js_thread_active = false;
    js_thread.join();
}

void GameLoop::set_truncate()
{
    truncate_backups = true;
}

std::string GameLoop::serialize()
{
    waiting_serialize = true;
    while (waiting_serialize) {
        std::this_thread::sleep_for(std::chrono::duration<double>(0.001));
    }
    return serialized;
}

void GameLoop::deserialize(std::string data)
{
    serialized = data;
    waiting_deserialize = true;
    while (waiting_deserialize) {
        std::this_thread::sleep_for(std::chrono::duration<double>(0.001));
    }
}