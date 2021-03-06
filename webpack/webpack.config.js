const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const OUTPUT_FOLDER = path.resolve(__dirname, '../app');

const config = {
    entry: {
        app: './src/client/main.ts'
    },
    externals: {
        three: 'THREE'
    },
    devServer: {
        contentBase: `${OUTPUT_FOLDER}`,
        filename: 'app.js',
        inline: true,
        proxy: {
            '/api/*': {
                logLevel: 'debug',
                target: 'http://localhost:3000'
            }
        },
        port: 5000,
        publicPath: '/scripts/'
    },
    devtool: 'inline-source-map',
    output: {
        filename: 'app.js',
        path: `${OUTPUT_FOLDER}/scripts`,
        publicPath: '/scripts/'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts?$/,
                use: 'source-map-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'src/client/tsconfig.json',
                    context: path.resolve(__dirname, '../src/client'),
                    transpileOnly: true
                },
                exclude: path.resolve(__dirname, 'node_modules')
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/client/extension/res/phasingPanel.html', to: path.resolve(__dirname, '../app/scripts/extension/res') },
                { from: 'src/client/extension/res/reportPanel.html', to: path.resolve(__dirname, '../app/scripts/extension/res') }
            ]
        }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve(__dirname, '../src/client/tsconfig.json')
            }
        })
    ],
    resolve: {
        extensions: [ '.ts', '.js' ],
        plugins: [
            new TsConfigPathsPlugin({
                configFile: 'src/client/tsconfig.json'
            })
        ]
    }
};

module.exports = [ config ];
