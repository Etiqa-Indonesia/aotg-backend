const config = {
    /*
    Arbitrary - TODO should use env variable
    */
    secret: 'f0c86c46-616a-4e15-8ac7-e12edc6ec448',
    /*
    address of MW Rest API
    */
    baseUrl: process.env.NODE_ENV === 'production' ? 'http://MWHOST' : 'http://MWHOST',
    //baseUrl: 'http://192.168.112.88:8353',
    //baseUrl: 'http://MWHOST:8353',
    //baseUrl: 'http://localhost:8353',
    /*
    local Axios timeout (in ms)
    */
    clientTimeout: 20000,
    /*
    cache listing data so no need to call MW (in ms)
    */
    cacheDuration: '60 days',
    /*
    age of JWT token (in ms) - 15 minutes
    */
    tokenExpiresIn: 900000,
    /*
    age of blacklisted JWT (in s) - 15 minutes
    must not be less than 'tokenExpiresIn'
    */
    redisKeyExpiry: 900,
    /*
    prefix to be used as key in Redis to blacklist JWT
    */
    blQqKeyPrefix: 'BL-MT.'
  }
  
  module.exports = config
  