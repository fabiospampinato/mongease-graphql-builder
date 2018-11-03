# Mongease Graphql Builder

Module for auto-generating simple GraphQL queries from Mongease descriptions.

## Install

```shell
$ npm install --save mongease-graphql-builder
```

## Usage

```js
import Mongease from 'mongease';
import MongeaseGraphQL from 'mongease-graphql';
import Builder from 'mongease-graphql-builder';

Mongease.plugin ( MongeaseGraphQL.make );

Mongease.make ( 'Book', {
  schema: {
    title: String,
    category: Number,
    read: Boolean
  },
  resolvers: {
    Query: {
      findBooks () {}
    },
    Mutation: {
      bookMarkAsRead () {}
    }
  }
});

Builder.query ( 'findBooks', true ); // GraphQL query as string
Builder.mutation ( 'bookMarkAsRead' ) // GraphQL-ready mutation
```

## API

### `.query ( resolver: string, string = false )`

Creates and returns a GraphQL query, given the name of the resolver.

### `.mutation ( resolver: string, string = false )`

Creates and returns a GraphQL mutation, given the name of the resolver.

### `.subscription ( resolver: string, string = false )`

Creates and returns a GraphQL subscription, given the name of the resolver.

## Related

- [mongoose-to-graphql](https://github.com/fabiospampinato/mongoose-to-graphql) - Converts a Mongoose schema to its GraphQL representation.
- [mongease](https://github.com/fabiospampinato/mongease) - Tiny wrapper around Mongoose for easier creation of schemas and models. Supports plugins.
- [mongease-graphql](https://github.com/fabiospampinato/mongease-graphql) - Mongease plugin for adding support to GraphQL schemas creation.

## License

MIT © Fabio Spampinato
