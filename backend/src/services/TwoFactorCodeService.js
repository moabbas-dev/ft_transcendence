const TwoFactorCode = require('../models/TwoFactorCode');

class TwoFactorCodeService {

    static async createTwoFactorCode({ userId, code }) {
        return await TwoFactorCode.create({ userId, code });
    }

    static async getAllCodes() {
        return await TwoFactorCode.getAll();
    }

    static async getCodeById(id) {
        return await TwoFactorCode.getById(id);
    }

    static async deleteCode(id) {
        return await TwoFactorCode.delete(id);
    }
}

module.exports = TwoFactorCodeService;