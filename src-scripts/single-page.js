const monthsTH = ["ม.ค.","ก.พ.","มี.ค","เม.ย.","พ.ค.","มิ.ย","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const weekdaysTH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const monthsEN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekdaysEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var reservations = {};

const times = [];
for (let t = 0, i = 0; t <= 23.5; t += 0.5, i++)
	times.push({ slot: i, time: t });

const apiURL = "https://api.space.itforge.io/graphql";

function findMin_Max() {
	min_time = Math.min.apply(null, app.chosenTimes);
	max_time = Math.max.apply(null, app.chosenTimes);
}
function setSelected() {
	for (let j = min_time; j <= max_time; j += 0.5) {
		document.getElementById((id = "slot-" + j)).removeAttribute("class");
		document
			.getElementById((id = "slot-" + j))
			.setAttribute("class", "slot selected");
	}
}
function setApiDate(date) {
	// create a raw date for sending to the API (eg. 2018-04-14)
	let m = date.getMonth() + 1;
	let d = date.getDate();
	return (
		date.getFullYear() +
		"-" +
		(m < 10 ? "0" + m : m) +
		"-" +
		(d < 10 ? "0" + d : d)
	);
}
function drawReservations(date) {
	for (var r = 18; r <= 39; r++) {
		document.getElementById(r).classList.remove("selected");
		document.getElementById(r).classList.remove("unavailable");
	}
	var d = date.replace(/-/g, "_");
	if (reservations[d] != undefined) {
		for (var i = 0; i < reservations[d].length; i++) {
			for (var j = reservations[d][i].start; j < reservations[d][i].end; j++)
				document.getElementById(j).classList.add("unavailable");
		}
	}
}

var app = new Vue({
	el: "#app",
	data: {
		r_date: "",
		r_date_raw: new Date(),
		r_startTime: "18",
		r_endTime: "19",
		chosenTimes: [],
		chosenSlots: [],
		hasNotChosenTime: true,
		unavailableSelected: false,
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
			app.submitText = "กำลังส่ง...";
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						mutation {
							createProblem(input: {spaceId: "${app.spaceId}", title: "${app.reportTitle}", body: "${app.reportBody}"}) {id}
						}
					`
				},
				headers: { Authorization: "bearer" + app.reportToken }
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
	},
	created: function() {
		axios(apiURL, {
			method: "POST",
			data: {
				query: `
					query {
						space(department: "${deptName}", name: "${spaceName}" ) { reservations {date period {start end}} }
					}
				`
			}
		})
		.then(function(data) {
			let reservationsByDay = {};
			data.data.data.space.reservations.map(r => {
				let newKey = r.date.replace(/-/g, "_");
				if (reservationsByDay[newKey] === undefined) {
					reservationsByDay[newKey] = [];
					reservationsByDay[newKey].push({ start: r.period.start, end: r.period.end });
				} else {
					reservationsByDay[newKey].push({ start: r.period.start, end: r.period.end });
				}
			});
			reservations = reservationsByDay;
			drawReservations(setApiDate(new Date()));
		})
		.catch(function(err) { console.log(err) });
	}
});

// Date picker
const today = new Date();
var picker_date;
var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	i18n: {
		previousMonth: "เดือนที่แล้ว",
		nextMonth: "เดือนหน้า",
		months: monthsTH,
		weekdays: weekdaysEN,
		weekdaysShort: weekdaysTH
	},
	firstDay: 1,
	format: "DD-MM-YYYY",
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
		drawReservations(app.r_date);
	},
	toString(date) {
		const day = date.toString().split(" ")[2];
		const month = date.toString().split(" ")[1];
		const weekday = date.toString().split(" ")[0];
		const monthsMapper = element => element == `${month}`;
		const weekdaysMapper = element => element == `${weekday}`;
		app.r_date_raw = `${
			weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]
		}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
		return `${
			weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]
		}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
	}
});

app.r_date = setApiDate(picker.getDate());

// Time picker
function drawSelected() {
	app.unavailableSelected = false;
	for (var i = 18; i <= 39; i++)
		$("#" + i).removeClass("selected");
	var startPoint = Math.min(app.r_startTime, app.r_endTime);
	var endPoint = Math.max(app.r_startTime, app.r_endTime);
	for (var j = startPoint; j < endPoint; j++) {
		if ($("#" + j).hasClass("unavailable")) app.unavailableSelected = true;
		else $("#" + j).addClass("selected");
	}
}

let isFirstTimeChoosing = true;
function timeToSlot(time) {
	let hr = parseInt(time.split(":")[0]);
	let mn = parseInt(time.split(":")[1]);
	if (mn == 0) return times[hr * 2].slot;
	else return times[hr * 2 + 1].slot;
};

$("#timeStart").clockTimePicker({
	precision: 30,
	required: true,
	minimum: "09:00",
	maximum: "19:30",
	onAdjust: function(newVal, oldVal) {
		let time = newVal.split(":");
		app.r_startTime = timeToSlot(time[0] + ":" + time[1]);
		if (isFirstTimeChoosing) {
			let endHr = time[1] == "00" ? time[0] : ++time[0];
			let endMn = time[1] == "00" ? "30" : "00";
			$("#timeEnd").val(endHr + ":" + endMn);
			app.r_endTime = timeToSlot(endHr + ":" + endMn);
		}
		drawSelected();
	},
	onClose: function() {
		isFirstTimeChoosing = false;
		app.hasNotChosenTime = false;
	}
});
$("#timeEnd").clockTimePicker({
	precision: 30,
	required: true,
	minimum: "09:00",
	maximum: "19:30",
	onAdjust: function(newVal, oldVal) {
		let time = newVal.split(":");
		app.r_endTime = timeToSlot(time[0] + ":" + time[1]);
		drawSelected();
	},
	onClose: function() {
		isFirstTimeChoosing = false;
		app.hasNotChosenTime = false;
	}
});
