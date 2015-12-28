Cloudinary export is simple a script that allows you to export/download all of your images from cloudinary

### Installation
  `npm install`

  After you have all of the dependencies, create a file named `config.js`

  ```
  // Config.js

  module.exports = {
    "public": "CLOUDINARY_PUBLIC_KEY",
    "secret": "CLOUDINARY_SECRET_KEY",
    "cloud": "COMPANY_OR_SITE_NAME"
  }
  ```

All of that information is viewable in your settings over [here](https://cloudinary.com/console/settings/account)  

Once you have the `config.js` you're ready to go, simply run the following command

`npm run export`  

After that is complete all of your images will be the newly created `/images` folder