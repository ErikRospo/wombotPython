/* eslint-disable no-constant-condition */
const Rest = require('./rest.js')
const identify = require('./identify.js')
const download = require('./download.js')
const mkdirp = require('mkdirp')
const path = require('path');
const { writeFile, writeFileSync } = require('fs');

let paintRest = new Rest('paint.api.wombo.ai', 100)
let imagePaintRest = new Rest('www.wombo.art', 100)

/**
 * @param {string} prompt
 * @param {number} style
 * @param {function} updateFn
 * @param {object} settings
 * @param {object} inputImage
 * @param {string} photoDownloads
 * @param {string} _prefix
 * @returns {object} task
 */
module.exports.task = async function runTask (
  prompt,
  style,
  // eslint-disable-next-line no-empty-function
  updateFn = () => {},
  settings = {},
  inputImageArg = {},
  _prefix = ''
) {
  let { final = true, inter = false, downloadDir = './generated/' } = settings
  let {
    inputImage = false,
    mediaSuffix = null,
    imageWeight = 'HIGH'
  } = inputImageArg
  let id
  let prefix = _prefix
  try {
    id = await identify()
  } catch (err) {
    console.error(err)
    throw new Error(
      `Error while sending prompt:\n${err.toFriendly
        ? err.toFriendly()
        : err.toString()}`
    )
  }
  let mediastoreid
  if (inputImage) {
    imagePaintRest.customHeaders = {
      Authorization: 'bearer ' + id,
      Origin: 'https://app.wombo.art',
      Referer: 'https://app.wombo.art/',
      'Cache-control': 'no-cache',
      'Sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      Pragma: 'no-cache',
      Accept: '*/*',
      'Accept-encoding': 'gzip, deflate, br',
      'Accept-language': 'en-US,en;q=0.9',
      'Aontent-type': 'text/plain;charset=UTF-8'
    }
    let created = Date.now()
    let expire = Date.now() + 960000

    imagePaintRest.cookies[
      '_dd_s'
    ] = `rum=1&id=323368bd-45a7-4b9d-acf2-89cd59a16777&created=${created}&expire=${expire}`
    let paintRestPayload = `{"image":"${inputImage}","media_suffix":"${mediaSuffix}","num_uploads":1}`
    let res = await imagePaintRest.post('/api/mediastore', paintRestPayload)
    mediastoreid = res.mediastore_uid
  }
  paintRest.customHeaders = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,en-GB-oxendict;q=0.8,en-AU;q=0.7",
    "authorization": `bearer ${id}`,
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-app-version": "WEB-1.90.1",
    "Referer": "https://app.wombo.art/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "origin":"https://app.wombo.art/"
  },

  updateFn({
    state: 'authenticated',
    id
  })

  let task
  let taskPath
  try {
//     fetch("https://paint.api.wombo.ai/api/tasks/86c5f074-f733-45a3-80af-bfa0d1ad28d2", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9,en-GB-oxendict;q=0.8,en-AU;q=0.7",
//     "authorization": "bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImVkNmJjOWRhMWFmMjM2ZjhlYTU2YTVkNjIyMzQwMWZmNGUwODdmMTEiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9wYWludC1wcm9kIiwiYXVkIjoicGFpbnQtcHJvZCIsImF1dGhfdGltZSI6MTY2MjE4MjUxOSwidXNlcl9pZCI6ImtnRnd4MURwTW1UN1c4OWswN1p0TzFoYTZmbjIiLCJzdWIiOiJrZ0Z3eDFEcE1tVDdXODlrMDdadE8xaGE2Zm4yIiwiaWF0IjoxNjYyNDExMDQ5LCJleHAiOjE2NjI0MTQ2NDksImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.gHPKGmyRPvBuZM5RBFPbxGPQDH3XixcfRVCsaHaKGx94dt85rrf6_sDQj5FyW0LM8XTct7Ao2zIeKzlZf3SnIMVLOZQBTf8_GXt42eqoDy4r8b1wInLaaakyPiPQOlfwojBiAF2Id2_70aa9iZZZIeUKhKaF57KHl_o1D3yeJdHFJvjs9gbA_eqS57XJt13Md7MhzaZW00FijXPat-rwHgYQTngb-CU1md8RMJRxpyCFa-881mJ0jpxAwrfQEozo1GmOURYTzKPRHxAgyB7_Xr-KxsdnsnsVvivZQpy9TY-2S7K4wNOwDGOdQzzrJtnffBSzJiFf2G5bhdV7-dS2Dw",
//     "cache-control": "no-cache",
//     "pragma": "no-cache",
//     "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site",
//     "x-app-version": "WEB-1.90.1",
//     "Referer": "https://app.wombo.art/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });
    task = await paintRest.post('/api/tasks/', { premium: false },"POST",{"content-type":"text/plain;charset=utf-8"})
    taskPath = '/api/tasks/' + task.id
  } catch (err) {
    console.log(err)
    return await runTask(prompt, style, updateFn, settings, inputImage)
  }

  updateFn({
    state: 'allocated',
    id,
    task
  })

  let inputObject = {
    // eslint-disable-next-line camelcase
    input_spec: {
      // eslint-disable-next-line camelcase
      display_freq: 10,
      prompt,
      style: +style
    }
  }

  if (inputImage) {
    // eslint-disable-next-line camelcase
    inputObject.input_spec.input_image = {
      // eslint-disable-next-line camelcase
      weight: imageWeight,
      // eslint-disable-next-line camelcase
      mediastore_id: mediastoreid
    }
  }
  let ti = 1000
  //console.log(`https://${paintRest.hostname}${taskPath}`)
  while (!task) {
    try {
      task = await paintRest
        .options(taskPath, 'PUT')
        .then(() => paintRest.put(taskPath, inputObject,{"content-type":"text/plain;charset=utf-8"}))
      updateFn({
        state: 'submitted',
        id,
        task
      })
    } catch (error) {
      updateFn({
        state: 'error',
        id,
        task,
        message: error.toFriendly(),
        times: ti
      })
      ti *= 2
      await new Promise(res => setTimeout(res, ti))
    }
  }
  // eslint-disable-next-line no-undefined
  let interDownloads = []
  let interPaths = []
  let interFinished = []
  while (task.result===null) {
    try {
      task = await paintRest.get(taskPath, 'GET')
        
      //console.log(task.state)
    } catch (err) {
      console.log('Error while getting task')
    }
    // if (task.state === "pending") console.warn("Warning: task is pending");
    if (inter) {
      await mkdirp(`${downloadDir}/`)
      for (let n = 0; n < task.photo_url_list.length; n++) {
        if (interDownloads[n] || /\/final\.je?pg/i.exec(task.photo_url_list[n])) { continue }

        interPaths[n] = path.join(downloadDir, `${n}.jpg`)

        interDownloads[n] = download(
          task.photo_url_list[n],
          interPaths[n]
        ).then(() => {
          return (interFinished[n] = interPaths[n])
        })
      }
    }

    updateFn({
      state: 'progress',
      id,
      task,
      inter: interFinished
    })
    await new Promise(res => setTimeout(res, 1000))
  }
  updateFn({
    state: 'generated',
    id,
    task,
    url: task.result.final,
    inter: interFinished
  })
  let downloadPath
  if (!inter) {
    downloadPath = downloadDir + '.jpg'
  }
  try {
    let downloaded = !final
    while (!downloaded) {
      await download(task.result.final, downloadPath)
        .catch(() => {
          console.log('Error while downloading final image')
          downloaded = false
        })
        .then(() => {
          downloaded = true
        })
    }
    if (inter) await Promise.all(interDownloads)
  } catch (err) {
    console.log(prefix)
    console.error(err)
    throw new Error(
      `Error while downloading results:\n${err.toFriendly
        ? err.toFriendly()
        : err.toString()}`
    )
  }
  console.assert(task.result != null, `${prefix} task result is none:`)
  updateFn({
    state: 'downloaded',
    id,
    task,
    url: task.result.final,
    path: final ? downloadPath : null,
    inter: interFinished
  })

  return {
    state: 'downloaded',
    id,
    task,
    url: task.result.final,
    path: final ? downloadPath : null,
    inter: interFinished
  }
}

module.exports.styles = require('./styles.js')
module.exports.download = require('./download.js')
