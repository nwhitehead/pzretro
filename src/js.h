#pragma once

#include <atomic>
#include <cstdint>
#include <functional>
#include <mutex>
#include <string>
#include <thread>

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wunused-variable"
#if __GNUC__ >= 8
#pragma GCC diagnostic ignored "-Wcast-function-type"
#endif
#include "quickjs.h"
#pragma GCC diagnostic pop

namespace js {

extern std::function<void(std::string)> debug_print;
extern std::function<void(std::string)> error_print;

// Set print callbacks
extern void set_debug_print(std::function<void(std::string)> func);
extern void set_error_print(std::function<void(std::string)> func);

class Context {
    // Mutex for all external access to js context
    std::mutex mutex;

    JSRuntime *qjs_rt;
    JSContext *qjs_ctx;

public:
    Context();
    ~Context();

    // Eval js code
    void eval(std::string code, std::string filename);

    // Set variable to string value
    void set(std::string name, std::string value);

    // Get variable (string value)
    std::string get(std::string name);
};

} // namespace js
