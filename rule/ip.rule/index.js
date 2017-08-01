module.exports = class IPRule {

    constructor(limitPeriod, maxTimes, freezeTime) {
        this.limitPeriod = limitPeriod;
        this.maxTimes = maxTimes;
        this.freezeTime = freezeTime;
    }

    async do(req, storage) {
        let ip = this.extractIp(req);
        if (ip != '') {
            let key = `${ip}_${req.api.name}`;
            let count = await storage.get(key);
            if (count < 0) { //已被冻住
                throw new Error(`IP频率限制, ip: ${ip}, 请求接口: ${req.api.name}`);
            } else if (count > this.maxTimes) {
                await storage.freeze(key, this.freezeTime);
            } else {
                await storage.add(key, Date.parse(new Date()), this.limitPeriod);
            }
        }
    }

    extractIp(req) {
        let ip = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        if (ip.split(',').length > 0) {
            ip = ip.split(',')[0]
        }
        return ip;
    }

};