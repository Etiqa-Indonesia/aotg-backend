const router = require('express').Router()
const MwClient = require('../../mw/motor/mw.motor.client')
const config = require('../../config/mw.config')
const {publickey,privatekey} = require('../../config/db.config')
const {decrypt3DES, encrypt3DES, encrypt3DES2} = require('../../auth/tripledes')


router.post('/calculate-premium', (req, res, next) => {
    MwClient.calculatePremium(req.body)
      .then(({ data }) => res.json(data))
      .catch(err => { next(err) })
  })

router.post('/quick-premium', (req, res, next) => {
    MwClient.quickPremium(req.body)
      .then(({ data }) => {
        res.json(data)
      })
      .catch(err => { next(err) })
  })
router.post('/test', (req, res, next) => {

    const test = JSON.stringify(req.body)
    
    const Data = encrypt3DES2(test , privatekey)
    console.log(Data);
    var stringToMatch = 'DYSLCgSERhYExoNqO71mOp+qw0GLTSaH';

    if (Data.toString() != stringToMatch) console.log("Encrypted string not generated correctly.");


    // const A = {'Data': Data,
    //             'Xpublic' : publickey}
    // MwClient.testget(A)
    //   .then(({ data }) => res.json(data))
    //   .catch(err => { next(err) })
  })

module.exports = router