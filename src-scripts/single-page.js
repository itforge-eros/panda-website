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
			return startTime + '-' + endTime + ' น.'
		}
	}
});
