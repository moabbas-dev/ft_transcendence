const TwoFactorCodeService = require('../services/TwoFactorCodeService');

class TwoFactorCodeController {

    static async getAllCodes(request, reply) {
        try {
            const codes = await TwoFactorCodeService.getAllCodes();
            reply.code(200).send(codes);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting all the codes!', error: err.message });
        }
    }

    static async getCodeById(request, reply) {
        const { id } = request.params;
        try {
            const code = await TwoFactorCodeService.getCodeById(id);
            if (!code) reply.code(404).send({ message: 'Code not found!' });
            else reply.code(200).send(code);
        } catch (err) {
            reply.code(500).send({ message: 'Error getting the code!', error: err.message });
        }
    }

    static async deleteCode(request, reply) {
        const  { id } = request.params;
        try {
            const changes = await TwoFactorCodeService.deleteCode(id);
            if (changes == 0) reply.code(404).send({ message: 'Code not found!' });
            else reply.code(200).send({ message: 'Code deleted successfully!' });
        } catch (err) {
            reply.code(500).send({ message: 'Error deleting the code!', error: err.message });
        }
    }
}

module.exports = TwoFactorCodeController;