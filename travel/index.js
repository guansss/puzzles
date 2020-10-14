const BF_COMMANDS = [
    {
        code: '+++++-----.',
        inputs: '',
        valid: false,
    },
    {
        code: ',--.',
        inputs: '[values[0]]',
        valid: false,
    },
    {
        code: '++++++++++[>++++++++++<-],[>-<-]>-.',
        inputs: '[values[1] * 10 + values[2]]',
        valid: false,
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
            const nextInput = inputElms.eq(inputElms.index(this) + 1);

            if (nextInput) {
                nextInput.focus();
            }
        }

        // force the value to be a single digit
        const value = this.value.replace(this.oldValue, '').replace('\D', '');
        this.value = isNaN(value) ? 0 : value % 10;
        this.oldValue = this.value;

        const values = inputElms.map((index, elm) => +elm.value).get();

        update(values, inputElms.index(this));
    });

    // manually update the first input element since it's disabled
    // inputElms.eq(0).trigger('input');
}

function update(values, index) {
    for (const command of BF_COMMANDS) {
        // process only necessary commands
        if (command.inputs.includes(index) || (!command.inputs && !command.valid)) {
            const inputs = eval(command.inputs) || [];

            command.result = bf(command.code, inputs);
            command.valid = bf(command.code, inputs) === 0;

            console.log(BF_COMMANDS.map(command => command.result));

            if (BF_COMMANDS.every(command => command.valid)) {
                // travel(destination(values));
            }
        }

    }

    if (values.some(value => value === 1)) {
        // just do it!
        travel();
    }
}

function destination(values) {
    return values.join('');
}

function bf(code, inputs) {
    return Module.ccall('bf', 'number', ['string', 'array', 'number'], [code, inputs, inputs.length]);
}

if (typeof WebAssembly !== 'object') {
    $('#loading').html('The puzzle requires WebAssembly feature which isn\'t supported by this browser, please use a <a href="https://browsehappy.com/">modern browser</a> instead.');
    throw 1;
}

const loadingUpdater = ((i) => setInterval(() => $('#loading').text('Loading' + '.'.repeat(i++ % 3 + 1)), 500))(0);

window.Module = {
    postRun() {
        // override default function to pass unsigned short parameters
        // don't know why `buffer >> 1` works :/
        window.writeArrayToMemory = (array, buffer) => HEAPU16.set(array, buffer >> 1);

        clearInterval(loadingUpdater);

        $('#loading').css('opacity', 0);
        $('.panel').css('opacity', 1);

        main();
    },
};
