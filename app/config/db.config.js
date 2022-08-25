module.exports = {
    HOST: process.env.NODE_ENV === 'production' ? '856e428f01a69c08d2968863e66c50bc' : '217d511ea470c0bffbc48ab8e61ef3b4', 
    USER: process.env.NODE_ENV === 'production' ? '1c47530f89d82766a48399c860d3ac20' : '29d7046125904d4cc5a95ead0679824c',
    PASSWORD: process.env.NODE_ENV === 'production' ? 'd278286520d29f3b69c615f0ab0a3bcd' : '3f967039b4df17ff297529b7e77a8279',
    DB: process.env.NODE_ENV === 'production' ? 'c29f9627ec036de0b6c41186c4b0edc5' : 'c29f9627ec036de0b6c41186c4b0edc5',

    // HOST: process.env.NODE_ENV === 'production' ? '856e428f01a69c08d2968863e66c50bc' : 'e0f2302b3106a0d0a0b5590957509f88', 
    // USER: process.env.NODE_ENV === 'production' ? '1c47530f89d82766a48399c860d3ac20' : '29d7046125904d4cc5a95ead0679824c',
    // PASSWORD: process.env.NODE_ENV === 'production' ? 'd278286520d29f3b69c615f0ab0a3bcd' : '3f967039b4df17ff297529b7e77a8279',
    // DB: process.env.NODE_ENV === 'production' ? 'c29f9627ec036de0b6c41186c4b0edc5' : '68a4ecf01060e192f6a223361f2fe83e',
    dialect: "mariadb",
    pool: {
        max: 5, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
    },

    key: "E58740943C7A4A8C40463BA00C2132B6A6131FB832F2F32FC738EA4B62CD4249", //key is keys
    keyCaptcha :"6LciDrkbAAAAAElaHKXiQnBdP2g4zgU9ib8KEjLj",
    siteKeyCaptcha : "6LciDrkbAAAAAFkcqXvi5rcbuDWJhgFOHkI_JJCm",
    domainKey :"192.168.112.113",
    // privatekey: "3A7A616F48A944A5",
    // publickey: "FEF492B8A11CE69B",
    // frontView_Upload :'/home/etiqa/eii_dsp/uploaded_chassis'
    motorproductid: "0201",
    saveUserCareURl: "https://uatmiddleware.etiqa.co.id/WebAPI//MiddlewareAPI/SaveSysUser",
    saveProfileCareURl: "https://uatmiddleware.etiqa.co.id/WebAPI//MiddlewareAPI/SaveProfile",
    savePolicyCareURL: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/SavePolicy",
    submitPolicyCareURL: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/SubmitPolicy",
    searchStorePolicy: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/SearchStoredPolicy",
    searchStoreClaim: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/SearchStoredClaim",
    searchStoreDetailPolicy: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/SearchStoredPolicy_Detail",
    efilePolicyCareURL: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/EFile",
    uploadARBucket: "https://uatmiddleware.etiqa.co.id/WebAPI/MiddlewareAPI/UploadARBucket",
    gaTrackingID : 'UA-186333861-1',

    // mailHost: "smtp.gmail.com",
    // mailPort: 587,
    // mailSecure: false,
    // mailUser : 'etiqanoreply@gmail.com',
    // mailPass : '2WSX3edc',

    mailHost: "esa.etiqa.co.id",
    mailPort: 587,
    mailSecure: false,
    mailUser: 'aotgnoreply@etiqa.co.id',
    //mailPass: '@A0tgM4il',
    mailPass: '%40A0tgM4il',

    

    // mailHost: "esa.etiqa.co.id",
    // mailPort: 25,
    // mailSecure: false,
    // mailUser: 'aotgnoreply@etiqa.co.id',
    // mailPass: '2WSX3edc',

    statusNew: "0",
    statusApprove: "1",
    statusReject: "2",
    lengthRandomUserID: 3,
    charRandom: '1234567890',

    idTYpeToDB: { "KTP": "K", "Passport": "P", "SIM": "S" },
    idTypeToResponse: { "K": "KTP", "P": "Passport", "S": "SIM" },

    subjectMailCreateQuote: "Informasi Quotation Baru",
    subjectResetPassword: "Informasi Reset Password",
    subjectUpdatePassword: "Informasi Update Password",
    linkBackOffice: "https://uatechannel.etiqa.co.id/aotg-backoffice/",
    tpl_sum_insured: 25000000,
    pa_driver_sum_insured: 5000000,
    pa_passenger_sum_insured: 5000000,
    defaultpass: '@Aotg123',
    KEY: "12345678901234567890123456789012",
    IV: "1234567890123456",
    ALGO: "aes-256-cbc",
    mailMarketing:"rhega.rofiat@etiqa.co.id,fadhla.mahesa@etiqa.co.id,febri.famuandri@etiqa.co.id ",
    limitCompre : "10",
    limitTLO :"15",
    truckType :["trailer","tronton"],
    TypeOfToproUsed :["0","6","T"],
    limitYearTruck : 3,
    merchantID : process.env.NODE_ENV === 'production' ? 'M121330' : 'M121330',
    client_key : process.env.NODE_ENV === 'production' ? 'SB-Mid-client-87r_cFlCCU2OM7vH' : 'SB-Mid-client-87r_cFlCCU2OM7vH',
    server_key : process.env.NODE_ENV === 'production' ? 'SB-Mid-server-1us8HjxohKlbUUhHsOd9iVE0' : 'SB-Mid-server-1us8HjxohKlbUUhHsOd9iVE0'

};