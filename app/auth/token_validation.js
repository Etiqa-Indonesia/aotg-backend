const { verify } = require("jsonwebtoken");
const dbkey = require("../config/db.config")
const {getUserToken} = require('../services/user.service')

module.exports= {
    checktoken : (req, res, next) => {
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
                else{
                   next(); 
                }

            })
        }else{
            res.status(200).send({
                 success: 400,
                 message: "Access Denied Unauthorized User"

             });
        }

    },
    validatetoken : (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);
            
            verify(token, dbkey.key, async (err, authData) => {
                if (err && err.message === 'jwt expired'){
                    return res.status(200).send({
                        success: 400,
                        message: "Token Expired",
                
                    })
                } 
                if (!authData){
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token",
                
                    })
                } 
                const output = await getUserToken(authData.UserName)
                if (output.SessionID === token)
                    next()
                else{
                    return res.status(200).send({
                        success: 400,
                        message: "Invalid Token",
                
                    })
        
                }
            })
        } else{
            res.status(200).send({
                 success: 400,
                 message: "Access Denied Unauthorized User"

             });
        }

    }
}

