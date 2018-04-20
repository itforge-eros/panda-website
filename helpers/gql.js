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
ghp.getSpacesInDepartment = (apollo, deptName) => {
	return apollo.query({
		query: gql`
			{
				department(name: "${deptName}") {id name spaces {name fullName}}
			}
		`
	})
};
ghp.getRolesInDepartment = (apollo, deptName) => {
	return apollo.query({
		query: gql`
			{
				department(name: "${deptName}") {id name roles {id name}}
			}
		`
	})
};
ghp.getMaterials = (apollo, deptName) => {
	// can accept auth
	return apollo.query({
		query: gql`
			{
				department(name: "${deptName}") {materials {id name {th}}}
			}
		`
	})
};
ghp.getPermissions = apollo => {
	return apollo.query({
		query: gql`
			{
				permissions { name description }
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
ghp.getMemberId = (apollo_auth, username) => {
	return apollo_auth.query({
		query: gql`
			{
				member(username: "${username}") {id}
			}
		`
	})
}
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
ghp.getRole = (apollo_auth, roleId) => {
	return apollo_auth.query({
		query: gql`
			{
				role(id: "${roleId}") {id name permissions {name}}
			}
		`
	})
}
ghp.getRoleMembers = (apollo_auth, roleId) => {
	return apollo_auth.query({
		query: gql`
			{
				role(id: "${roleId}") {id name members {id username firstName lastName}}
			}
		`
	})
}
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
ghp.createRole = (apollo_auth, r) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($roleInput: CreateRoleInput!) {
				createRole(input: $roleInput) {id}
			}
		`,
		variables: {
			"roleInput": {
				"departmentId": r.deptId,
				"name": r.name,
				"description": r.description,
				"permissions": r.permissions
			}
		}
	});
};
ghp.assignRole = (apollo_auth, roleId, memberId) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation {
				assignRole(input: {roleId: "${roleId}", memberId: "${memberId}"}) { id }
			}
		`
	})
}

module.exports = ghp;
