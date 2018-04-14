function converterToHour(endTime, startTime) {
	return Math.floor(endTime - startTime);
	// this function use for finding duration of room reservation with hour that be floored
}
function converterOverToMins(endTime, startTime) {
	return (((endTime - startTime) - Math.floor(endTime - startTime)) * 60);
	// this function use for finding duration of room servation by bring the overtime from hour convert to minutes
}
function convertToHumanity(time) {
	if (time%1 !== 0) {
		return (Math.floor(time) + ':' +((time.toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0));
	} else {
		if((((time).toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0) == 0) {
			return (Math.floor(time) + ':' +((time.toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0)) + '0';
		} else {
			return (Math.floor(time) + ':' +((time.toFixed(2) - Math.floor(time).toFixed(2))*60).toFixed(0));
		}
	}
	// this function use for converting the format .5 hour to humanity format
}
function findMin_Max() {
	min_time = Math.min.apply(null, app.chosenTimes);
	max_time = Math.max.apply(null, app.chosenTimes);
}
function setSelected () {
	for (var j = min_time; j <= (max_time); j+=0.5) {	
		document.getElementById(id="slot-" + j).removeAttribute("class");
		document.getElementById(id="slot-" + j).setAttribute("class", "slot selected");
	}
}

Vue.component('time-slot', {
	props: {
		available: Boolean,
		position: Number,
		slotnum: Number
	},
	template: '<span class="slot" :class="{unavailable: !available, selected: isChosen}" @click="choose"><slot></slot></span>',
	data: function () {
		return {isChosen: false, isAvailable: this.available}
	},
	methods: {
		choose: function () {
			var beSelected = document.getElementsByClassName("slot selected");
			if (app.chosenTimes.length > 1) app.chosenTimes.length = 0;
			if (app.chosenSlots.length > 1) app.chosenSlots.length = 0;
			while(beSelected.length >= 1) {
				for (var i = 0; i < (beSelected.length); i+=1)
					beSelected[i].setAttribute("class", "slot");
			}
			if (this.isAvailable) {
				if (app.chosenTimes.includes(this.position)) {
					app.chosenTimes.splice(app.chosenTimes.indexOf(this.position), 1);
				} else app.chosenTimes.push(this.position);
				if (app.chosenSlots.includes(this.slotnum)) {
					app.chosenSlots.splice(app.chosenSlots.indexOf(this.slotnum), 1);
				} else app.chosenSlots.push(this.slotnum);
			} else {
				app.chosenTimes.length = 0;
				app.chosenSlots.length = 0;
				app.startSlot = 0;
				app.endSlot = 0;
			}
			// sub function psudoDrag
			findMin_Max();
			setSelected();
		}
	}
});

var app = new Vue({
	el: '#app',
	data: {
		r_date: new Date(),
		chosenTimes: [],
		chosenSlots: []
	},
	computed: {
		chosenTimePeriod: function () {
			let startTime = Math.min.apply(null, this.chosenTimes);
			let endTime = Math.max.apply(null, this.chosenTimes)+0.5;
			return convertToHumanity(startTime) + '-' + convertToHumanity(endTime) + ' น. (' + converterToHour(endTime, startTime) +' ชั่วโมง '+ converterOverToMins(endTime, startTime) + ' นาที)'
		},
		selectedStartSlot: function () {
			return Math.min.apply(null, this.chosenSlots);
		},
		selectedEndSlot: function () {
			return Math.max.apply(null, this.chosenSlots);
		}
	}
});

const today = new Date();
var picker_date; // date selected from Pikaday

var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	firstDay: 1,
	format: "DD-MM-YYYY",
	minDate: today,
	maxDate: new Date(
		today.getFullYear() + 1,
		today.getMonth(),
		today.getDate()
	),
	yearRange: [today.getFullYear(), today.getFullYear() + 1],
	onClose: function() {
		app.r_date = document.getElementById("datepicker").value;
	},
	toString(date) {
		picker_date = date;
		const day = date.toString().split(" ")[2];
		const month = date.toString().split(" ")[1];
		const weekday = date.toString().split(" ")[0];
		return `${weekday}\u0020${day}\u0020${month}`;
	}
});
