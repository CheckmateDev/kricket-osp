Kricket Meteor App

This is to help refugees!

/*  */

In order to make Kricket administration working :
- Install brew channel (http://brew.sh/)
- Install graphicsmagick & imagemagick
$ brew install graphicsmagick
$ brew install imagemagick



## Getting started

If you want to make push notification working (raix/push package : https://github.com/raix/push), add a config.push.json file with content :
```js{
  "apn": {
  "passphrase": "aPassphrase",
  "key": "pushKeyFile.pem",
  "cert": "pushCertFile.pem"
},
  "gcm": {
    "apiKey": "longApiKeyyyyyyyyyyyyyyyy",
    "projectNumber": 00000000000000
  },
  "production": true,
  "sound": true,
  "vibrate": true,
  "alert": true,
  "badge": true
}
```
Refering to [raix/push](https://github.com/raix/push#getting-started) Fill passphrase, key, cert, apiKey, projectNumber


/* TO BE CONTINUED */