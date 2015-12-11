/*
*   viewTagCounter.js
*   Decrement time left on one or multiple tags
*/

myViewTagCounter = null;
// 1728000s == 2 days
displayTimeLeftUntilXSeconds = 172800;

ViewTagCounter = (function(){

    var instance;

    function init() {
        this._stopFlag = false;
        this._stopped = true;
        this._counter = new ReactiveVar();
        this._counterHash = new ReactiveDict("A"+(new Date()).getTime());

        return {
            counter:this._counter,
            counterHash:this._counterHash,
            run:function(atmosId,timeOutCallBack) {
                console.log("viewTagCounter::run");
                instance.stop();
                var self = this;
                if (atmosId!=null){
                    Meteor.setTimeout(function(){
                        self._atmosId = atmosId;
                        self._timeOutCallBack = timeOutCallBack;
                        self._stopped = false;
                        self._stopFlag = false;
                        self._job(self);
                    },1100);
                    console.log("viewTagCounter rendered");
                }
                else
                    console.log("viewTagCounter::run get a null atmosId");
            },
            stop:function(){
                console.log("ViewTagCounter::stop");
                instance._stopFlag = true;
                instance._init();
            },
            _init:function(){
            console.log("viewTagCounter::init");
            instance._timeOutCallBack = null;
            instance.counter.set("");
            },
            _job:function(self){
                console.log("Entered interval");
                // atmosId may be an array of atmosId, then we check
                if(self._atmosId && typeof(self._atmosId)=="object"){
                    for(var i=0;i<self._atmosId.length;i++){
                        var atmos = Atmos.findOne({_id:self._atmosId[i]});
                        if (atmos){
                            var totalSeconds = ((new Date(atmos.timeLimit)).getTime() - (new Date()).getTime())/1000;
                            // if timeLimit has been reach we close viewTag and we send atmosId of tag to close ;)
                            if (totalSeconds<0){
                                self._timeOutCallBack(atmos._id);
                                return;
                            }
                            var left = self._getTimeLeft(totalSeconds);
                            self.counterHash.set(atmos._id,left);
                            console.log(" Still running counter : atmosId :"+atmos._id+ " left : "+left + " (timeLimit :"+ atmos.timeLimit+")");
                        }
                    }
                }else{
                    var atmos = Atmos.findOne({_id:self._atmosId});
                    if (atmos){
                        var totalSeconds = ((new Date(atmos.timeLimit)).getTime() - (new Date()).getTime())/1000;
                        // if timeLimit has been reach we close viewTag
                        if (totalSeconds<0){
                            self._timeOutCallBack();
                            return;
                        }
                        var left = self._getTimeLeft(totalSeconds)
                        self.counter.set(left);
                        console.log(" Still running counter : atmosId :"+self._atmosId + " left : "+left + " (timeLimit :"+ atmos.timeLimit+")");
                    }
                }

                if (!self._stopFlag)
                    Meteor.setTimeout(function(){
                        self._job(self);
                    },1000);
                else{
                    console.log("Stopping thread");
                    self._stopped = true;
                }
            },
            _getTimeLeft:function(totalSeconds){
                if (totalSeconds>displayTimeLeftUntilXSeconds){
                    return "";
                }else
                    return new Date().getTimeLeft(totalSeconds);
            }

        }; // return

  }; // init()

    return {
      getInstance: function() {
        if (!instance) {
          instance = init();
        }
        
        return instance;
      } // getInstance
    };

})();

myViewTagCounter = ViewTagCounter.getInstance();
