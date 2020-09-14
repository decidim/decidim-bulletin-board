# Add an authority to the Bulletin Board

In order to add a new authority you will need:

* The authority name. The data type must be a string that can contain spaces.
* The authority public key. The data type must be a string, without spaces.

Having these data, you only have to go to a server console of the Bulletin Board and type:
```bash
bin/rails "client:add_authority[Authority name, public key]"
```

"Authority name" needs to be replaced by the authority name to add.
"public key" needs to be replaced by the public key of the authority to add.

As a result of this process you will obtain an API Key that you will have to send back to the Decidim Authority.
