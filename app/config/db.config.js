module.exports = {
    HOST: process.env.NODE_ENV === 'production' ? 'a5943d6acaf3134c8ae41b043c0a234e' : 'a5943d6acaf3134c8ae41b043c0a234e', 
    USER: process.env.NODE_ENV === 'production' ? '29d7046125904d4cc5a95ead0679824c' : '29d7046125904d4cc5a95ead0679824c',
    PASSWORD: process.env.NODE_ENV === 'production' ? 'd4cf75f3938d4a62d83b7c3a554ecf62' : 'd4cf75f3938d4a62d83b7c3a554ecf62',
    DB: process.env.NODE_ENV === 'production' ? 'c29f9627ec036de0b6c41186c4b0edc5' : 'c29f9627ec036de0b6c41186c4b0edc5',
    dialect: "mariadb",
    pool: {
        max: 5, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
    },

    key: "E58740943C7A4A8C40463BA00C2132B6A6131FB832F2F32FC738EA4B62CD4249", //key is keys
    // privatekey: "3A7A616F48A944A5",
    // publickey: "FEF492B8A11CE69B",
    // frontView_Upload :'/home/etiqa/eii_dsp/uploaded_chassis'
    motorproductid: "0201",
    saveUserCareURl: "http://192.168.112.100/WebAPI/MiddlewareAPI/SaveSysUser",
    savePolicyCareURL: "http://192.168.112.100/WebAPI/MiddlewareAPI/SavePolicy",
    submitPolicyCareURL: "http://192.168.112.100/WebAPI/MiddlewareAPI/SubmitPolicy",
    efilePolicyCareURL: "http://192.168.112.100/WebAPI/MiddlewareAPI/EFile",

    // mailHost: "smtp.gmail.com",
    // mailPort: 5887,
    // mailSecure: false,
    // mailUser : 'etiqanoreply@gmail.com',
    // mailPass : '2WSX3edc',

    mailHost: "esa.etiqa.co.id",
    mailPort: 25,
    mailSecure: false,
    mailUser: 'aotgnoreply@etiqa.co.id',
    mailPass: '2WSX3edc',

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

};