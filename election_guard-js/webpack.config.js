const path = require('path');

const TRANSPILE_DIR = process.env.TRANSPILE_DIR;
const DIST_DIR = process.env.DIST_DIR;

module.exports = env => ({
    entry: `./${TRANSPILE_DIR}/__init__.js`,
    mode: env.production ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, DIST_DIR),
        filename: 'voter.js',
        library: "voter",
        libraryTarget: "umd"
    },
    devtool: 'inline-source-map'
})