## DevZilla.co ##

This is the groundwork for the devzilla.co website.  

This is a full stack node.js application using `knex` and `bookshelf` to handle the backend layers, and `reactjs` and `alt` to handle the frontend views and layers.

The application is heavily influenced by Ghost, and is initially used as a learning and understanding process for me in building node full-stack node applications using the awesome frontend framework that is react and flux


#### Setup ####
To start the server:

```
npm start
```

If the config.example.js doesn't copy over to config.js you might have to do this manually.

This application supports postgresql, mysql, and sqlite3.  Just make sure that the config file points to a database and the application should start right away.


