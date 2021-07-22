const crypto = require('crypto');
const dbConfig = require('../config/db.config');
const config = require('../config/db.config')

exports.encrypt = (text) => {
    const cipher = crypto.createCipheriv(dbConfig.ALGO, Buffer.from(dbConfig.KEY), dbConfig.IV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}


exports.decrypt = (text) => {
    const encryptedText = Buffer.from(text, 'hex');
    const decipher = crypto.createDecipheriv(dbConfig.ALGO, Buffer.from(dbConfig.KEY), dbConfig.IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
