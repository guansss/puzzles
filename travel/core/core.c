#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>

#include "brainfuck.c"

#define CHANCES_PER_SECOND 3 * 2

int max_chances = 0;
int used_chances = 0;

time_t origin_time = 0;

// May the brute force not be with you.
unsigned short trap() {
    time_t cur_time = time(0);

    if (origin_time == 0) {
        // subtract 1s to provide chances at first second
        origin_time = cur_time - 1;

        // consume the first call of this function because that will always return 0 for unknown reason
        rand();
    }

    max_chances = (cur_time - origin_time) * CHANCES_PER_SECOND;

    used_chances++;

    if (used_chances <= max_chances) {
        return 0;
    }

    // it's a trap!
    return rand();
}

unsigned short EMSCRIPTEN_KEEPALIVE bf(char *code, unsigned short *inputs, unsigned int inputs_count) {
    bf_inputs = inputs;
    bf_inputs_count = inputs_count;
    bf_inputs_index = 0;
    bf_output = 0;

    compile_bf(code);
    execute_bf();

    return bf_output + trap();
}
