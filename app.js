'use strict'

var fs = require('fs')
var request = require('request')
var cloudinary = require('cloudinary')
var runLimit = require('run-parallel-limit')
var mkdirp = require('mkdirp')

var config = require('./config.js')

var hasImageUrls

fs.access(__dirname + '/imageUrls.json', fs.F_OK, function (error) {
  if (error) {
    hasImageUrls = false
  } else {
    hasImageUrls = require('./imageUrls.json')
  }
})

cloudinary.config({
  cloud_name: config.cloud,
  api_key: config.public,
  api_secret: config.secret
})

if (!hasImageUrls) {
  cloudinary.api.resources(function (result) {
    let urls = result.resources.map(img => {
      return img.url
    })

    fs.writeFile('./imageUrls.json', JSON.stringify(urls), function (error) {
      if (error) {
        console.log('Error!', error)
      }

      console.log(`Saved ${result.resources.length} image urls`)
      hasImageUrls = urls
      downloadImages()
    })
  }, {type: 'upload', max_results: '500'})
} else {
  downloadImages()
}

function downloadImages () {
  mkdirp('./images', function (error) {
    if (error) {
      return console.error('Error creating images directory')
    }

    runLimit(hasImageUrls.map(function (url) {
      return function (callback) {
        let filename = url.split('/')[url.split('/').length - 1]
        console.log(filename)
        request(url, {encoding: 'binary'}, function (error, response, body) {
          if (error) {
            return console.log('error requesting', error)
          }

          fs.writeFile('./images/' + filename, body, 'binary', function (error) {
            if (error) {
              return console.log('error writing', error)
            }
          })
        })
        callback(null, url)
      }
    }), 10, function (err) {
      if (err) {
        console.error(err)
      } else {
        console.log(`All request sent, writing image files to ${__dirname}/images`)
      }
    })
  })
}
