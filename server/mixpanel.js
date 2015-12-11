/*
*	mixpanel.js
*	Mixpanel
*	We use Mixpanel to monitor usage, just init server side of stuff (use node.js package mixpanel)
*/

console.log("Loading mixpanel");
// Server side of mixpanel, send events from server.
var Mixpanel = Meteor.npmRequire('mixpanel');
mixpanel = null;
// if you want to modify api key, please note there is also one in /client/main.html for client side.
if (process.env.NODE_ENV=="production")
	mixpanel = Mixpanel.init('ef58196a3014bb629cae8a04660100a1');
else{
	// If we are not in production mode, then we mock !
	mixpanel = new function(){
		this.track = function(){};
		this.people=new function(){
			this.increment=function(){
			};
			this.set=function(){
				
			}
		};
	}
}


