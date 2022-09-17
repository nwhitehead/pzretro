#pragma once

#include <atomic>
#include <cstdint>
#include <mutex>
#include <string>
#include <thread>

#include "duktape.h"

namespace js {

class Context {
    // Mutex for all external access to js context
    std::mutex mutex;
    duk_context *ctx;
    std::thread js_thread; 
public:
    std::atomic<bool> js_thread_active;
    Context();
    ~Context();

    void eval(std::string code);
    void start_thread();
    void stop_thread();

    void logic_update();
};

} // namespace js
