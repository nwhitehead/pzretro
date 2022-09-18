#include "event.h"

#include <mutex>
#include <queue>

namespace event {

std::queue<Event> events;
std::mutex mutex;

void push(Event e)
{
    std::lock_guard<std::mutex> guard(mutex);
    events.push(e);
}

Event pop()
{
    std::lock_guard<std::mutex> guard(mutex);
    Event result{false, 0};
    if (events.size() > 0) {
        result = events.front();
        events.pop();
    }
    return result;
}

}