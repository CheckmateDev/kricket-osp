/*
*   date.js
*   Date class extension
*/

Date.prototype.addDays = function(days) {
	this.setDate(this.getDate()+days);
}

Date.prototype.addMinutes = function(minutes) {
	this.setMinutes(this.getMinutes()+minutes);
}

Date.prototype.getTimeLeft = function(totalSeconds){
    var _totalSeconds = totalSeconds;
    var hours = parseInt(_totalSeconds/3600);
    _totalSeconds-=hours*3600;
    var minutes = parseInt(_totalSeconds / 60, 10)
    var seconds = parseInt(_totalSeconds % 60, 10);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    left = hours+"h "+minutes+"m "+seconds+"s";
    return left;
}