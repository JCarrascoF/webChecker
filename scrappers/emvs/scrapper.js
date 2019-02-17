'use strict'

const unirest = require("unirest");
const cheerio = require('cheerio');
const _ = require('lodash')
const fs = require('fs');
const path = require('path');
const util = require('util');

const ENV = require('../../utils/envProcessor');

class scrapper {
    constructor(transporter) {
        this.mailOptions = {
            from: ENV.MAIL_FROM,
            to: ENV.MAIL_TO,
            subject: 'EMVS Scrapper news!',
            text: ''
        };

        this.transporter = transporter;
        this.cachePath = path.resolve(__dirname, ENV.CACHE_FILENAME);
    }

    _doRequest() {
        return new Promise((resolve, reject) => {
            let req = unirest("POST", "https://www3.emvs.es/smaweb/");

            req.headers({
                "Postman-Token": "1367b2ac-d65f-49ad-b938-0377e708b9e5",
                "x-requested-with": "XMLHttpRequest",
                "x-microsoftajax": "Delta=true",
                "user-agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:65.0) Gecko/20100101 Firefox/65.0",
                "referer": "https://www3.emvs.es/smaweb/",
                "pragma": "no-cache",
                "host": "www3.emvs.es",
                "dnt": "1",
                "cookie": "ASP.NET_SessionId=5i3ntyn4gh0lei5nqjlki4fd",
                "content-type": "application/x-www-form-urlencoded; charset=utf-8",
                "content-length": "2838",
                "connection": "keep-alive",
                "cache-control": "no-cache,no-cache",
                "accept-language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
                "accept-encoding": "gzip, deflate, br",
                "accept": "*/*"
            });

            req.send("ctl00%24ScriptManager1=ctl00%24MainContent%24updBotones%7Cctl00%24MainContent%24btnBuscar&__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=%2Fvagkt2%2Fuu3w9lkplXQCOLTj4iycYU8sy0ePgzuZU8uTdxnM7Tn0ShCKfJbL5HfhngwOTufkt4REq9E9nsEphGWjhWSwd%2FMQM7GFY3Wap7zPytCyzY1uRi9uqYdzGM0DTZ%2Fm9VX5AOCQmSpte%2Ba%2Fo13w4EmqlzwuaTDXGDTyC28stHDf%2Fyloz%2BNV%2BrvVqYagVEuTypz0czzbcQKlgijCM%2BKOcieioedhkOj%2FKU7Fr4At%2FZ0CZFHq4ngC9QOCQONTm9T2Tnvh7advGBXwkDcIvBF2P9%2BjtRSh9581BmlQinoD4XNZtcKdSYTI1FXUE9wSktjKBlCxa851Y013XHPxsf1RxDGfiLNMHU6odLejvaegNUu5liMUgFnp34bzJYe%2Bw7x5Q3saZX6GlfqjvAf%2Fk3iOyCbaxFwf3mvMcWmEDhMglFv5qbtEKefj2EjBaO2CiB2c5PdHop%2FjXQRJcMtWVDrUtzqBXJsSTMp2GjYlse1LUm8u4F%2BdoBliseocsBA252jmECacxXL8%2B%2Bm6BZyC5ciSkFfoztV%2BJogJ%2Bn80GLaLHTuGDAWmxNm7RC%2F6yPjz2nH7wHinDJ2D91FTIEigwAXM%2BYXJ4U%2BwLKcYPC3ceSy7rm4Pu7SJsHBemrXw7yRMlIIQOR5PV0PNeyfrmFYbnf9d64Fp7p%2F8K0DMZp3Pk3YvdJmsqWpYOJxO%2B98jGPNigkyVNPD%2F5jDkQXh%2BXZESxbNbcABHk3Q%2FRXq%2B5frzy5BDvzQT3Ek1HyUbMGhOm6ZAlZ%2BP3%2F6v06%2FjOiU3a7xBKgzqtNchljuUewJ0Pvo0iHOWLKI3orbzRNhXcVozuYyKWnQCtXjqJio2EeuyvPY6u9K368MXNU7fwFB4mRQOl9xW6VHS0CwnyJRJ%2FbA%2B8Wa8nIawZJjhai0PhAsp4p%2BBAkGePX0sx%2BxjpUpfkeOolhK0AIi2ZHocLpEfx1CUB9QBTthFKJ0QboYvlB5p8ASzh8qUGSWGnOSFjZm9Mk%2ByLT3f09%2Bet7zqVe9NiDzFRkm4iLgY0%2FQ5xts8yqCskt0A84n%2BKNqW0S0GhDoSAdGloG6ixdFP7d%2B1RPl9AGTJuV5sDIbDyN%2F3JTEoOmZjzHqHNfdO4c6Ak5wwU%2FMXBrJGUylqSkzBPEfyGzpe3214nOzyTg87SP9Ax%2F7gqkKjHo3Ui%2F50zMujvlQ%2Be7Mb%2BU3r5%2Bcwxm%2FZgpJVQLLEoSzlHIMpqW3kkb1IZRT9PO1uCtBYbAH%2B24XXyNSuauNNGLmbUvhXEXsY%2Bjm%2FomRdsGwow1dqbhD%2FvgLi9iC0988Qher5KjtcGNuIZD0PBK1C7Jyh5jPA%2F1orzO4U8F%2F6lKsjT0HG9jP2J4%2FLlvAVxC9KI6ZJ%2FQ%3D%3D&__VIEWSTATEGENERATOR=BBEA25BA&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=QTtDktnMvWC2eXXVBwHSyh3fjyOCi7YkBoZhRThV%2BcBU9wH%2FOyGyaKhwtC6%2BSFGd5gZD2tZokzYZB1YXTAmQ%2FiR3leHZ%2Bghq2mgm4yTANlALDAbKs%2Fmxeh%2FFW%2BxMg7eWb0LcibNLjPdDjtals%2FvLQoMzBLpLLoRq8HuB3SyLm4o%2Bh7OwEQYGIWLuol9jvhO3%2FduZ1kwgv4QBKmaRM2LR9H3PI3KaFa84jTwKMVKaKAsDMR8caHa4v1OhOKhVPvpD%2BvdlMHYf6hgXmx7lGaH%2F8Pl1P2GynNjJ0VCDzIeyQtjkU5HUqu1fDN08sZmO0z8kvLFlI3sOuiPj%2FzhAsDYfg11S9Z2pLajSRE8V9yKYZ23iKGNQboqEpiujo%2Btz%2FlTE1Fu%2FbP7WjtztkRlyEnF3eXeFNuuuNjWM49Ew0yiGKQ%2FAtP7chKyDOkHAUTzac3wkfhKGaBRNElDFgUTQBlbW13TTsV454hxQI%2BAqvf2Bn3ZskD65FPrOCY%2F93S2ETREgm2Htfrb0gzJqHKPRQPJbPSHVgXCc6SYo7Ky8PwGg0onqGwh8Mutkw2qJaZieU7Le1h18T%2F3Wt5D1pGbjxH0TVs%2BU9%2FCrE1jv2oO3KPmThAdUaFn5kY8rZGjL4zo1LCDKiyn%2BoMEjxFbMUzelVqaKwkqIg1MpZ8KDEw8HeqBF927MbzW07rQnVHrj%2BeheL%2BKTZoX3KFtxZRRcp2km%2FFIFcVYBY1HtwI3KgtD%2Ff92KlOiDAPkYM7KeDmgvzvdXdHJnJDDI9uIi9EsdnIwBumSw4x4JZ%2FAlEciMPl6usUczTHahEyrpOXECN60S22HNGcSd&ctl00%24MainContent%24ddlDistrito=0&ctl00%24MainContent%24txtPrecioMinimo=&ctl00%24MainContent%24txtPrecioMaximo=650&ctl00%24MainContent%24ddlMobiliario=0&ctl00%24MainContent%24txtNumeroDormitorios=&__ASYNCPOST=true&ctl00%24MainContent%24btnBuscar=Buscar");

            req.end((res) => {
                if (res.error) throw new Error(res.error);
                resolve(res.body);
            });
        })
    }

    _extractInfo(res) {
        let $ = cheerio.load(res)
        let tableContent = [];

        $('#ctl00_MainContent_gvResultados > tbody > tr').not('.headerStyle').map((idx, elem) => {
            let tableEntry = {};
            for (let i = 0; i < elem.children.length; i++) {
                let child = elem.children[i];
                if (child.children) {
                    switch (i) {
                        case 1:
                            tableEntry.id = Number(child.children[0].data)
                            break;

                        case 2:
                            tableEntry.address = child.children[0].data
                            break;

                        case 3:
                            tableEntry.neighborhood = child.children[0].data
                            break;

                        case 7:
                            tableEntry.price = child.children[0].data.split(' €')[0]
                            break;
                    }
                }
            }
            tableContent.push(tableEntry);
        });
        return tableContent;
    }

    async _getCacheContent() {
        const promAccess = util.promisify(fs.access);
        try {
            await promAccess(this.cachePath);
            let cache = require(`./${ENV.CACHE_FILENAME}`);
            return Promise.resolve(cache);
        }
        catch (error) {
            console.log(`Not valid cache found\n${error}\nStack:: ${error.stack}`);
            return Promise.resolve([]);
        }
    }

    async _compareCached(current) {
        let cache = await (this._getCacheContent());
        let newItems = [];
        _.each(current, (item) => {
            if (!_.find(cache, {
                    'id': item.id
                })) {
                newItems.push(item);
            }
        })
        newItems.length && console.log('New items');
        !newItems.length && console.log('No new items');
        return newItems;
    }

    _sendMail(content) {
        this.mailOptions.text = `New items!\n${JSON.stringify(content,0,1)}\n\nhttps://www3.emvs.es/smaweb/`
        return new Promise ((resolve, reject) => {
            
            this.transporter.sendMail(this.mailOptions, (err, info) => {
                if (err) {
                    console.log(`Error in sending mail!`);
                    throw err;
                }
                console.log(`Mail correctly sent`);
                resolve();
            })
        })
        
    }

    _updateCache(currentState) {
        return new Promise ((resolve, reject) => {
            fs.writeFile(this.cachePath, JSON.stringify(currentState), (err) => {
                if (err) throw err;
                console.log('Cache update done');
                resolve();
            })
        })
    }

    run() {
        (async () => {
            try {
                console.log('-- RUNNNING emvs scrapper...');
                let response = await (this._doRequest())
                let currentContent = this._extractInfo(response);
                let newItems = await(this._compareCached(currentContent));
                if (newItems.length) {
                    if (ENV.MAIL_ENABLE) {
                        ENV.MAIL_ENABLE && await (this._sendMail(newItems));
                    } else {
                        console.log('\nNo mail sent due to configuration.');
                    }
                }
                await (this._updateCache(currentContent));
                console.log('-- FINISH Scrapper finished');
            } catch (error) {
                console.log(`Error running EMVS scrapper\n${error}\nStacktrace:: ${error.stack}`);
            }
        })();
    }
}

module.exports = scrapper;