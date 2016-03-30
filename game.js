(function(){
   "use strict";

   var Game = function(){

     // SEE ON SINGLETON PATTERN
     if(Game.instance){
       return Game.instance;
     }
     Game.instance = this;

     //CACHE
     this.cacheStatusValues = ['uncached','idle','checking','downloading','updateready','obsolete'];
     this.cache = window.applicationCache;
     this.startCacheListeners();

     this.online = null;
     this.status = null;
	 
	 this.phone = null;

     this.init();
   };

   window.Game = Game; // Paneme muuutuja külge

   Game.prototype = {

     init: function(){

        console.log('started');
		
		this.askPhone();
		
		this.serveQuestion();
     },
	 serveQuestion: function(){
		
		//kui ei ole internetti
		if(!navigator.onLine){
			window.setTimeout(function(){
				Game.instance.serveQuestion();
			}, 100);
			return;
		}
		
		//internet oli
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				
				var question = JSON.parse(xhttp.responseText);
				console.log(question);
				
				//if(!question.id)
				if(typeof question.id === "undefined"){
					//id'd ei olnud
					console.log("Küsimust ei olnud");
					window.setTimeout(function(){
						Game.instance.serveQuestion();
					}, 1000);
				}else{
					alert(question.q);
				}
			
			}
		};
		xhttp.open("GET", "questions.txt", true);
		xhttp.send();
		
		
		
		
	 },
	 askPhone: function(){
		 
		//kui localStorage'is olemas siis laen sealt
		if(localStorage.getItem("phone")){
			this.phone = localStorage.getItem("phone");
			return;
		}
		 
		 
		var p = prompt("Palun sisesta on tel nr:");
		
		if(p){
			//prompt ei olnud tühi, ega cancel nupp
			localStorage.setItem("phone", p);
			this.phone = p;
		}else{
			this.askPhone();
		}
		
		 
	 },
     startCacheListeners: function(){
         this.cache.addEventListener('cached', this.logEvent.bind(this), false);
         this.cache.addEventListener('checking', this.logEvent.bind(this), false);
         this.cache.addEventListener('downloading', this.logEvent.bind(this), false);
         this.cache.addEventListener('error', this.logEvent.bind(this), false);
         this.cache.addEventListener('noupdate', this.logEvent.bind(this), false);
         this.cache.addEventListener('obsolete', this.logEvent.bind(this), false);
         this.cache.addEventListener('progress', this.logEvent.bind(this), false);
         this.cache.addEventListener('updateready', this.logEvent.bind(this), false);

         window.applicationCache.addEventListener('updateready',function(){
             window.applicationCache.swapCache();
			 
             //console.log('swap cache has been called');
         },false);

         setInterval(function(){
             Game.instance.cache.update();
         }, 10000);

         setInterval(function(){
             Game.instance.checkDeviceStatus();
         }, 100);
     },
     checkDeviceStatus: function(){
         this.online = (navigator.onLine) ? "online" : "offline";
         console.log(this.online);
		 
		 var bar = document.querySelector(".bar");
		 if(this.online === "online"){
			 bar.className = "bar online";
		 }else{
			 bar.className = "bar offline";
		 }
		 
		 
     },
     logEvent: function(event){

         this.status = this.cacheStatusValues[this.cache.status];
         var message = 'online: '+this.online+', event: '+ event.type+', status: ' + this.status;

        if (event.type == 'error' && navigator.onLine) {
            message+= ' (prolly a syntax error in manifest)';
        }

        //console.log(message);
     }

    }; // Game LÕPP

   // kui leht laetud käivitan Moosipurgi rakenduse
   window.onload = function(){
     var app = new Game();
   };

})();
