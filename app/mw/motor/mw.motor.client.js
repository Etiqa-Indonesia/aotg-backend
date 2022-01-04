var http = require('../http')

const AUTOAPI = '/auto/api'
const MOTORAPI = '/aotg/motor/api'
const AOTG = '/aotg'

const listing_client = {
  fetchProducts () {
    return http.get('/products')
  },
  fetchCoverages (product_id) {
    return http.get(`/products/${product_id}/coverages`)
  },
  fetchCoverageDetails (product_id, coverage_id) {
    return http.get(`/products/${product_id}/coverages/${coverage_id}/coverage_details`)
  },
  fetchCountries () {
    return http.get(`${AUTOAPI}/countries`)
  },
  fetchRegions () {
    return http.get(`${AUTOAPI}/regions`)
  },
  fetchVehicleBrands () {
    return http.get(`${AUTOAPI}/vehicles/brands`)
  },
  fetchVehicleModels (brand_id) {
    return http.get(`${AUTOAPI}/vehicles/brands/${brand_id}/models`)
  },
  fetchVehicleTypes (brand_id, model_id) {
    return http.get(`${AUTOAPI}/vehicles/brands/${brand_id}/models/${model_id}/types`)
  },
  fetchCharities () {
    return http.get(`${AUTOAPI}/charities`)
  },
  fetchManufactureYears () {
    return http.get(`${AUTOAPI}/vehicles/manufacture_years`)
  },
  fetchProvince () {
    return http.get(`https://dev.farizdotid.com/api/daerahindonesia/provinsi`)
  }
}

const quote_client = {
  quickPremium (payload) {
    return http.post(`${MOTORAPI}/quotes/calculate_inaccurate_premium`, payload)
  },
  calculatePremium (payload) {
    return http.post(`${MOTORAPI}/quotes/calculate_premium`, payload)
  },
  saveSysUser (payload) {
    const data = http.post(`${AOTG}/save_sys_user`, payload)
    return data
  },
  savePolicy (payload) {
    const data = http.post(`${AOTG}/save_policy`, payload)
    return data
  },
  submitPolicy (payload) {
    const data = http.post(`${AOTG}/submit_policy`, payload)
    return data
  },
  eFIle (payload) {
    const data = http.post(`${AOTG}/efile`, payload)
    return data
  },
  GetAno (payload) {
    const data = http.post(`${AOTG}/searh_policy_stored`, payload)
    return data
  },
  GetPolicyDetail (payload) {
    const data = http.post(`${AOTG}/search_policy_detail_stored`, payload)
    return data
  },
  UploadARBucket (payload) {
    const data = http.post(`${AOTG}/upload_ar_bucket`, payload)
    return data
  }
  // testget (payload) {
  //   return http.post('http://192.168.112.100/WebAPI/MiddlewareAPI/SearchProduct', payload)
  // }
}

module.exports = {...listing_client, ...quote_client}