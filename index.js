const Storage = require('./storage');

module.exports = class FCMMiddleware{
    constructor(pattern, patternRulesList, storageConfig) {
        this.pattern = pattern;
        this.patternRulesList = patternRulesList;
        this.storage = new Storage(storageConfig);
    }



    async handle(req, res, next) {
        for (let patternRules of this.patternRulesList) {
            let pattern = new RegExp(patternRules.pattern);
            console.log(pattern.test(req.api.name));
            if (pattern.test(req.api.name)) {
                for (let rule of patternRules.rules) {
                    try {
                        await rule.do(req, this.storage);
                    } catch (err) {
                        if (err.code == 'ECONNREFUSED') {
                            logger.error(err);
                        } else {
                            throw err;
                        }
                    }
                }
            }
        }
        next();
    }
};