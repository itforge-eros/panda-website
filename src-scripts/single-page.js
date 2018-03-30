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
		return Math.floor(time) + ':' +((time) - Math.floor(time))*60;
	}else {
		return Math.floor(time);
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
			if (this.isAvailable) {
				this.isChosen = !this.isChosen;
				if (app.chosenTimes.includes(this.position))
					app.chosenTimes.splice(app.chosenTimes.indexOf(this.position), 1);
				else app.chosenTimes.push(this.position);
			}
		}
	}
});
var app = new Vue({
	el: '#app',
	data: {
		r_date: '123',
		chosenTimes: []
	},
	computed: {
		chosenTimePeriod: function () {
			let startTime = Math.min.apply(null, this.chosenTimes);
			let endTime = Math.max.apply(null, this.chosenTimes);
			return convertToHumanity(startTime) + '-' + convertToHumanity(endTime) + ' น. (' + converterToHour(endTime, startTime) +' ชั่วโมง '+ converterOverToMins(endTime, startTime) + ' นาที)'
		}
	}
});

