const reportRepository = require('../repositories/report.repository');

class ReportService {
    async getUsersForReport() {
        return await reportRepository.getUsersForReport();
    }
}

module.exports = new ReportService();
