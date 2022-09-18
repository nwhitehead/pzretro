#pragma once

namespace event {

class Event {
public:
    bool isPress;
    char key;
    Event(bool isPress, char key) : isPress(isPress), key(key) {}
};

void push(Event e);

Event pop();

}
