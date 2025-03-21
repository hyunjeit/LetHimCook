/***
 * the main js file that runs the server, directs the user,
 * handles authentication, registration, and logging out
 */

/* dependencies */
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');//temp
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
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const seedDatabase = require('./seedData');

// limit file sizes to 50MB
app.use(fileupload({
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.set('view-engine', 'hbs');
const hbs = require('hbs');

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://nianmuros:niansmongo@cluster0.uestz.mongodb.net/auth_demo');

// Check DB connection
mongoose.connection.once('open', async () => {
    console.log('Connected to MongoDB');
    await seedDatabase();
});

// initialize session
app.use(
    session({
        // TODO: improve on the secret key for security reasons
        secret: "secret-key",
        store: MongoStore.create(options),//temp
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

// fixes date formatting of seeded posts and comments
const fixDateField = async () => {
    try {
        // Fix dates for posts
        await Post.updateMany(
            { date: { $type: "string" } },
            [
                { $set: { date: { $dateFromString: { dateString: "$date" } } } }
            ]
        );

        // Fix dates for comments
        await Comment.updateMany(
            { date: { $type: "string" } },
            [
                { $set: { date: { $dateFromString: { dateString: "$date" } } } }
            ]
        );

        console.log("✅ Dates automatically converted to ISODate.");
    } catch (error) {
        console.error("❌ Failed to auto-fix dates:", error);
    }
};
fixDateField();

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

app.get('/make_post', isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('lui/make_post.hbs', { userData });
});

// create post
app.post('/add_post', isAuthenticated, async (req, res) => {
    try {
        const userData = req.session.user;
        const { header, content } = req.body;
        let imageFileName = '';

        // Handle image upload if an image was submitted
        if (req.files && req.files.postImage) {
            const postImage = req.files.postImage;
            imageFileName = `${Date.now()}-${postImage.name}`;
            postImage.mv(path.resolve(__dirname, 'public/media', imageFileName), (error) => {
                if (error) {
                    console.error("Error uploading image:", error);
                    return res.status(500).send("Failed to upload image.");
                }
            });
        }

        // Create a new post
        const newPost = new Post({
            author: userData.userID,
            header: header,
            content: content,
            img: imageFileName || null,
            date: new Date(),
            edited: false
        });

        await newPost.save();
        res.redirect('/main_forum');
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Failed to create post.");
    }
});

// edit post
app.get('/edit_post', isAuthenticated, async (req, res) => {
    try {
        const postId = req.query.postId;
        const userData = req.session.user;

        const post = await Post.findById(postId);
        if (!post || post.author.toString() !== userData.userID) {
            return res.status(403).send("You can only edit your own posts.");
        }

        res.render('lui/edit_post.hbs', { post, userData });
    } catch (error) {
        console.error("Error loading post:", error);
        res.status(500).send("Failed to load post.");
    }
});

// update post
app.post('/update_post', isAuthenticated, async (req, res) => {
    try {
        const { postId, header, content } = req.body;
        const userData = req.session.user;

        const post = await Post.findById(postId);
        if (!post || post.author.toString() !== userData.userID) {
            return res.status(403).send("You can only edit your own posts.");
        }

        // Update the post
        post.header = header;
        post.content = content;
        post.edited = true;
        await post.save();

        res.redirect('/main_forum');
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).send("Failed to update post.");
    }
});

// create comment
app.post('/add_comment', isAuthenticated, async (req, res) => {
    try {
        const { commentContent, postId } = req.body;
        const user = req.session.user;

        // Create a new comment
        const newComment = new Comment({
            content: commentContent,
            author: user.userID,
            post: postId,
            date: new Date(),
            edited: false
        });

        await newComment.save();
        res.redirect(`/open_post_logged_in?postId=${postId}`);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).send("Failed to add comment.");
    }
});

// edit comment
app.get('/edit_comment', isAuthenticated, async (req, res) => {
    try {
        const { commentId, postId } = req.query;
        const userData = req.session.user;

        const comment = await Comment.findById(commentId);
        if (!comment || comment.author.toString() !== userData.userID) {
            return res.status(403).send("You can only edit your own comments.");
        }

        res.render('lui/edit_comment.hbs', { comment, postId, userData });
    } catch (error) {
        console.error("Error loading comment:", error);
        res.status(500).send("Failed to load comment.");
    }
});

//update comment
app.post('/update_comment', isAuthenticated, async (req, res) => {
    try {
        const { commentId, content, postId } = req.body;
        const userData = req.session.user;

        const comment = await Comment.findById(commentId);
        if (!comment || comment.author.toString() !== userData.userID) {
            return res.status(403).send("You can only edit your own comments.");
        }

        // Update the comment
        comment.content = content;
        comment.edited = true;

        await comment.save();

        res.redirect(`/open_post_logged_in?postId=${postId}`);
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).send("Failed to update comment.");
    }
});

// main forum requires that the user is logged in
app.get('/main_forum', isAuthenticated, async (req, res) => {
    try {
        const userData = req.session.user;
        const posts = await Post.find().populate('author', 'username').sort({ date: -1, _id: 1 }); // Fetch posts with author usernames

        // Format posts for Handlebars
        const formattedPosts = posts.map(post => ({
            _id: post._id.toString(),
            author: post.author.username, 
            authorID: post.author._id.toString(), 
            date: new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            header: post.header,
            content: post.content,
            img: post.img,
            edited: post.edited
        }));

        res.render('nian/main_forum.hbs', { userData, posts: formattedPosts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Error loading posts.");
    }
});

app.get('/open_post_logged_in', isAuthenticated, async (req, res) => {
    try {
        const userData = req.session.user;
        const postId = req.query.postId;

        if (!postId) {
            return res.status(400).send("Post ID is required.");
        }

        const post = await Post.findById(postId).populate('author', 'username');
        if (!post) {
            return res.status(404).send("Post not found.");
        }

        const comments = await Comment.find({ post: postId }).populate('author', 'username').sort({ date: -1, _id: 1 });


        res.render('lui/open_post_logged_in.hbs', { 
            userData: {
                userID: userData.userID,
                username: userData.username
            }, 
            post: {
                _id: post._id.toString(),
                author: post.author.username,
                authorID: post.author._id.toString(), 
                date: new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                header: post.header,
                content: post.content,
                img: post.img,
                edited: post.edited
            },
            comments: comments.map(comment => ({
                _id: comment._id.toString(),
                author: comment.author.username,
                authorID: comment.author._id.toString(),
                userID: userData.userID,
                date: comment.date ? new Date(comment.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }) : 'Just now',
                content: comment.content,
                edited: comment.edited
            }))
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send("Error loading post.");
    }
});


app.get('/open_post_logged_out', async (req, res) => {
    try {
        const userData = req.session.user;
        const postId = req.query.postId;

        if (!postId) {
            return res.status(400).send("Post ID is required.");
        }

        const post = await Post.findById(postId).populate('author', 'username');

        if (!post) {
            return res.status(404).send("Post not found.");
        }

        // Fetch comments related to this post and populate the author
        const comments = await Comment.find({ post: postId }).populate('author', 'username').sort({ date: -1, _id: 1 });

        res.render('lui/open_post_logged_out.hbs', { 
            userData, 
            post: {
                _id: post._id.toString(),
                author: post.author.username,
                authorID: post.author._id.toString(),
                date: new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                header: post.header,
                content: post.content,
                img: post.img,
                edited: post.edited
            },
            comments: comments.map(comment => ({
                _id: comment._id.toString(),
                author: comment.author.username,
                authorID: comment.author._id.toString(), // Pass userID for profile pic
                date: new Date(comment.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                content: comment.content,
                edited: comment.edited
            }))
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send("Error loading post.");
    }
});

app.get('/profile', isAuthenticated, async (req, res) => {
    const loggedInUser = req.session.user;
    const profileUserId = req.query.userId || loggedInUser.userID;

    try {
        const profileUser = await User.findById(profileUserId);
        if (!profileUser) return res.status(404).send("User not found.");

        // Fetch posts by the profile user
        const posts = await Post.find({ author: profileUserId }).sort({ date: -1 });

        res.render('jei/profile.hbs', {
            userData: { 
                userID: loggedInUser.userID.toString(),
                username: loggedInUser.username
            },
            profileUser: {
                username: profileUser.username,
                userID: profileUser._id.toString(),  // Ensure string format
                bio: profileUser.bio,
                profileImage: `/profilePics/${profileUser._id}.jpg`
            },
            posts: posts.map(post => ({
                _id: post._id.toString(),
                author: profileUser.username,
                authorID: profileUser._id.toString(),
                date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                header: post.header,
                content: post.content,
                img: post.img,
                edited: post.edited
            }))
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Failed to load profile.");
    }
});



app.get('/edit_profile', isAuthenticated, (req,res) => {
    const userData = req.session.user;
    res.render('jei/edit_profile.hbs', {userData});
})

// an alternate version of the forum where the user is not authenticated
app.get('/main_forum_unauthenticated', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ date: -1, _id: 1 }); // Fetch posts with author usernames

        // Format posts for Handlebars
        const formattedPosts = posts.map(post => ({
            _id: post._id.toString(),
            author: post.author.username, 
            authorID: post.author._id.toString(), 
            date: new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            header: post.header,
            content: post.content,
            img: post.img,
            edited: post.edited
        }));

        res.render('nian/main_forum_logged_out.hbs', { posts: formattedPosts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Error loading posts.");
    }
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
                //return res.send("Invalid credentials. <a href='/login'>Try again</a>");
                return res.redirect('/login');
            }
        }

        // Compare the hashed password with the plaintext password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // TODO: make this page look better, or make it a popup
            //return res.send("Invalid credentials. <a href='/login'>Try again</a>");
            return res.redirect('/login');
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
        let existingUser = await User.findOne({ username });

        if (!existingUser) {
            // if user was not found, treat the username from req.body as the email instead
            // this allows the register feature to check for either either username or email
            existingUser = await User.findOne({username: email});

            if (existingUser){
                // if user was not found, send to another page
                // TODO: make this page look better, or make it a popup
                return res.send("User already exists. <a href='/register'>Try again</a>");
            }
        }

        // Create and save new user with encrypted password
        const newUser = new User({ email, username, password });
        await newUser.save();

        // res.send("Registration successful! <a href='/login'>Login here</a>");

        res.redirect("/login");
    } catch (error) {
        res.status(500).send("Error registering user. " + error);
    }
})

// user bio and username edit route
app.post('/update_profile', isAuthenticated, async (req, res) => {
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
        //console.log("User of the same name exists: " + existingUser);

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
        }else {
            if (InputUsername != currentUserName){
                // TODO: popup informing the user that username has already been taken
                res.json({ message: "Entered username has already been taken" });
            }
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

        // send alert message through the response object
        // res.send("Successfully updated profile <a href='/profile'>Back to profile</a>");
        res.redirect("/edit_profile")
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

//search functionality
app.get('/main_forum_search', isAuthenticated, async (req, res) => {
    try {
        const userData = req.session.user;
        const searchQuery = req.query.search || '';

        // Find posts that match the search query in either header or content (case-insensitive)
        const posts = await Post.find({
            $or: [
                { header: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } }
            ]
        }).populate('author', 'username').sort({ date: -1, _id: 1 });

        // Format posts for Handlebars
        const formattedPosts = posts.map(post => ({
            _id: post._id.toString(),
            author: post.author.username, 
            authorID: post.author._id.toString(), 
            date: new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            header: post.header,
            content: post.content,
            img: post.img,
            edited: post.edited
        }));

        res.render('nian/main_forum_search.hbs', { 
            userData, 
            posts: formattedPosts, 
            query: searchQuery 
        });
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).send("Error loading search results.");
    }
});

// helper for hastag
hbs.registerHelper('highlightHashtags', function(text) {
    if (text) {
        // Replace hashtags (#word) with a link to the search route.
        // The search parameter is URL-encoded. We use a simple regex here.
        const highlighted = text.replace(/#(\w+)/g, '<a href="/main_forum_search?search=%23$1" class="hashtag">#$1</a>');
        return new hbs.SafeString(highlighted);
    }
    return text;
});

// delete posts
app.get('/delete_post', isAuthenticated, async (req, res) => {
    try {
        const postId = req.query.postId;
        const userData = req.session.user;

        // Find the post and verify the author
        const post = await Post.findById(postId);
        if (!post || post.author.toString() !== userData.userID) {
            return res.status(403).send("You can only delete your own posts.");
        }

        // Delete all comments related to the post
        await Comment.deleteMany({ post: postId });

        // Delete the post itself
        await Post.findByIdAndDelete(postId);

        // Redirect back to the main forum
        res.redirect('/main_forum');
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Failed to delete post.");
    }
});

// delete comments
app.get('/delete_comment', isAuthenticated, async (req, res) => {
    try {
        const { commentId, postId } = req.query;
        const userData = req.session.user;

        // Find the comment and verify the author
        const comment = await Comment.findById(commentId);
        if (!comment || comment.author.toString() !== userData.userID) {
            return res.status(403).send("You can only delete your own comments.");
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Redirect back to the post
        res.redirect(`/open_post_logged_in?postId=${postId}`);
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).send("Failed to delete comment.");
    }
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
