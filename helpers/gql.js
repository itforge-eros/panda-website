const gql = require("graphql-tag");
const ghp = {};

// don't require auth
ghp.sendLogin = (apollo, usr, pwd) => {
	return apollo.query({
		query: gql`
			{
				login(username: "${usr}", password: "${pwd}") {
					member {
						id, username, firstName, lastName, email
					},
					token
				}
			}
		`
	});
};

// require auth
ghp.getAccesses = (apollo_auth, deptId) => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					accesses(departmentId: "${deptId}")
				}
			}
		`
	});
};
ghp.getMe = apollo_auth => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					roles {
						name
						department {
							id name fullThaiName description
						}
						permissions {
							accesses
						}
					}
				}
			}
		`
	});
};

module.exports = ghp;
