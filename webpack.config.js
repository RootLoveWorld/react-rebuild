const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry:"./src/index.js",
    output:{
        path:path.resolve(__dirname,"build"),
        filename:"main.js"
    },
    resolve:{
        extensions:['*','.js','.jsx','json']
    },
    module:{
        rules:[
            {
                test:/\.jsx?$/,
                exclude:/node_modules/,
                loader:"babel-loader"
            }
        ]
    },
    plugins:[
        new webpack.DefinePlugin({
            PRODUCTION:JSON.stringify(true)
        })
    ]

}