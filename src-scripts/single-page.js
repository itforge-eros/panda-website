
function converterToHour(endTime, startTime){
	return Math.floor(endTime - startTime); 
	// this function use for finding duration of room reservation with hour that be floored
}
function converterOverToMins(endTime, startTime){
	return (((endTime - startTime) - Math.floor(endTime - startTime)) * 60);
	// this function use for finding duration of room servation by bring the overtime from hour convert to minutes
}
function convertToHumanity(time) {
	if (time%1 !== 0){
		return (Math.floor(time) + ':' +(((time).toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0));
	}else {
		if((((time).toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0) == 0){
		return (Math.floor(time) + ':' +(((time).toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0)) + '0';
	}else{
		return (Math.floor(time) + ':' +(((time).toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0));
		}	
	}
	
	// this function use for converting the format .5 hour to humanity format
}

Vue.component('time-slot', {
	props: {
		available: Boolean,
		position: Number
	},
	template: '<span class="slot" :class="{unavailable: !available, selected: isChosen}" @click="choose"><slot></slot></span>',
	data: function () {
		return {isChosen: false, isAvailable: this.available}
	},
	methods: {
		choose: function () {
			var beSelected = document.getElementsByClassName("slot selected");
			if ((app.chosenTimes).length > 1) {(app.chosenTimes).length = 0}
			if ((app.chosenTimes).length == 0) {
				while(beSelected.length >= 1)
					{
						for (var i = 0; i < (beSelected.length); i+=1) {
						beSelected[i].setAttribute("class", "slot"); 
						// console.log(beSelected[i]); 
					}
				}
			}
			if (this.isAvailable) {
				this.isChosen = !this.isChosen;
				if (app.chosenTimes.includes(this.position))
					app.chosenTimes.splice(app.chosenTimes.indexOf(this.position), 1);
				else app.chosenTimes.push(this.position);
				}
				// sub function psudoDrag
			min_time = Math.min.apply(null, app.chosenTimes);
			max_time = Math.max.apply(null, app.chosenTimes);
			for (var j = min_time; j <= (max_time - min_time)+min_time; j+=0.5) 
				{
					document.getElementById(id="slot-" + j).setAttribute("class", "slot selected");
					console.log(document.getElementById(id="slot-" + j));
					console.log(min_time, max_time)
				}
				// console.log((app.chosenTimes).length);
				}
			}
		});
var app = new Vue({
	el: '#app',
	data: {
		r_date: new Date(),
		chosenTimes: []
	},
	computed: {
		chosenTimePeriod: function () {
			let startTime = Math.min.apply(null, this.chosenTimes);
			let endTime = Math.max.apply(null, this.chosenTimes)+0.5;
			return convertToHumanity(startTime) + '-' + convertToHumanity(endTime) + ' น. (' + converterToHour(endTime, startTime) +' ชั่วโมง '+ converterOverToMins(endTime, startTime) + ' นาที)'
		}
	}
});

