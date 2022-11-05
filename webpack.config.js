const path = require('path');

module.exports = {
    entry: './build/ts/main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js',
    },
};
