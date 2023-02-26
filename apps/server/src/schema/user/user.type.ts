import gql from "graphql-tag";

export default gql`
  type User {
    id: UUID!
    createdAt: Date!
    updatedAt: Date!

    email: String
    firstName: String
    lastName: String
  }

  extend type Query {
    userInfo: User!
    users: [User!]!
  }

  extend type Mutation {
    changeUserName: Boolean
  }
`;
