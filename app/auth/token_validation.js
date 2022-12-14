const { verify , sign} = require("jsonwebtoken");
const dbkey = require("../config/db.config")
const { getUserToken } = require('../services/user.service')
const https = require('../mw/http')
const { updateToken } = require('../services/user.service')
const { encrypt, encryptjs } = require('../auth/encrypt')


module.exports = {
    checktoken: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);
            verify(token, dbkey.key, (err, decode) => {
                if (err) {
                    res.status(200).send({
                        success: 400,
                        message: "Invalid or Expired Token"
                    });
                }
                else {
                    next();
                }

            })
        } else {
            res.status(200).send({
                success: 400,
                message: "Access Denied Unauthorized User"

            });
        }

    },
    validatetoken: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);

            verify(token, dbkey.key, async (err, authData) => {
                if (err && err.message === 'jwt expired') {
                    return res.status(200).send({
                        success: 400,
                        message: "Token Expired",

                    })
                }
                if (!authData) {
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token",

                    })
                }
                const output = await getUserToken(authData.UserName)
                if (output.SessionID === token)
                    next()
                else {
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token",

                    })

                }
            })
        } else {
            res.status(200).send({
                success: 400,
                message: "Access Denied Unauthorized User"

            });
        }

    },
    refreshtoken: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);
            verify(token, dbkey.key, async (err, authData) => {
                if (err && err.message === 'jwt expired') {
                    return res.status(200).send({
                        success: 400,
                        message: "Token Expired, Please Login Again",

                    })
                }
                if (!authData) {
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token",

                    })
                }
                const output = await getUserToken(authData.UserName)
                if (output.SessionID === token) {
                    const expiresIn = 15

                    const jsontoken = sign({ UserName: authData.UserName, UserID: authData.UserID }, dbkey.key, {
                        expiresIn: `${expiresIn}minutes`
                    });
                    await updateToken(authData.UserName,jsontoken)
                    return res.status(200).send({
                        success: 200,
                        message: "Success Refresh Token",
                        token: jsontoken
                    })

                }
                else {
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token"
                    })
                }
            })
        } else {
            res.status(200).send({
                success: 400,
                message: "Access Denied Unauthorized User"

            });
        }

    },
    validateCaptcha: async (req, res, next) => {
        const recaptchaToken = req.body.RecaptchaToken
        if (!recaptchaToken) {
            return res.status(200).send({
                success: false,
                message: "Re Captcha Token canot be null"

            });
        }
        const secretKey = dbkey.keyCaptcha;
        const userIp = dbkey.domainKey;

        const Result = await https.get(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}&remoteip=${userIp}`)

        if (Result.data.success === false) {
            return res.status(200).send({
                success: false,
                message: "Recaptcha token validation failed"

            });
        }
        next();

    },
    keyReturnCaptcha: async (key) => {
        // const CaptchaKey = req.params.captchakey
        const Encryptkey = encryptjs(key)
        return Encryptkey
    }
}

