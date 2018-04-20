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
ghp.getSpace = (apollo, dept, spaceName) => {
	// can accept auth
	return apollo.query({
		query: gql`
			{
				space(department: "${dept}", name: "${spaceName}") {
					id, name, fullName, description, capacity, isAvailable, department {name fullThaiName}
				}
			}
		`
	});
};
ghp.getMaterials = (apollo_auth, deptName) => {
	// can accept auth
	return apollo_auth.query({
		query: gql`
			{
				department(name: "${deptName}") {materials {id name {th}}}
			}
		`
	})
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
ghp.createRequest = (apollo_auth, rq) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($requestInput: CreateRequestInput!) {
				createRequest(input: $requestInput) {
					id
				}
			}
		`,
		variables: {
			"requestInput": {
				"dates": [rq.r_date_raw],
				"period": {
					"start": parseInt(rq.start),
					"end": parseInt(rq.end)
				},
				"spaceId": rq.space,
				"body": rq.reason
			}
		}
	});
};

module.exports = ghp;
