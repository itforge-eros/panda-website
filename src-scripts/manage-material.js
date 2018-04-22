const apiURL = "https://api.space.itforge.io/graphql";
let token = "";

var app = new Vue({
	el: "#app",
	data: {
		token: ""
	},
	methods: {
		deleteMaterial: function (id) {
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						mutation {
							deleteMaterial(input: {materialId: "${id}"}) {id}
						}
					`
				},
				headers: {"Authorization": "bearer" + app.token}
			}).then(function (result) {
				console.log(result);
				document.getElementById(id).remove();
			}).catch(function (err) {
				console.log(err);
			});
		}
	}
})

