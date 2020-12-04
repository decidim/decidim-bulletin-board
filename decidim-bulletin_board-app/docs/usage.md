## About the GraphQL API

[Decidim Bulletin Board](https://github.com/decidim/decidim-bulletin-board) comes with an API that follows the [GraphQL](https://graphql.org/) specification.

Typically (although some particular installations may change that) you will find 3 relevant folders:

* `URL/api` The route where to make requests. Request are usually in the POST format.
* `URL/api/docs` This documentation, every Decidim site should provide one.
* `URL/api/graphiql` [GraphiQL](https://github.com/graphql/graphiql) is a in-browser IDE for exploring GraphQL APIs. Some Decidim Bulletin Board installations may choose to remove access to this tool. In that case you can use a [standalone version](https://electronjs.org/apps/graphiql) and use any `URL/api` as the endpoint

### Using the GraphQL API

The GraphQL format is a JSON formatted text that is specified in a query. Response is a JSON object as well. For details about specification check the official [GraphQL site](https://graphql.org/learn/).

The most practical way to experiment with GraphQL is to use the in-browser IDE GraphiQL. It provides access to the documentation and auto-complete (use CTRL-Space) for writing queries.

### Usage limits

Decidim Bulletin Board is just a Rails application, meaning that any particular installation may implement custom limits in order to access the API (and the application in general).

### Decidim Bulletin Board structure, Types, collections and Polymorphism

There are no endpoints in the GraphQL specification, instead objects are organized according to their "Type".

These objects can be grouped in a single, complex query. Also, objects may accept parameters, which are "Types" as well.

Each "Type" is just a pre-defined structure with fields, or just an Scalar (Strings, Integers, Booleans, ...).

For instance, to obtain *all the clients registered in the Bulletin Board*, we could execute the next query:

```
query {
  clients{
    id
    name
    publicKey
    type
  }
}
```

Response should look like:

```
{
  "data": {
    "clients": [
      {
        "id": "29",
        "name": "Decidim Barcelona",
        "publicKey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAA-----END PUBLIC KEY-----",
        "type": "Authority"
      },
      {
        "id": "30",
        "name": "Decidim Helsinki",
        "publicKey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAA-----END PUBLIC KEY-----",
        "type": "Authority"
      },
      {
        "id": "31",
        "name": "Decidim Lleida",
        "publicKey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAA-----END PUBLIC KEY-----",
        "type": "Authority"
      },
      {
        "id": "32",
        "name": "Decidim Berlin",
        "publicKey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAA-----END PUBLIC KEY-----",
        "type": "Authority"
      }
    ]
  }
}
```

#### What happened?

In the former query, each keyword represents a type, the words `id`, `name`, `publicKey`, `type` are scalars, all of them Strings.

The other keywords however, are objects representing certain entities:

- `clients` is a type that represents a collection of clients. It accepts arguments (`filter` and `order`), which are other object types as well. `id`, `name`, `publicKey` and `type` are the fields of the client.

Finally, note that the returned object is an array, each item of which is a representation of the object we requested.