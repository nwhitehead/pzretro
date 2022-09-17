#pragma once

#include <cstdint>
#include <mutex>
#include <string>

#include "duktape.h"

namespace js {

class Context {
public:
    // Mutex for all external access to js context
    std::mutex mutex;
    duk_context *ctx;

    Context();
    ~Context();

    void eval(std::string code);
};

} // namespace js
