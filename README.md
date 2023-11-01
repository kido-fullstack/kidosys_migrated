# Kidosys

Kidosys is a software solution designed to streamline and optimize the process of attracting, capturing, and nurturing potential leads throughout their journey from initial inquiry to enrollment. This system helps kido school effectively manage and convert prospective students into enrolled students.

# README

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* This repository includes kidosys backend with admin panel and apis routes.
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* For development, you will need Node.js(v16.17.1), MongoDB(v5.0), Redis Stable and a node global package, installed in your environment. Please make sure while you install node package, version should be v16.17.1.
    - ##### Node installation on Windows

        - Just go on [official Node.js website](https://nodejs.org/) and download the installer. Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).
    - ##### Node installation on Ubuntu

        - You can install nodejs and npm easily with apt install, just run the following commands.
            ```sh
            sudo apt install nodejs
            sudo apt install npm
            ```
    - ##### Other Operating Systems
        - You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).
     - If the installation was successful, you should be able to run the following command.
        ```sh
        node --version
        v16.17.1
        ```

* Database Configuration - Put mongoURI in `config/index.js`, under `db` -> `devdb` or `serverdb` -> `uri`.

* Dependencies - You will need to have the correct keys in `config/index.js`. Please contact administration for config keys. On production, keys are fetching from different environment- Please contact administration for this.

* Other Setup - Cron has been setup to update the data into redis DB.

* Before starting the project, Please contact administration for config keys.

- After installing the node js, configuring mongoURI on config & stating the keys correctly-
    ```sh
    cd kidosys
    npm install
    npm run dev
    ```
    Admin panel & APis will successfully start.

* Deployment instructions - Setup `pm2` on server- for more information on pm2 [click here](https://pm2.keymetrics.io/).
On server, go to main folder and take a pull, then do
    ```sh
    pm2 restart ID
    ```
    For production environment, `set env to production` & `devenv to prod` inside `config/index.js`

### Tech Used

Kidosys uses a number of tech to work properly:

- [PugJs](https://pugjs.org/api/getting-started.html) - Admin panel frontend.
- [NodeJS](https://nodejs.org/en) - Evented I/O for the backend.
- [Bootstrap](https://getbootstrap.com/) - great UI boilerplate for modern web apps.
- [Express](https://expressjs.com/) - Fast node.js network app framework.
to Markdown converter
- [Redis](https://redis.io/) - Caching purposes. For roles & permissions.
- [jQuery](https://jquery.com/) - To manupulate DOM

### Contribution guidelines

* Writing tests
* Code review
* Other guidelines

### Who do I talk to?

* Repo owner or admin
* Other community or team contact
