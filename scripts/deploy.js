const ghpages = require('gh-pages');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const distDir = path.resolve(__dirname, '../dist');

function collect() {
    if (fs.existsSync(distDir)) {
        if (!fs.lstatSync(distDir).isDirectory()) {
            throw new Error(`Path ${distDir} is not a directory.`);
        }

        fs.rmdirSync(distDir, { recursive: true });
    }

    fs.mkdirSync(distDir);

    collectSora();
    collectTravel();

    copyFile(path.resolve(__dirname, '../index.html'), path.resolve(distDir, 'index.html'));
}

function collectSora() {
    copySite('sora', [
        'index.html',
        'index.js',
    ]);
}

function collectTravel() {
    const distFiles = glob.sync(path.resolve(__dirname, '../travel/dist') + '/*')
        .map(file => path.relative(path.resolve(__dirname, '../travel'), file));

    copySite('travel', [
        'index.html',
        'index.js',
        ...distFiles,
    ]);
}

function copySite(dir, files) {
    const destDir = path.resolve(distDir, dir);

    for (const file of files) {
        let from, to;

        if (typeof file === 'string') {
            from = to = file;
        } else {
            [from, to] = file;
        }

        from = path.resolve(dir, from);
        to = path.resolve(destDir, to);

        copyFile(from, to);
    }
}

function copyFile(from, to) {
    fs.mkdirSync(path.dirname(to), { recursive: true });

    console.log('Copying', from, 'to', to);
    fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
}

function publish() {
    console.log('Publishing...');

    ghpages.publish(distDir, function(err) {
        if (err) {
            throw err;
        }

        console.log('Published');
    });
}

collect();
publish();
