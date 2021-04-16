const { verify } = require("jsonwebtoken");
const dbkey = require("../config/db.config")

module.exports= {
    checktoken : (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            token = token.slice(7);
            verify(token, dbkey.key, (err, decode) => {
                if (err) {
                    res.json({
                        success: 0,
                        message: "Invalid Token"
       
                    });
                }
                else{
                   next(); 
                }

            })
        }else{
             res.json({
                 success: 0,
                 message: "Access Denied Unauthorized User"

             });
        }

    }
}