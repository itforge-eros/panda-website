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
var picker_date; // date selected from Pikaday

var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	i18n: {
    	previousMonth : 'Previous Month',
    	nextMonth     : 'Next Month',
    	months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
    	weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    	weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
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
		return `${weekday}\u0020${day}\u0020${month}`;
	}
});
