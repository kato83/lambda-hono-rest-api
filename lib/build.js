const { build } = require('esbuild');
const glob = require('glob');
const entryPoints = glob.sync(['./src/**/*.tsx', './src/**/*.ts']);

build({
    entryPoints,
    platform: 'node',
    outbase: './src',
    outdir: './dist',
    bundle: true,
    external: [
        '@aws-sdk/*',
    ],
});
