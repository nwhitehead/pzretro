#pragma once

#include <atomic>
#include <cstdint>
#include <functional>
#include <mutex>
#include <string>
#include <thread>

#include "duktape.h"

namespace js {

extern std::function<void(std::string)> debug_print;
extern std::function<void(std::string)> error_print;

// Set print callbacks
extern void set_debug_print(std::function<void(std::string)> func);
extern void set_error_print(std::function<void(std::string)> func);

class Context {
    // Mutex for all external access to js context
    std::mutex mutex;
    duk_context *ctx;
    std::thread js_thread; 
    std::atomic<bool> js_thread_active;
    std::string thread_code{};
    std::string thread_filename{};
    void thread_loop();
public:
    Context();
    ~Context();

    // Eval js code
    void eval(std::string code, std::string filename);

    // Set variable to string value
    void set(std::string name, std::string value);

    // Start thread, keep calling code in a loop until stop_thread() is called
    void start_thread(std::string code, std::string filename);

    // Stop thread from calling it's code
    void stop_thread();
};

} // namespace js
