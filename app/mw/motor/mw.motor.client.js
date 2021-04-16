var http = require('../http')

const AUTOAPI = '/auto/api'
const MOTORAPI = '/aotg/motor/api'

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
  }
  // testget (payload) {
  //   return http.post('http://192.168.112.100/WebAPI/MiddlewareAPI/SearchProduct', payload)
  // }
}

module.exports = {...listing_client, ...quote_client}