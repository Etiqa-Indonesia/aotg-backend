var axios = require('axios')
var config = require("../config/mw.config")

const instance = axios.create({
  baseURL: config.baseUrl,
  timeout: config.clientTimeout
})

console.log('Connecting to MW on baseUrl: ' 
  + config.baseUrl + ' on NODE_ENV: ' 
  + process.env.NODE_ENV)

instance.interceptors.request.use(function (config) {
  console.log('REQ_INTERCEPT', config.url)
  return config
}, function (error) {
  console.log('REQ_ERR_INTERCEPT', error)
  return Promise.reject(error);
})
instance.interceptors.response.use((response) => {
  // console.log('RES_INTERCEPT', response)
  return response
}, (error) => {
  // console.log('RES_ERR_INTERCEPT', error.response.data)
  return Promise.reject(error)
})

const client = {
  get (url) {
    return instance.get(url).catch(error => { throw error })
  },
  post (url, payload, headers) {
    return instance.request({
      url: url,
      method: 'post',
      data: payload,
      headers: (headers) ? headers : {'Content-Type': 'application/json'}
    }).catch(error => { throw error })
  },
  put (url, payload) {
    return instance.request({
      url: url,
      method: 'put',
      data: payload,
      headers: {'Content-Type': 'application/json'}
    }).catch(error => { throw error })
  }
}

module.exports = client
