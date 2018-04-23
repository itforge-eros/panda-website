const monthsTH = ['ม.ค.','ก.พ.','มี.ค','เม.ย.','พ.ค.','มิ.ย','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const weekdaysTH = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const monthsEN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const weekdaysEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const times = [];
for (let t = 0, i = 0; t <= 23.5; t+=0.5, i++) times.push({slot: i, time: t});

const apiURL = "https://api.space.itforge.io/graphql";

function findMin_Max() {
	min_time = Math.min.apply(null, app.chosenTimes);
	max_time = Math.max.apply(null, app.chosenTimes);
}
function setSelected () {
	for (let j = min_time; j <= (max_time); j+=0.5) {	
		document.getElementById(id="slot-" + j).removeAttribute("class");
		document.getElementById(id="slot-" + j).setAttribute("class", "slot selected");
	}
}
function setApiDate(date) {
	// create a raw date for sending to the API (eg. 2018-04-14)
	let m = date.getMonth() + 1;
	let d = date.getDate();
	return (
		date.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d)
	);
}

/*Vue.component('time-slot', {
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
		choose: () => {
			let beSelected = document.getElementsByClassName("slot selected");
			if (app.chosenTimes.length > 1) app.chosenTimes.length = 0;
			if (app.chosenSlots.length > 1) app.chosenSlots.length = 0;
			while(beSelected.length >= 1) {
				for (let i = 0; i < (beSelected.length); i+=1)
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
});*/

var app = new Vue({
	el: '#app',
	data: {
		r_date: "",
		r_date_raw: new Date(),
		r_startTime: "",
		r_endTime: "",
		chosenTimes: [],
		chosenSlots: [],
		submitText: "ส่งรายงาน",
		spaceId: "",
		reportTitle: "",
		reportBody: "",
		reportToken: "",
		reportSent: false,
		submitHasError: false
	},
	methods: {
		sendReport: () => {
			this.submitText = "กำลังส่ง...";
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						mutation {
							createProblem(input: {spaceId: "${app.spaceId}", title: "${app.reportTitle}", body: "${app.reportBody}"}) {
								id
							}
						}
					`
				},
				headers: {"Authorization": "bearer" + app.reportToken}
			})
				.then(result => {
					console.log(result);
					app.submitText = "ส่งรายงาน";
					app.reportSent = true;
					app.reportTitle = "";
					app.reportBody = "";
				})
				.catch(err => {
					console.log(err);
					app.reportSent = false;
					app.submitText = "ส่งรายงาน";
					app.submitHasError = true;
				});
		}
	}
});

// Date picker
const today = new Date();
var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	i18n: {
		previousMonth : 'เดือนที่แล้ว',
    	nextMonth     : 'เดือนหน้า',
		months : monthsTH,
		weekdays      : weekdaysEN,
	    weekdaysShort : weekdaysTH
	},
	firstDay: 1,
	minDate: today,
	maxDate: new Date(
		today.getFullYear() + 1,
		today.getMonth(),
		today.getDate()
	),
	yearRange: [today.getFullYear(), today.getFullYear() + 1],
	onClose: () => {
		app.r_date_raw = document.getElementById("datepicker").value;
		app.r_date = setApiDate(picker.getDate());
	},
	toString(date) {
		const day = date.toString().split(" ")[2];
		const month = date.toString().split(" ")[1];
		const weekday = date.toString().split(" ")[0];
		const monthsMapper = element => element == `${month}`;
		const weekdaysMapper = element => element == `${weekday}`;
		app.r_date_raw = `${weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
		return `${weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
	}
});
app.r_date = setApiDate(picker.getDate()); // initial to present

// Time picker
const timeToSlot = time => {
	let hr = parseInt(time.split(":")[0]);
	let mn = parseInt(time.split(":")[1]);
	if (mn == 0) return times[hr*2].slot;
	else return times[hr*2 + 1].slot;
}
let isFirstTimeChoosing = true;

$("#timeStart").clockTimePicker({
	precision: 30,
	required: true,
	minimum: "09:00",
	maximum: "19:30",
	onAdjust: (newVal, oldVal) => {
		let time = newVal.split(":");
		app.r_startTime = timeToSlot(time[0] + ":" + time[1]);
		if (isFirstTimeChoosing) {
			let endHr = time[1] == "00" ? time[0] : ++time[0];
			let endMn = time[1] == "00" ? "30" : "00";
			$("#timeEnd").val(endHr + ":" + endMn);
			app.r_endTime = timeToSlot(endHr + ":" + endMn);
		}
	},
	onClose: () => {isFirstTimeChoosing = false}
});
$("#timeEnd").clockTimePicker({
	precision: 30,
	required: true,
	minimum: "09:00",
	maximum: "19:30",
	onAdjust: (newVal, oldVal) => {
		let time = newVal.split(":");
		app.r_endTime = timeToSlot(time[0] + ":" + time[1]);
	}
});
