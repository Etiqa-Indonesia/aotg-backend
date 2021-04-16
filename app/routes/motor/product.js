var router = require('express').Router()
var MwClient = require('../../mw/motor/mw.motor.client')

router.get('/', (req, res, next) => {
  MwClient.fetchProducts()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/:product_id/coverages', (req, res, next) => {
  MwClient.fetchCoverages(req.params.product_id)
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})

router.get('/:product_id/coverages/:coverage_id/coverage_details', (req, res, next) => {
  MwClient.fetchCoverages(req.params.product_id, req.params.coverage_id)
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})

module.exports = router
