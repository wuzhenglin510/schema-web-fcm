module.exports = class SessionRule{

    constructor(limitPeriod, maxTimes, freezeTime) {
        this.limitPeriod = limitPeriod;
        this.maxTimes = maxTimes;
        this.freezeTime = freezeTime;
    }

    async do(req, storage) {
        let sessionId = this.extractSessionId(req);
        if (sessionId != '') {
            let key = `${sessionId}_${req.api.name}`;
            console.log(key);
            let count = await storage.get(key);
            if (count < 0) { //已被冻住
                    throw new Error(`SessionId频率限制, SessionId: ${sessionId}, 请求接口: ${req.api.name}`);
            } else if (count > this.maxTimes) {
                await storage.freeze(key, this.freezeTime);
            } else {
                await storage.add(key, Date.parse(new Date()), this.limitPeriod);
            }
        }
    }

    extractSessionId(req) {
        return req.api.payload.state['sessionId'] || '';
    }
};