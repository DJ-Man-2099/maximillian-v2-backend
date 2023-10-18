const { buildSchema, buildASTSchema } = require("graphql");

const myschema = require("./schema.graphql");
module.exports = buildASTSchema(myschema);
/* module.exports = buildSchema(`
type Post {
	_id: ID!
	title: String!
	content: String!
	imageUrl: String!
	creator: User!
	createdAt: String!
	updatedAt: String!
}

type User {
	_id: ID!
	email: String!
	name: String!
	password: String!
	status: String!
	posts: [Post!]!
}

type AuthData {
	token: String!
	userId: String!
}

input UserData {
	email: String!
	password: String!
	name: String!
}

type RootMutation {
	createUser(userInput: UserData): User
}

type RootQuery {
	login(email:String!, password:String): AuthData!
}

schema {
	query: RootQuery
	mutation: RootMutation
}
`);
 */
