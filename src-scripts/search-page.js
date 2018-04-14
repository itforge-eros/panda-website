const apiURL = "http://api.panda.itforge.io/graphql";
const trySamples = ["M03 IT", "Auditorium", "อาคารเรียนรวม"];

Vue.component("result-card", {
	props: ['slug', 'name', 'seats', 'amenities'],
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
			}).then(function (result) {
				app.searchResults = result.data.data.spaces;
				app.loading = false;
			}).catch(function (err) {
				console.log(err)
			});
		}
	}
});

const today = new Date();

var picker = new Pikaday({
	field: document.getElementById("datepicker"),
	firstDay: 1,
	minDate: today,
	maxDate: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
	yearRange: [today.getFullYear(), today.getFullYear() + 1]
});
