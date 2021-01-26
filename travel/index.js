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
    const inputElms = $('input');

    // switch focus by pressing arrow keys
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            inputElms.eq(
                clamp(inputElms.filter(':focus').index() + (e.key === 'ArrowLeft' ? -1 : 1), 1, inputElms.length - 1),
            ).focus();
        }
    });

    inputElms.on('input', function() {
        // jump to next input
        if (this.oldValue === undefined && inputElms.get(-1) !== this) {
            inputElms.eq(inputElms.index(this) + 1).focus();
        }

        // force the value to be a single digit
        const value = this.value.replace(this.oldValue, '').replace('\D', '');
        this.value = isNaN(value) ? 0 : value % 10;
        this.oldValue = this.value;

        const values = inputElms.get().map(elm => Number(elm.value));

        update(values, inputElms.index(this));
    });

    // execute the first command
    brainfuck(BF_COMMANDS[0], []);

    // manually update the first input element since it's disabled
    inputElms.eq(0).trigger('input');
}

function update(values, index) {
    for (const command of BF_COMMANDS) {
        // process only the commands related to this index
        if (command.inputs.includes('$' + index)) {

            // replace arguments with actual input values
            const inputsExpression = command.inputs.replace(/\$(\d)/g, (match, index) => values[index]);
            const inputs = eval('[' + inputsExpression + ']');

            brainfuck(command, inputs);

            if (BF_COMMANDS.every(command => command.output === 0)) {
                // WOO-HOO, TAKE OFF!
                travel(destination(values), line2(values));
            }
        }
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
    console.log(BF_COMMANDS.map(command => command.output));
}

window.Module = {
    // runs when the core has been loaded
    postRun() {
        // override this function to pass unsigned short parameters
        // don't know why but `buffer >> 1` works :/
        window.writeArrayToMemory = (array, buffer) => HEAPU16.set(array, buffer >> 1);

        endLoading();

        $('#loading').css('opacity', 0);
        $('.panel').css('opacity', 1);

        main();
    },
};
