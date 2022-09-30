#pragma once

#include <atomic>
#include <memory>
#include <thread>

#include "js.h"

class GameLoop
{
    // Config
    std::string game_contents;
    bool use_puzzlescript_plus;
    bool use_custom_font;
    bool truncate_backups;

    // JavaScript context
    std::unique_ptr<js::Context> js_context;

    // JavaScript thread
    std::thread js_thread;
    std::atomic<bool> js_thread_active;
    std::atomic<bool> waiting_serialize;
    std::atomic<bool> waiting_deserialize;

    // Stored serialized state
    std::string serialized;

    void thread_func();
public:
    GameLoop(std::string game_contents, bool use_puzzlescript_plus, bool use_custom_font);
    ~GameLoop();
    void set_truncate();
    std::string serialize();
    void deserialize(std::string data);
};
