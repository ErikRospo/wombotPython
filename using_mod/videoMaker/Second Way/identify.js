const Rest = require('./rest.js')
const fs = require('fs')
const path = require('path')
const SECRET_PATH = path.join(path.dirname(__filename), 'secret.json')

let identifyHostname = 'identitytoolkit.googleapis.com'
let identifySecretKey = 'AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw'

if (fs.existsSync(SECRET_PATH)) {
  let secret = JSON.parse(fs.readFileSync(SECRET_PATH, 'utf8'))

  if (secret.identify_key) identifySecretKey = secret.identify_key
  if (secret.identify_hostname) identifyHostname = secret.identify_hostname
}

let identifyRest = new Rest(identifyHostname)

let identifyCache
function identify (identifyKey) {
  if (!identifyKey) {
    if (identifySecretKey) {
      identifyKey = identifySecretKey
    } else {
      throw new Error('No identify key provided and no secret.json found!')
    }
  }

  // eslint-disable-next-line no-unused-vars, no-async-promise-executor
  return new Promise(async (resolve, _reject) => {
    let res = await identifyRest.post(
      '/v1/accounts:signUp?key=' + identifyKey,
      {
        key: identifyKey
      }
    )
    // console.log(res)
    identifyCache = res.idToken
    resolve(identifyCache)
  })
}

module.exports = identify
