/*
*	migration.js
*	For browser & mobile, automatic migration is stuck when production mode.
*	(when code has changed, signal is sent to every client to reload app, it's blocked during use of app)
* 	Inspired by https://github.com/meteor/mobile-packages/tree/master/packages/mdg:reload-on-resume
*/

var newVersionAvailable = new ReactiveVar(false);
var hasResumed = false;

document.addEventListener("resume", function () {
  hasResumed = true;
}, false);

// Event launched when migration is pushed by server
Reload._onMigrate(function (retry) {
	newVersionAvailable.set(true);

	// for now, a way to know if we are running in dev mode
	var devMode = (Meteor.absoluteUrl().indexOf(":3000")!=-1);
	var tripLaunched = (typeof(trip1)!="undefined");

	// if cordova
	if (Meteor.isCordova){
		// we check that app has been closed before update (hasResumed)
		// or we are in devMode, and trip is not launched
		if ((hasResumed || devMode) && !tripLaunched) {
		  return [true, {}];
		} else {
		  document.addEventListener("resume", retry, false);
		  return [false];
		}
	}else{
		// we autorize hot migration only if we are in dev mode
		if (devMode){
			return [true, {}];
		}
		return [false];
	}
});

/**
 * @summary Reactive function that returns true when there is a new version of
 * the app downloaded, can be used to prompt the user to close and reopen the
 * app to get the new version.
 */
Reload.isWaitingForResume = function () {
  return newVersionAvailable.get();
};