var app = new Vue({
	el: "#app",
	data: {
		usr: "",
		pwd: "",
		showError: false
	},
	methods: {
		validate: function() {
			if (this.usr != "" && this.pwd != "") document.getElementById("login").submit();
			else this.showError = true;
		}
	}
});

document.getElementById("login").addEventListener("keydown", function(e) {
	if (e.keyCode == 13) app.validate();
})
