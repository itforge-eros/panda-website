var monthsTH = ['ม.ค.','ก.พ.','มี.ค','เม.ย.','พ.ค.','มิ.ย','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
var weekdaysTH = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
var monthsEN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var weekdaysEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const apiURL = "https://api.space.itforge.io/graphql";

function buildTagQuery(tags, type) {
	var temp = "";
	if (type) temp += (type + ",");
	for (var i = 0; i < tags.length; i++) {
		temp += tags[i];
		if (i < tags.length-1) temp += ",";
	}
	return temp;
}

function buildSearchQuery(room, faculty, tags, capacity) {
	var temp = "";
	if (room) temp += (room + " ");
	if (faculty) temp += ("department:" + faculty + " ");
	if (tags) temp += ("tags:" + tags + " ");
	if (capacity) temp += ("capacity:" + capacity);
	return temp;
}

Vue.component("result-card", {
	props: ["slug", "name", "dept", "deptSlug", "capacity", "amenities"],
	template: "#result-card"
});

Vue.component("spinner", {
	template: `<div class="spinner" style="margin-top: 4em"></div>`
});

var app = new Vue({
	el: "#app",
	data: {
		s_room: "",
		s_date: new Date(),
		s_date_raw: "",
		s_faculty: "",
		s_tags: [],
		s_type: "",
		s_capacity: "",
		firstSearch: true,
		searchResults: [],
		loading: false
	},
	methods: {
		doSearch: function() {
			this.searchResults.length = 0;
			this.s_tags.length = 0;
			this.loading = true;
			var tagInput = document.getElementsByName("s_tags");
			for (var i = 0; i < tagInput.length; i++) if (tagInput[i].checked) this.s_tags.push(tagInput[i].value);
			var tagQuery = buildTagQuery(this.s_tags, this.s_type);
			var searchQuery = buildSearchQuery(this.s_room, this.s_faculty, tagQuery, this.s_capacity);
			if (this.firstSearch) {
				document.getElementById("page-title").remove();
				document.getElementById("search-house").remove();
				this.firstSearch = false;
			}
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						query {
							search(query: "${searchQuery}") {
								id name fullName capacity
								department {name fullThaiName}
							}
						}
					`
				}
			})
				.then(function(result) {
					app.searchResults = result.data.data.search;
					app.loading = false;
				})
				.catch(function(err) {
					console.log(err);
					app.loading = false;
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

var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	i18n: {
		previousMonth: 'เดือนที่แล้ว',
		nextMonth: 'เดือนหน้า',
		months: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
		weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		weekdaysShort: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']
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
		app.s_date_raw = setRawDate(picker.getDate());
	},
	toString(date) {
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
