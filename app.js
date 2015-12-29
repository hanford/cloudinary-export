'use strict'

var fs = require('fs')
var get = require('simple-get')
var cloudinary = require('cloudinary')
var runLimit = require('run-parallel-limit')
var mkdirp = require('mkdirp')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY
})

cloudinary.api.resources(function (result) {
  let urls = result.resources.map(img => {
    return img.url
  })

  downloadImages(urls)
}, {type: 'upload', max_results: '500'})

function downloadImages (urls) {
  mkdirp('./images', function (err) {
    if (err) return console.error('Error creating images directory', err)

    runLimit(urls.map(function (url) {
      return function (callback) {
        let filename = url.split('/')[url.split('/').length - 1]

        get(url, function (err, res) {
          if (err) return console.error('error requesting', err)

          var stream = res.pipe(fs.createWriteStream(`./images/${filename}`, {defaultEncoding: 'binary'}))

          stream.on('finish', function () {
            console.log(`Added => ${filename}`)
            return callback(null, url)
          })
        })
      }
    }), 10, function (err) {
      if (err) return console.error(err)
      console.log(`Done! All images written to ${__dirname}/images`)
    })
  })
}
