'use strict'

var fs = require('fs')
var get = require('simple-get')
var cloudinary = require('cloudinary').v2
var runLimit = require('run-parallel-limit')
var mkdirp = require('mkdirp')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY
})

// Start process
fetchResources(false)

function fetchResources(next_cursor) {
  let options = {
    max_results: 500,
    type: 'upload',
  }

  if (next_cursor) {
    options.next_cursor = next_cursor
  }

  cloudinary.api.resources(options, function (error, result) {
    let urls = result.resources.map(img => {
      return img.url
    })

    downloadImages(urls)

    if (result.next_cursor) {
      return fetchResources(result.next_cursor)
    }
  })
}

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
      console.log(`Batch done! Images written to ${__dirname}/images`)
    })
  })
}
