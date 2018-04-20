var app = new Vue({
	el: "#app",
	data: {
		spaceName: "",
		spaceURI: ""
	},
	computed: {
		computedSpaceURI: function() {
			return this.spaceURI.toLowerCase().replace(/ /g, "-")
		}
	}
});
