'use strict'


const dotenv = require('dotenv'),
    _ = require('lodash');

const processEnv = () => {
    let env = dotenv.config();
        if (env.error) {
            console.log('Error parsing .env file');
            throw env.error;
        }

        let expEnv = {};

        _.each(env.parsed, (v, k) => {
            if (v === 'true') {
                expEnv[k] = true;

            } else if (v === 'false') {
                expEnv[k] = false;

            } else if (v.indexOf('JSON@') !== -1) {
                expEnv[k] = JSON.parse(v.split('JSON@')[1]);
            } else {
                expEnv[k] = v;
            }
        })
        return expEnv;
}

module.exports = processEnv();