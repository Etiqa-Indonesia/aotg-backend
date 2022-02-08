var https = require('../http')

const AUTOAPI = '/auto/api'
const MOTORAPI = '/aotg/motor/api'
const AOTG = '/aotg'

const listing_client = {
  fetchProducts () {
    return https.get('/products')
  },
  fetchCoverages (product_id) {
    return https.get(`/products/${product_id}/coverages`)
  },
  fetchCoverageDetails (product_id, coverage_id) {
    return https.get(`/products/${product_id}/coverages/${coverage_id}/coverage_details`)
  },
  fetchCountries () {
    return https.get(`${AUTOAPI}/countries`)
  },
  fetchRegions () {
    return https.get(`${AUTOAPI}/regions`)
  },
  fetchVehicleBrands () {
    return https.get(`${AUTOAPI}/vehicles/brands`)
  },
  fetchVehicleModels (brand_id) {
    return https.get(`${AUTOAPI}/vehicles/brands/${brand_id}/models`)
  },
  fetchVehicleTypes (brand_id, model_id) {
    return https.get(`${AUTOAPI}/vehicles/brands/${brand_id}/models/${model_id}/types`)
  },
  fetchCharities () {
    return https.get(`${AUTOAPI}/charities`)
  },
  fetchManufactureYears () {
    return https.get(`${AUTOAPI}/vehicles/manufacture_years`)
  },
  fetchProvince () {
    return https.get(`https://dev.farizdotid.com/api/daerahindonesia/provinsi`)
  }
}

const quote_client = {
  quickPremium (payload) {
    return https.post(`${MOTORAPI}/quotes/calculate_inaccurate_premium`, payload)
  },
  calculatePremium (payload) {
    return https.post(`${MOTORAPI}/quotes/calculate_premium`, payload)
  },
  saveSysUser (payload) {
    const data = https.post(`${AOTG}/save_sys_user`, payload)
    return data
  },
  saveProfile (payload) {
    const data = https.post(`${AOTG}/save_profile`, payload)
    return data
  },
  savePolicy (payload) {
    const data = https.post(`${AOTG}/save_policy`, payload)
    return data
  },
  submitPolicy (payload) {
    const data = https.post(`${AOTG}/submit_policy`, payload)
    return data
  },
  eFIle (payload) {
    const data = https.post(`${AOTG}/efile`, payload)
    return data
  },
  GetAno (payload) {
    const data = https.post(`${AOTG}/searh_policy_stored`, payload)
    return data
  },
  SearchSysUser (payload) {
    const data = https.post(`${AOTG}/search_sys_user`, payload)
    return data
  },
  SearchProfile (payload) {
    const data = https.post(`${AOTG}/search_profile`, payload)
    return data
  },
  GetPolicyDetail (payload) {
    const data = https.post(`${AOTG}/search_policy_detail_stored`, payload)
    return data
  },
  UploadARBucket (payload) {
    const data = https.post(`${AOTG}/upload_ar_bucket`, payload)
    return data
  },
  SearchStoreClaim (payload) {
    const data = https.post(`${AOTG}/search_store_claim`, payload)
    return data
  }
  // testget (payload) {
  //   return http.post('http://192.168.112.100/WebAPI/MiddlewareAPI/SearchProduct', payload)
  // }
}

module.exports = {...listing_client, ...quote_client}