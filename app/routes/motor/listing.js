const router = require('express').Router()
const MwClient = require('../../mw/motor/mw.motor.client')
const apicache = require('apicache')
// const cache = apicache.middleware
const config = require('../../config/mw.config')
const redis = require('redis')
const { findRateCode, findTopro,findRateCodeMaxSI } = require('../../services/rate.service')
let redisCache = apicache.options({ redisClient: redis.createClient() }).middleware

router.get('/countries', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchCountries()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/regions', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchRegions()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/vehicles/brands', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchVehicleBrands()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/vehicles/brands/:brand_id/models', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchVehicleModels(req.params.brand_id)
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/vehicles/brands/:brand_id/models/:model_id/types', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchVehicleTypes(req.params.brand_id, req.params.model_id)
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/charities', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchCharities()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/vehicles/manufacture_years', redisCache(config.cacheDuration), async (req, res, next) => {
  await MwClient.fetchManufactureYears()
    .then(({ data }) => res.json(data))
    .catch(err => { next(err) })
})
router.get('/vehicles/test', (req, res, next) => {
  res.send('hora')
})

router.get('/vehicles/:AgentType',redisCache(config.cacheDurationListingNew), async (req, res, next) => {
  

  const ToproList = await findTopro(req.params.AgentType);
  const RateCodeMaxSI = await findRateCodeMaxSI(req.params.AgentType);
  const RateList = await findRateCode(req.params.AgentType);

  let coverageComprCare = null;
  let coverageTLOCare = null;

  if (ToproList[0].Topro) {
    coverageComprCare = await MwClient.fetchCoverageDetails('0201',ToproList[0].Topro)
  }
  else{
    coverageComprCare = await MwClient.fetchCoverageDetails('0201','MOTO-COMPR')
  }

  if (ToproList[1].Topro) {
    coverageTLOCare = await MwClient.fetchCoverageDetails('0201',ToproList[1].Topro)
  }
  else{
    coverageTLOCare = await MwClient.fetchCoverageDetails('0201','MOTO-TLO')
  }

  let [regions, products] = [
    await MwClient.fetchRegions(),
    await MwClient.fetchProducts()
  ]
 

  const RateComprFix = [];
  const RateTLOFix = [];

  const CoverageCompr = coverageComprCare.data;
  for (let i = 0; i < CoverageCompr.length; i++) {
    for (let j = 0; j < RateList.length; j++) {
      if (CoverageCompr[i].code == RateList[j].RateCode) {
        RateComprFix.push(CoverageCompr[i])
      }
    }
  }

  const CoverageTLO = coverageTLOCare.data;
  for (let i = 0; i < CoverageTLO.length; i++) {
    for (let j = 0; j < RateList.length; j++) {
      if (CoverageTLO[i].code == RateList[j].RateCode) {
        RateTLOFix.push(CoverageTLO[i])
      }
    }
  }

  const ToproFix = []

  for (let i = 0; i < ToproList.length; i++) {
    // if (ToproList[i].Topro == 'MOTO-COMPR') {
    //   const ToproDesc = ToproList[i].Topro
    //   ToproFix.push(ToproDesc);
    // }
    // if (ToproList[i].Topro == 'MOTO-TLO') {
    //   const ToproDesc = ToproList[i].Topro
    //   ToproFix.push(ToproDesc);
    // }

      // const ToproDesc = ToproList[i].Topro
      const ToproDesc = {
        Topro :ToproList[i].Topro,
        Description : ToproList[i].Description
      }
      ToproFix.push(ToproDesc);
  }

  let lists = {
    products: products.data,
    regions: regions.data,
    coverages: ToproFix,
    cov_compr: RateComprFix,
    cov_tlo: RateTLOFix,
    max_si :RateCodeMaxSI
  }
  res.send(lists)
})

/* redisCache(config.cacheDuration) */
router.get('/listings/1', redisCache(config.cacheDuration), async (req, res, next) => {
  let [regions, products, coverages, coverage_compr, coverage_tlo, manufacture_years] = [
    await MwClient.fetchRegions(),
    await MwClient.fetchProducts(),
    await MwClient.fetchCoverages('0201'),
    await MwClient.fetchCoverageDetails('0201', 'MOTO-COMPR'),
    await MwClient.fetchCoverageDetails('0201', 'MOTO-TLO'),
    await MwClient.fetchManufactureYears()
  ]

  let lists = {
    products: products.data,
    regions: regions.data,
    coverages: coverages.data,
    cov_compr: coverage_compr.data,
    cov_tlo: coverage_tlo.data,
    manufacture_years: manufacture_years.data.sort((a, b) => b.description - a.description)
  }

  res.status(200).json(lists)
})
router.get('/listings/2', redisCache(config.cacheDuration), async (req, res, next) => {
  let [province, brands] = [
    // await MwClient.fetchCountries(),
    await MwClient.fetchProvince(),
    await MwClient.fetchVehicleBrands()
  ]

  let lists = {

    // charities: charities.data,
    brands: brands.data,
    province: province.data
    // countries: countries.data
  }

  res.status(200).json(lists)
})

module.exports = router
