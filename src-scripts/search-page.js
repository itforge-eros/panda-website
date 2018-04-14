const apiURL = "http://api.panda.itforge.io/graphql";
const trySamples = ["M03 IT", "Auditorium", "อาคารเรียนรวม"];

Vue.component("result-card", {
	props: ['slug', 'name', 'seats', 'amenities'],
	template: "#result-card"
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
		searchResults: []
	},
	methods: {
		toggleAdvanced: function() {
			this.showAdvanced
				? (this.s_faculty = "")
				: (this.s_faculty = "fac-it");
			this.showAdvanced = !this.showAdvanced;
		},
		doSearch: function() {
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
				this.searchResults = result.data.data.spaces;
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
