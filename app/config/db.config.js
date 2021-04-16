module.exports = {
    HOST: process.env.NODE_ENV === 'production' ? '192.168.111.30' : '192.168.111.30' ,
    USER: process.env.NODE_ENV === 'production' ? 'devel' : 'devel' ,
    PASSWORD: process.env.NODE_ENV === 'production' ? 'myETIQA-2021' : 'myETIQA-2021',
    DB: process.env.NODE_ENV === 'production' ? 'AOTG' : 'AOTG',
    dialect: "mariadb",
    pool: {
        max: 5, // maximum number of connection in pool
        min: 0, // minimum number of connection in pool
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
    },
    
    key :"E58740943C7A4A8C40463BA00C2132B6A6131FB832F2F32FC738EA4B62CD4249", //key is keys
    privatekey: "3A7A616F48A944A5",
    publickey : "FEF492B8A11CE69B",
    // frontView_Upload :'/home/etiqa/eii_dsp/uploaded_chassis'
    motorproductid : "0201"

    
};