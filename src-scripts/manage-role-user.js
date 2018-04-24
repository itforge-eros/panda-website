const apiURL = "https://api.space.itforge.io/graphql";

var app = new Vue({
	el: "#app",
	data: {
		token: "",
		roleId: ""
	},
	methods: {
		revokeRole: function (memberId) {
			axios(apiURL, {
				method: "POST",
				data: {
					query: `
						mutation {
							revokeRole(input: {roleId: "${app.roleId}", memberId: "${memberId}"}) {id}
						}
					`
				},
				headers: {"Authorization": "bearer" + app.token}
			}).then(function (result) {
				console.log(result);
				document.getElementById(memberId).remove();
			}).catch(function (err) {
				console.log(err);
			});
		}
	}
})
