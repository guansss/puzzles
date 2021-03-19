#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>

#include "brainfuck.c"

#define TRUE 1
#define FALSE 0

#define RATE 12.0f // executions
#define PER 5.0f // seconds

float last_check = 0;
float allowance = RATE;

int warned = FALSE;

// simple throttle algorithm
// https://stackoverflow.com/a/668327/13237325
int throttled() {
    float now = (float)clock() / CLOCKS_PER_SEC;
    allowance += (now - last_check) * (RATE / PER);
    last_check = now;

    if (allowance > RATE) {
        allowance = RATE;
    }
    if (allowance < 1) {
        return FALSE;
    }

    allowance -= 1;
    return TRUE;
}

unsigned short EMSCRIPTEN_KEEPALIVE bf(char *code, unsigned short *inputs, unsigned int inputs_count) {
    bf_inputs = inputs;
    bf_inputs_count = inputs_count;
    bf_inputs_index = 0;
    bf_output = 0;

    compile_bf(code);
    execute_bf();

    if (throttled()) {
        return bf_output;
    }

    if (!warned) {
        warned = TRUE;
        printf("May the brute force not be with you.\n");
    }

    // it's a trap!
    return rand();
}
