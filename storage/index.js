const Memcached = require('memcached');
Memcached.config.timeout = 1000;
Memcached.config.retry = 1000;
Memcached.config.retries = 1;

const EXPIRED_TIME = 86400;

let memcached = null;

module.exports = class Storage {

    constructor(config) {
        if (memcached == null) memcached = new Memcached(config);
    }

    get(key) {
        return new Promise((resolve, reject) => {
            let currentTime = Date.parse(new Date());
            memcached.get(key, function (err, data) {
                if (err) {
                    reject(err);
                    return ;
                }
                if (!data) { resolve(0); return ;}
                if (data.unfreezeTime) { //如果已经被冻住，检查是否需要解冻
                    if (currentTime > data.unfreezeTime) {
                        delete(data.unfreezeTime);
                    } else {
                        resolve(-1);
                        return ;
                    }
                }
                let validTime = currentTime - data.lifeTime;
                data.history = data.history.filter(viewTime => {
                    return viewTime >= validTime;
                });
                memcached.set(key, data, EXPIRED_TIME, function (err) {
                    if (err) {reject(err); return ;}
                    resolve(data.history.length);
                    return;
                });
            })
        });
    }


    add(key, viewTime, lifeTime) {
        return new Promise((resolve, reject) => {
            memcached.get(key, function (err, data) {
                if (!data) { //未记录过
                    memcached.set(
                        key,
                        {
                            history: [viewTime],
                            lifeTime: lifeTime
                        },
                        EXPIRED_TIME,
                        function (err) {
                            if (err) { reject(err); return ;}
                            resolve();
                            return ;
                        }
                    )
                } else {
                    data.history.push(viewTime);
                    memcached.set(key, data, EXPIRED_TIME, function (err) {
                            if (err) { reject(err); return ;}
                            resolve();
                            return ;
                        }
                    )
                }
            });
        });
    }

    freeze(key, freezeTime) {
        return new Promise((resolve, reject) => {
            memcached.get(key, function (err, data) {
                if (data) {
                    data.unfreezeTime = Date.parse(new Date()) + freezeTime;
                    memcached.set(key, data, EXPIRED_TIME, function (err) {
                        if (err) { reject(err); return ;}
                        resolve();
                        return ;
                    })
                }
            })
        });
    }
};