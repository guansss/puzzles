const BF_COMMANDS = [
    {
        code: '+++++-----.',
        inputs: '',
        output: -1,
    },
    {
        code: ',--.',
        inputs: '$0',
        output: -1,
    },
    {
        code: ',-++-++----++--+---++-+-------+-----+---+-++---++-+-+-+----++---++------+---++---+---+-+---+--++-----+-----++--+---+---+--++-------+-+---++++-+-+--------++-+------------++---++-+--+-----+-+-+--+++--+--++-+-----+++-+++---++--++--+---+-+-++++--+--------+--+-.',
        inputs: '$3 * 10 + $4',
        output: -1,
    },
    {
        code: '++++++++++[>----------<-],[>+<-]>+.',
        inputs: '$1 * 10 + $2',
        output: -1,
    },
    {
        code: ',>++++++[<++++++>-],[<->-]<--.',
        inputs: '$5 * 10 + $6, $7 * 10 + $8',
        output: -1,
    },
    {
        code: ',>,<[    >[>+>+<<-]    >[<+>-]    <<-]    >>>'
            // it's boring and meaningless to calculate this number so I just reveal it
            + '-'.repeat(1392)
            + '.',
        inputs: '$5 * 10 + $6, $7 * 10 + $8',
        output: -1,
    },
];

async function main() {
    const inputElms = $('#puzzle input[type="text"]');

    inputElms.eq(1).focus();

    // handle control keys
    document.addEventListener('keydown', e => {
        const currentIndex = inputElms.filter(':focus').index();

        if (e.code === 'Backspace') {
            e.preventDefault();

            // clear current input if it's not empty
            if (inputElms.eq(currentIndex).val() !== '') {
                inputElms.eq(currentIndex).val('');
            } else {
                // else clear last input
                if (currentIndex !== 1) {
                    inputElms.eq(currentIndex - 1).val('').focus();
                }
            }
        } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            e.preventDefault();

            // go to previous or next input according to the key code
            const targetIndex = clamp(currentIndex + (e.code === 'ArrowLeft' ? -1 : 1), 1, inputElms.length - 1);

            inputElms.eq(targetIndex).focus();
        }
    });

    inputElms.on('input', function() {
        const index = inputElms.index(this);

        // force the value to be a single digit
        const value = this.value.replace(this.oldValue, '').replace('\D', '');

        if (!isNaN(value)) {
            this.value = value % 10;
            this.oldValue = this.value;
        } else {
            // cancel the input if the value is invalid
            this.value = this.oldValue || '';
            return;
        }

        // jump to next input
        if (index < inputElms.length - 1) {
            inputElms.eq(index + 1).focus();
        }

        // execute commands if all inputs have been filled
        if (inputElms.get().every(elm => elm.value !== '')) {
            const values = inputElms.get().map(elm => Number(elm.value));

            executeAll(values);

            if (BF_COMMANDS.every(command => command.output === 0)) {
                // WOO-HOO, TAKE OFF!
                travel(destination(values), line2(values));
            } else {
                fail(inputElms);
            }
        }
    });
}

function executeAll(values) {
    for (const command of BF_COMMANDS) {
        // replace arguments with actual input values
        const inputsExpression = command.inputs.replace(/\$(\d)/g, (match, index) => values[index]);

        // convert the inputs expression to an array
        const inputs = eval('[' + inputsExpression + ']');

        brainfuck(command, inputs);
    }
}

function destination(values) {
    const dst = new URL(location.href).searchParams.get('dst');

    if (dst) {
        return dst.replace('$ID$', values.join(''));
    }

    // one gets lost when missing the destination
    return '';
}

// I have to encrypt the second line in the result view because it hints the answer
function line2(values) {
    const raw = 'C})sag$vxglm\'fd$iaea}';
    return String.fromCharCode(...[...raw].map((s, i) => s.charCodeAt(0) ^ values[i % values.length]));
}

function brainfuck(command, inputs) {
    command.output = Module.ccall('bf', 'number', ['string', 'array', 'number'], [command.code, inputs, inputs.length]);
}

function fail(inputElms) {
    inputElms.addClass('shake-rotate').prop('disabled', true);

    setTimeout(() => {
        inputElms.removeClass('shake-rotate').prop('disabled', false);

        // clear all but the first input (the readonly one)
        inputElms.slice(1).val('').each(function() {
            this.oldValue = undefined;
        });

        // focus on the first editable input
        inputElms.eq(1).focus();
    }, 500);
}

window.Module = {
    // invoked when the core WASM has been initialized
    postRun() {
        // override this function to pass unsigned short parameters,
        // I don't know why but without the `buffer >> 1` it won't work :/
        window.writeArrayToMemory = (array, buffer) => HEAPU16.set(array, buffer >> 1);

        endLoading();

        $('#loading').css('opacity', 0);
        $('.panel').css('opacity', 1);

        main();
    },
};
