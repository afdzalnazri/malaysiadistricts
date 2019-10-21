var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
const cors = require('cors');
const express = require('express');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('malaysia.db');

// GraphQL schema
var schema = buildSchema(`
    type Query {
      states: [Malaysia]
      statesFrom(offset:Int = 0, limit:Int = 10): [Malaysia]
      towns: [Malaysia]
      townsFrom(offset:Int = 0, limit:Int = 10): [Malaysia]
      state(state:String!): [Malaysia]
      town(town:String!): [Malaysia]
    }

    type Malaysia {
      ID: ID
      Negeri: String
      Kawasan: String
    }
`);

function query(sql, single) {
  return new Promise((resolve, reject) => {
    var callback = (err, result) => {
      if(err) {
        return reject(err);
      }
      resolve(result);
    };

    if(single) db.get(sql, callback);
    else db.all(sql, callback);
  });
}

// Root resolver
const root = {
    states: args => {
      return query(
        `SELECT DISTINCT Negeri FROM malaysia`,
        false
      );
    },
    statesFrom: args => {
      return query(
        `SELECT Negeri FROM malaysia LIMIT ${args.offset}, ${args.limit}`,
        false
      );
    },
    towns: args => {
      return query(
        `SELECT  Negeri, Kawasan FROM malaysia`,
        false
      );
    },
    townsFrom: args => {
      return query(
        `SELECT  Negeri, Kawasan FROM malaysia LIMIT ${args.offset}, ${args.limit}`,
        false
      );
    },
    state: args => {
      return query(
        `SELECT Negeri, Kawasan FROM malaysia WHERE Negeri like "%${args.state}%"`,
        false
      )
    },
    town: args => {
      return query(
        `SELECT Negeri, Kawasan FROM malaysia WHERE Kawasan like "%${args.town}%"`,
        false
      )
    }
};

//Create an express server and a GraphQL endpoint
var app = express().use(cors());
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running on localhost:4000/graphql'));
