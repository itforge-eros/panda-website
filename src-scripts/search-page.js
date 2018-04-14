var monthsTH = ['ม.ค.','ก.พ.','มี.ค','เม.ย.','พ.ค.','มิ.ย','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
var weekdaysTH = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
var monthsEN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var weekdaysEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const apiURL = "http://api.panda.itforge.io/graphql";
const trySamples = ["M03 IT", "Auditorium", "อาคารเรียนรวม"];

Vue.component("result-card", {
	props: ["slug", "name", "seats", "amenities"],
	template: "#result-card"
});

Vue.component("spinner", {
	template: `<div class="spinner" style="margin-top: 4em"></div>`
});

var app = new Vue({
	el: "#app",
	data: {
		s_quick: "",
		s_date: new Date(),
		s_date_raw: "",
		s_faculty: "",
		s_type: "",
		s_room: "",
		s_seats: "",
		firstSearch: true,
		showAdvanced: false,
		trySamples: trySamples,
		searchResults: [],
		loading: false
	},
	methods: {
		toggleAdvanced: function() {
			this.showAdvanced
				? (this.s_faculty = "")
				: (this.s_faculty = "fac-it");
			this.showAdvanced
				? (this.s_type = "")
				: (this.s_type = "1");
			this.showAdvanced = !this.showAdvanced;
		},
		doSearch: function() {
			this.loading = true;
			if (this.firstSearch) {
				document.getElementById("page-title").remove();
				document.getElementById("labels").remove();
				document.getElementById("search-house").remove();
				this.firstSearch = false;
			}
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						query {
							spaces {
								id, name, capacity
							}
						}
					`
				}
			})
				.then(function(result) {
					app.searchResults = result.data.data.spaces;
					app.loading = false;
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	}
});

function setRawDate(date) {
	// create a raw date for sending to the API (eg. 2018-04-14)
	var m = date.getMonth() + 1;
	var d = date.getDate();
	return (
		date.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d)
	);
}

const today = new Date();
var picker_date;

var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	i18n: {
		previousMonth : 'เดือนที่แล้ว',
    	nextMonth     : 'เดือนหน้า',
		months : ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
		weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	    weekdaysShort : ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
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
	onClose: function() {
		app.s_date = document.getElementById("datepicker").value;
		app.s_date_raw = setRawDate(picker_date);
	},
	toString(date) {
		picker_date = date;
		const day = date.toString().split(" ")[2];
		const month = date.toString().split(" ")[1];
		const weekday = date.toString().split(" ")[0];
		function monthsMapper(element) {
			return element == `${month}`;
		}
		function weekdaysMapper(element) {
			return element == `${weekday}`;
		}
		app.s_date = `${weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
		return `${weekdaysTH[weekdaysEN.findIndex(weekdaysMapper)]}\u0020${day}\u0020${monthsTH[monthsEN.findIndex(monthsMapper)]}`;
	}
});

app.s_date_raw = setRawDate(picker.getDate()); // initial to present
