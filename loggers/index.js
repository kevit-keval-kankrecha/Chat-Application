const { createLogger, format, transports } = require('winston');
require('winston-mongodb');

const customFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp}  ${level}: ${message}`;
});

const logConfiguration = {
    'transports': [
        new transports.MongoDB({
            db: 'mongodb+srv://kevalkankrecha:CnOqK1fOYXLcRSet@cluster0.lkvxgrr.mongodb.net/AllChatApplicationLogReport',
            collection: 'log_report',
            storeHost: true,
            useUnifiedTopology: true
        })
    ],
    format: format.combine(
        format.timestamp(),
        customFormat
    )
};

module.exports = createLogger(logConfiguration);