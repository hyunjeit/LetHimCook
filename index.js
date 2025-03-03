/***
 * the main js file that runs the server, directs the user,
 * handles authentication, registration, and logging out
 */

/* dependencies */
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload'); //... for some reason express-fileupload makes the site not load...

const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
/* end of dependencies*/

// import user
const User = require('./models/User');

// limit file sizes to 50MB
app.use(fileupload({
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.set('view-engine', 'hbs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/auth_demo');

// Check DB connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// initialize session
app.use(
    session({
        // TODO: improve on the secret key for security reasons
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set to true if using https
            maxAge: 24 * 60 * 60 * 1000  // Default session cookie expiration (1 day)
        }
    })
);

// Remember me cookie expiration
const rememberMeCookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

// redirect unauthenticated user to login when attempting to view certain pages
const isAuthenticated = (req,res,next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
}

/* page directing */
app.get('/', (req, res) => {
    res.render('james/index.hbs');
    // TODO: use res.sendfile instead
})

app.get('/login', (req, res) => {
    res.render('james/log_in_page.hbs');
    console.log(req.session.user);
    // TODO: use res.sendfile instead
})

// main forum requires that the user is logged in
app.get('/main_forum', isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('nian/main_forum.hbs', {userData});
})

app.get('/profile', isAuthenticated, (req,res) => {
    const userData = req.session.user;
    res.render('jei/profile.hbs', {userData});
})

app.get('/edit_profile', isAuthenticated, (req,res) => {
    const userData = req.session.user;
    res.render('jei/edit_profile.hbs', {userData});
})

// an alternate version of the forum where the user is not authenticated
app.get('/main_forum_unauthenticated', (req, res) => {
    res.render('nian/main_forum_logged_out.hbs');
})

app.get('/register', (req, res) => {
    res.render('james/create_account_page.hbs');
})
/* end of page directing */

// login route
app.post('/login', async (req, res) => {
    const { username, password , remember_me} = req.body;

    // TODO: if user is already authenticated because they chose to be remembered, immediately redirect to main forum
    try {
        // use username from req.body to look for the user
        // TODO: usernames should probably not be allowed to coincide with email names...
        let user = await User.findOne({ username });

        if (!user) {
            // if user was not found, treat the username from req.body as the email instead
            // this allows the login feature to accept either username or email
            user = await User.findOne({email: username});

            if (!user){
                // if user was not found, send to another page
                // TODO: make this page look better, or make it a popup
                return res.send("Invalid credentials. <a href='/login'>Try again</a>");
            }
        }

        // Compare the hashed password with the plaintext password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // TODO: make this page look better, or make it a popup
            return res.send("Invalid credentials. <a href='/login'>Try again</a>");
        }

        // Store user data in session
        req.session.user = { 
            username: user.username, 
            userID: user._id, 
            //profileImage: user.profileImage,
            bio: user.bio};
        res.cookie("sessionId", req.sessionID);
        console.log(req.session.user);

        // if remembering user, set cookie max age to 30 days
        if (remember_me){
            req.session.cookie.maxAge = rememberMeCookieMaxAge; // Set cookie to 30 days
        }

        res.redirect("/main_forum");

    } catch (error) {
        // TODO: perhaps this should also be a popup, though ideally this scenario should never happen
        res.status(500).send("Error logging in. " + error);
    }
});

// register route
app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            // TODO: make it nicer or make it a popup
            return res.send("Username already taken. <a href='/register'>Try again</a>");
        }

        // Create and save new user with encrypted password
        const newUser = new User({ email, username, password });
        await newUser.save();

        res.send("Registration successful! <a href='/login'>Login here</a>");
    } catch (error) {
        res.status(500).send("Error registering user. " + error);
    }
})

// user bio and username edit route
app.post('/update_profile', async (req, res) => {
    try {
        // inputs from the form
        const { InputUsername, description } = req.body;
        console.log("Inputs: " + InputUsername, description);

        // the current user's username
        const currentUserName = req.session.user.username;
        // get the current user from the database
        const currentUser = await User.findOne({ username : currentUserName});
        
        // Check if user already exists
        const existingUser = await User.findOne({ username : InputUsername });
        console.log("User of the same name exists: " + existingUser);

        // only allow the username to change if it has not already been taken since they must be unique
        if (!existingUser && InputUsername != "") {
            // edit the name of the user only after checking if the name hasn't already been taken
            const updatedUser = await User.findOneAndUpdate(
                { _id: currentUser._id },  // Find user by ID of current user
                { username: InputUsername }, // Update username
                { new: true } // Return the updated user
            );

            if (updatedUser){
                req.session.user.username = InputUsername;
                console.log("New username:" + InputUsername);
            }
        }else{
            // TODO: popup informing the user that username has already been taken
        }

        // edit bio no matter what since it has no restrictions
        await User.findOneAndUpdate(
            {_id: currentUser._id}, // Find user by id of current user
            {bio: description }, // Update biography
        )
        req.session.user.bio = description;

        // upload file with file name to match the user's id if a file has been uploaded
        if (req.files){
            const {profilePic} = req.files
            console.log("abc");
            if (profilePic){
                profilePic.mv(path.resolve(__dirname,'public/profilePics',req.session.user.userID+".jpg",),(error) => {
                    if (error)
                    {
                        console.log ("Error!")
                    }
                    else
                    {
                        console.log("Successfully changed profile picture");
                    }
                })
            }
        }

        // TODO: make this a popup
        res.send("Successfully updated profile <a href='/profile'>Back to profile</a>");
    } catch (error) {
        res.status(500).send("Error editing profile. " + error);
    }
})

// logout route
app.get('/logout', (req,res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out.");
        }

        // Clear the session cookie from the user's browser
        res.clearCookie('sessionId'); 

        // Redirect to the landing page
        res.redirect('/');
    });
})

app.listen(3000);
