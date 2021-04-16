const crypto = require('crypto')
// var CryptoJS = require('crypto-js');
// var forge    = require('node-forge');
// var utf8     = require('utf8');
const {publickey,privatekey} = require('../config/db.config')
const md5 = text => {
  return crypto
    .createHash('md5')
    .update(text)
    .digest();
}
const encrypt3DES = {
    encrypt3DES(data, key) {
        const md5Key = crypto.createHash('md5').update(key).digest("hex").substr(0, 24);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('des-ede3', md5Key, '');
        // cipher.setAutoPadding(true)
      
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
      }
}

const decrypt3DES = {
    decrypt3DES(data, key) {
        const md5Key = crypto.createHash('md5').update(key).digest("hex").substr(0, 24);
        const decipher = crypto.createDecipheriv('des-ede3', md5Key, '');
      
        let encrypted = decipher.update(data, 'base64', 'utf8');
        encrypted += decipher.final('utf8');
        return encrypted;
      }
}

// const encrypt3DES2 = {
//   encrypt3DES2(data, key) {
//     key          = CryptoJS.MD5(utf8.encode(key)).toString(CryptoJS.enc.Latin1);
//     key          = key + key.substring(0, 8); 
//     var cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
//     cipher.start({iv:''});
//     cipher.update(forge.util.createBuffer(data, 'utf-8'));
//     cipher.finish();
//     var encrypted = cipher.output; 
//     return ( forge.util.encode64(encrypted.getBytes()) );
//     }
// }

  module.exports = {...encrypt3DES, ...decrypt3DES}