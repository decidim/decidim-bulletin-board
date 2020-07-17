# Add an authority to the Bulletin Board

In order to add a new authority you will need:

* The authority name
* The authority public key

Having these data, you only have to go to a server console of the Bulletin Board and type:
```rails "client:add_authority[Authority name, public key]"
```

"Authority name" needs to be replaced by the authority name to add.
"public key" needs to be replaced by the publoic key of the authority to add.

As a result of these process you will obtain an API Key that you will have to send back to the Decidim Authority.