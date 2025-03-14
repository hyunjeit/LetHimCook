In order to run the MCO Phase 2, the zip file should be downloaded and extracted first. Once done, the user should then initialize the project folder as a JS application using the "npm init -y" command. After that, the user is then required to install the following packages using the "npm install ____" command:
    - express
    - express-session
    - cookie-parser
    - express-fileupload
    - bcrypt
    - body-parser
    - mongoose

After installing the necessary packages, ensure that the MongoDB database is empty by checking the connection with the URL "mongodb://127.0.0.1:27017/auth_demo".

After installing the packages listed above and ensuring that the DB is empty, the program can now be run using the command "node index.js". The sample data will be seeded in the DB, and the program will run through the "localhost:3000" address. 

The user is first presented with the landing page, where they can either log-in or create their account. As there are sample data, logging-in as the sample users is possible using their usernames as both the username and password. Here are the following sample users:
    - SweetTreatsMama
    - DadCooksDaily
    - GrillMasterMike
    - TheSpicySpoon
    - ChefInTrainingEm
Furthermore, it is also possible to browse the forum while logged-out, though the user will not be able to interact with posts and comments. Additionally, an account can also be created which will allow a user to have their own account and access the web application's functionalities.

Once logged in, a user can then: browse through posts; open posts (which will show comments under it, if any); create, edit, and delete their own posts and comments; view profiles; edit their own profile as well as their picture; and search for keywords and tags.