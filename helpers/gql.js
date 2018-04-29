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
					id name fullName description capacity tags isAvailable images department {name fullThaiName} reservations {date period {start end}}
				}
			}
		`
	});
};
ghp.getSpacesInDepartment = (apollo, deptName) => {
	return apollo.query({
		query: gql`
			{
				department(name: "${deptName}") {id name spaces {id name fullName}}
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
ghp.getDepartments = apollo => {
	return apollo.query({
		query: gql`
			{
				departments { id name fullThaiName }
			}
		`
	})
};

// require auth
ghp.getAccesses = (apollo_auth, deptName) => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					accesses(department: "${deptName}")
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
					departments { edges { node { id name fullThaiName } } }
					roles {
						id
						name
						department { id name fullThaiName description }
						permissions { accesses }
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
					materials
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

ghp.getRequestsInDepartment = (apollo_auth, deptName) => {
	return apollo_auth.query({
		query: gql`
			{			  
				department(name: "${deptName}") {
					fullThaiName
					spaces {
						requests {
							id dates status
							period { start end }
							client { firstName lastName }
							space { fullName }
						}
					}
				}
			}
		`
	})
}

ghp.getProblemsInDepartment = (apollo_auth, deptName) => {
	return apollo_auth.query({
		query: gql`
			{
				department(name: "${deptName}") { spaces { fullName problems { id title isRead } } }
			}
		`
	})
}

ghp.getRequestDetailForReviewing = (apollo_auth, requestID) => {
	return apollo_auth.query({
		query: gql`
			{
				request(id: "${requestID}") {
					id body dates status createdAt materials
					period {start end}
					space {fullName department {fullThaiName}}
					client {firstName lastName}
					reviews {id reviewer {id}}
				}
			}
		`
	})
}

ghp.getProblem = (apollo_auth, probId) => {
	return apollo_auth.query({
		query: gql`
			{
				problem(id: "${probId}") { id body title isRead createdAt space { fullName department { fullThaiName } } }
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
				"isAvailable": sp.isAvailable == "true" ? true : false,
				"departmentId": sp.deptId,
				"tags": sp.tags
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
				"dates": [rq.date],
				"period": {
					"start": parseInt(rq.start),
					"end": parseInt(rq.end)
				},
				"spaceId": rq.space,
				"body": rq.reason,
				"materials": rq.materials != undefined ? rq.materials : []
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
ghp.createReview = (apollo_auth, id, event) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation {		  
			 	createReview(input: {requestId: "${id}", event: ${event}}) { id }
			}
		`
	})
}
ghp.cancelRequest = (apollo_auth, requestId) => {
	return apollo_auth.mutate({
		mutation: gql`
			{
				mutation {
					cancelRequest(input: {requestId: "${requestId}"}) {id}
				}
			}
		`
	})
}
ghp.assignRole = (apollo_auth, roleId, memberId) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation {
				assignRole(input: {roleId: "${roleId}", memberId: "${memberId}"}) { id }
			}
		`
	})
}
ghp.updateSpace = (apollo_auth, sp) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($spaceInput: UpdateSpaceInput!) {
				updateSpace(input: $spaceInput) { id name department {name} }
			}
		`,
		variables: {
			"spaceInput": {
				"spaceId": sp.spaceId,
				"name": sp.name.toLowerCase().replace(/ /g, "-"),
				"fullName": sp.fullName,
				"description": sp.description,
				"capacity": parseInt(sp.capacity),
				"isAvailable": sp.isAvailable == "true" ? true : false,
				"tags": sp.tags
			}
		}
	})
}
ghp.updateRole = (apollo_auth, r) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($roleInput: UpdateRoleInput!) {
				updateRole(input: $roleInput) { id }
			}
		`,
		variables: {
			"roleInput": {
				"roleId": r.roleId,
				"name": r.name,
				"description": r.description,
				"permissions": r.permissions
			}
		}
	})
}
ghp.updateProblem = (apollo_auth, probId) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation { updateProblem(input: {problemId: "${probId}", isRead: true}) {id} }
		`
	})
}
ghp.deleteRole = (apollo_auth, roleId) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation {
				deleteRole(input: {roleId: "${roleId}"}) { id }
			}
		`
	})
}
ghp.deleteSpace = (apollo_auth, spaceId) => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation {
				deleteSpace(input: {spaceId: "${spaceId}"}) { id }
			}
		`
	})
}

module.exports = ghp;
