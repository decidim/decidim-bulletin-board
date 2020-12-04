# Server setup

The Bulletin Board requires that all messages should be signed to be published. Thus, all involved parts of an election (authority, trustees and the bulletin board itself) should have identification keys.

## Generating an identification pair of keys for the Bulletin Board

This can be done running the following rake task in your application environment:

```bash
bin/rails client:generate_identification_private_key
```

This task will output the generated private key. You should copy the private key and store that value on the environment variable IDENTIFICATION_PRIVATE_KEY.

Ensure that the private key is not lost between deployments and servers reboots and that it can be accessed by the application only.

## Adding an authority as a client of the Bulletin Board

In order to allow an authority to connect to this Bulletin Board instance you will need:

* The authority name. The data type must be a string that can contain spaces.
* The authority public key. The data type must be a string, without spaces.

Having these data, you only have to go to a server console of the Bulletin Board and type:

```bash
bin/rails 'client:add_authority[Authority name, public key]'
```

"Authority name" needs to be replaced by the authority name to add.
"public key" needs to be replaced by the public key of the authority to add.

As a result of this process you will obtain an API Key that you will have to send back to the Decidim Authority.
