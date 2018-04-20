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
ghp.getSpace = (apollo_auth, dept, spaceName) => {
	return apollo_auth.query({
		query: gql`
			{
				space(department: "${dept}", name: "${spaceName}") {
					id, name, fullName, description, capacity, isAvailable, department {name fullThaiName}
				}
			}
		`
	});
};
ghp.getRequest = (apollo_auth, id) => {
	return apollo_auth.query({
		query: gql`
			{
				request(id: "${id}") {
					id
					client { firstName lastName }
					body
					dates
					period { start end }
					status
					createdAt
					space { fullName department { fullThaiName } }
				}
			}
		`
	});
};
ghp.getMyRequests = apollo_auth => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					requests {
						id dates period {start end} status createdAt
						space {fullName department {fullThaiName}}
					}
				}
			}
		`
	})
};
ghp.getMaterials = (apollo_auth, deptName) => {
	return apollo_auth.query({
		query: gql`
			{
				department(name: "${deptName}") {materials {id name {th}}}
			}
		`
	})
};
ghp.createSpace = (apollo_auth, sp) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($spaceInput: CreateSpaceInput!) {
				createSpace(input: $spaceInput) {
					name department { name }
				}
			}
		`,
		variables: {
			"spaceInput": {
				"name": sp.name.toLowerCase().replace(/ /g, "-"),
				"fullName": sp.fullName,
				"description": sp.description,
				"capacity": parseInt(sp.capacity),
				"category": sp.category,
				"isAvailable": sp.isAvailable == "true" ? true : false,
				"departmentId": sp.deptId
			}
		}
	})
};
ghp.createMaterial = (apollo_auth, deptId, name) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($materialInput: CreateMaterialInput!) {
				createMaterial(input: $materialInput) {name {th}}
			}
		`,
		variables: {
			"materialInput": {
				"departmentId": deptId,
				"name": {"th": name}
			}
		}
	})
};

module.exports = ghp;
