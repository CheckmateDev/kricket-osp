/*
*	watchIp.js
*	WatchIp singleton
* 	Keep a track in memory only of user calls to avoid massive attacks
* 	Dependences with momentjs
*/

watchIp = (function(){
	var instance;

	var timeout = 5; // 5s between each connection

	function init(){
		function _isBanned(connection,userId){
			if (!connection)
				return false;

			if (!instance._tab)
				instance._tab = [];

			var ip = connection.clientAddress;
			
			var ip_idx,userId_idx;

			ip_idx = instance._tab.map(function(e){
					return e.ip;
				}).indexOf(ip);	

			userId_idx = instance._tab.map(function(e){
					return e.userId;
				}).indexOf(userId);

			if (ip_idx == -1 && userId_idx == -1){
				// just push ip
				instance._tab.push({ip:ip,userId:userId,date:moment().format()});
			}else{
				//check that this ip didn't has done action couple seconds before
				var idx = (ip_idx==-1)?userId:ip_idx;
				var now = moment();
				var previousDate = moment(instance._tab[idx].date).add(timeout,'seconds');
				instance._tab[idx].date = now;
				if (previousDate.isAfter(now)){
					console.log("Hey ! ip or userId banned");
					return true;
				}
			}
			return false;
		}
		return {
			isBanned:function(connection,userId,callback){
				if (typeof(callback)!="undefined"){
					callback(_isBanned(connection,userId));
				}else
					return _isBanned(connection,userId);
			}
		}
	}

	return {
		getInstance: function(){
			if (!instance){
				instance = init();
			}
			return instance;
		}
	};

})();

WatchIp = watchIp.getInstance();