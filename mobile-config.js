/*
*   mobile-config.js
*   Mobile config
*   Currently Android only definition
*/

App.info({
  id: 'co.kricket',
  name: 'Kricket',
  version: '1.5.10',
  description: 'Kricket',
  author: 'Kricket',
  email: 'tom@kricket.com',
  website: 'http://kricket.co'
});

// Set up resources such as icons and launch screens.
App.icons({
  'android_hdpi': 'mobile-configs/icons/android_hdpi.png',
  'android_xhdpi': 'mobile-configs/icons/android_xhdpi_96.png'
    // ... more screen sizes and platforms ...
  });

App.launchScreens({
    // Android
    'android_ldpi_portrait': 'mobile-configs/splash/splash-200x320.png',
    'android_mdpi_portrait': 'mobile-configs/splash/splash-320x480.png',
    'android_hdpi_portrait': 'mobile-configs/splash/splash-480x800.png',
    'android_xhdpi_portrait': 'mobile-configs/splash/splash-720x1280.png'
  });

App.accessRule('*://*.heroku.*', {
  external: true
});

App.accessRule('*://*.mapbox.*', {
  external: true
});

App.accessRule('*://*.kricket.co', {
  external: true
});

App.accessRule('*', {
  external: true
});

App.setPreference('SplashScreen', 'screen');
App.setPreference('SplashScreenDelay', '10000');
