// Crear un modulo que logee en función del status de debug del .env con la hora y toda la info necesaria.
// Este módulo se exporta aquí y se importa donde se quiera usar para que imprima por pantalla la info requerida

'use strict'

const moment = require('moment');

class Logger {
    get getLogger() {
        return this;
    };
    
    debug(message){
        console.log(`[DEBUG]\t${moment().utc().format()}\t${debug.caller}\t${message}`);
    };

    error(message){
        console.log(`[ERROR]\t${moment().utc().format()}\t${error.caller}\t${message}`);
    };
};

module.exports = Logger;