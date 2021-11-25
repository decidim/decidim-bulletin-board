# README

The Bulletin Board is a service composed by an Encryption Engine and an Append-Only Log. External queries to the Encryption Engine are allowed through an API.

- Ruby version: 2.6
- Rails version: 6
- Python version: 3.8.2

- System dependencies:
- Python gmpy2 package dependencies: libgmp, libmpfr and libmpc

The Bulletin Board depends on the existence of a Decidim installation.


## Running on Docker

You can run this application conveniently packaged with docker compose.

You can use the existing [docker-composer.yml](docker-composer.yml) as start point.
It requires you to define a `.env` file with the following ENV variables:

```
SECRET_KEY_BASE=-your-rails-application-secret-
DATABASE_URL=postgres://USERNAME:PASSWOR@DATABASE/BULLETIN_DB
IDENTIFICATION_PRIVATE_KEY=-private-key-for-this-bulletin-board

```

#### Notes:

- Generate `SECRET_KEY_BASE` with `bin/rails secret`
- Generate `IDENTIFICATION_PRIVATE_KEY` with `bin/rails client:generate_identification_private_key`

### Configuration steps in this server (bulletin app):

- Initialize the database, database is not included in this docker compose file but it should be pretty straightforward.
  In order to initialize the database you need to run the comand `bin/rails db:create db:migrate`

- In you Decidim server (the one you want to connect with this one), execute
	`bin/rails decidim_elections:generate_identification_keys` (save the private key in you decidim environment)
	copy the public key as is presented (url encoded) and, now in this server, execute:

	`bin/rails 'client:add_authority[Authority name, public-key]'`

	Note that "Authority name" can be anything as long is the same in Decidim than here.

	**Important**: This step throws also an `API KEY` secret that needs to be configured in Decidim too.

#### Running the app with docker-compose


```bash
docker-compose up -d
```

Note that you still need to configure some proxy around it.
For instance a simple Nginx conf can be:

```
server {
    server_name bulletin.audit.platoniq.net;
    client_max_body_size 32M;
    listen 80 ;
    listen [::]:80 ;

    #listen [::]:443 ssl ipv6only=on; # managed by Certbot
    #listen 443 ssl; # managed by Certbot
    #ssl_certificate ...
    #ssl_certificate_key ...
    #include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    #ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    location / {
        proxy_pass http://127.0.0.1:8000;
   }
}

```

Note: you should add SSL configuration, for instance with [letsencrypt](https://certbot.eff.org/lets-encrypt)

This server is ready, you can access the hompage either at https://localhost:8000 or https:/you-server.com depending on your final configuration.

#### Executing console commands when using docker-compose

All previously specified commands need to be executed inside the running docker container. It is pretty easy to do that with docker compose, simply do:

Enter the container

```
docker-compose exec bulletin bash
```

Which gives you direct access to the console:

```
root@7805a01fbabb:/code/bulletin_board/server# 
```

In there, you can execute the `bin/rails c` to access the rails console, or any other command.

It is also possible to directly execut rails (or rake) comands:

```
docker-compose exec bulletin bin/rails db:migrate
```

**Important**, your application needs to be up and running for this to work (aka: `docker-compose up`)

### Configuration steps in Decidim server

This steps needs to be performed in the Decidim instance that wants to use the elections module.

Once you have this server configured, you will need the public key corresponding to the private key used in the
env var `IDENTIFICATION_PRIVATE_KEY`, simply use a browser and navigate to the homepage of the application, it will show the public key.

- Copy the public key to the env var `BULLETIN_BOARD_PUBLIC_KEY`
- Copy the `API KEY` obtained previously into the env var `BULLETIN_BOARD_API_KEY`
- Ensure you have the env var `AUTHORITY_PRIVATE_KEY` with the **private key** generate with the command `bin/rails decidim_elections:generate_identification_keys`
- Ensure that the `Authority name` is the same in both places (in Decidim needs to be declarated in the env var `AUTHORITY_NAME`)
- Be sure to point the env var `BULLETIN_BOARD_SERVER` to the bulletin server API path (that is usually https://yout-server.com/api)
- Env var `ELECTIONS_SCHEME_NAME` can currently be only `electionguard` (unless for testing purposes)
- Set up `ELECTIONS_NUMBER_OF_TRUSTEES` and `ELECTIONS_QUORUM` to, at least, the number 2

## Useful commands

First, clone the repository and enter in the new folder:

```
git clone git@github.com:decidim/decidim-bulletin-board.git
cd decidim-bulletin-board/server
```

Now, execute these commands:

```
bundle install
npm install
rails db:create
rails db:migrate
```

- How to run the rubocop linter

```
bundle exec rubocop
```

- How to run the test suite

```
bundle exec rspec
```

- How to update the GraphQL schema definition run:

```
bundle exec rake schema:generate
npm run schema:generate
```

## License

See [Decidim](https://github.com/decidim/decidim).
