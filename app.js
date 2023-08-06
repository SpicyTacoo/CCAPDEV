import "dotenv/config";
import express from "express";
import hbs from "hbs";
import path from "path";
import {fileURLToPath} from 'url';
import { connectToMongo, getDb } from "./db/conn.js";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session"; 
import { ObjectId } from 'mongodb';

/** ADDED */
import Reviews from "./model/Reviews.js";
import Comments from "./model/Comments.js";
// import Restaurant from "./model/Restaurant.js";
import User from "./model/User.js";
import { getAllReplyOfUser, getAllReviewsOfUser, getUserID, getUserInfo } from "./controller/viewProfileController.js";
import { checkUsername, createUser } from "./controller/UserController.js";
import { getUser } from "./controller/editProfileController.js";
import bcrypt from "bcrypt";

// to allow __dirname to work in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

hbs.registerHelper('isEqual', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("when", function(operand_1, operator, operand_2, options) {
    var operators = {
    'eq': function(l,r) { return l == r; },
    'noteq': function(l,r) { return l != r; },
    }
    , result = operators[operator](operand_1,operand_2);

    if (result) return options.fn(this);
    else  return options.inverse(this);
});

const app = express();
app.use(session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
}));

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.json())
app.use(express.static(__dirname + '/public'));

app.set("view engine", "hbs")

hbs.registerPartials(path.join(__dirname, "views/partials"));

connectToMongo(() => {
    console.log("Connected to MongoDB");
});


app.get("/register", (req, res)=> {
    // if (req.session.isLoggedIn == true){
    //     res.redirect("main");
    // }else{
        res.render("register");
    // }
})


app.get("/checkUsername", async (req, res)=> {
    const username = req.query.username;
    const checkResult = await checkUsername(username);

    if (checkResult) {
        res.sendStatus(400);
    } else {
        res.sendStatus(200);
    }
});


app.post("/register", async (req, res)=> {
    const username = req.body.username;
    const hashPassword = await bcrypt.hash(req.body.password, 14)
    
    try {
        const user = await createUser(req.body.firstName, req.body.lastName, req.body.username, hashPassword, req.body.shortDescription, req.body.profilePicture);
        user.save().then(()=>{
            console.log("Success");
            res.redirect("/login")
        }).catch((err)=>{
            console.log(err);
            console.log("username already exist!")
            //Render error page or render with partial
        });
    } catch (err) {
        console.log("Error");
        console.error(err);
    }
});


app.get("/login", (req, res)=> {
    // if (req.session.isLoggedIn == true){
    //     res.redirect("main");
    // }else{
    req.session.isLoggedIn = false;
    req.session.user = null;
    res.render("login");
    // }
})

app.get("/aboutpage", (req, res)=> {
    res.render("aboutpage");
})

/*app.get("/logout", (req, res)=> {
    req.session.isLoggedIn = false;
    req.session.user = null;
    res.redirect("login");
})*/

// login
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // const rememberMe = req.body.remember === 'true';

    // console.log("HERE");
    // console.log('Username:', username);
    // console.log('Password:', password);
    // console.log('Remember Me:', rememberMe);

    try {
        const db = getDb();
        const collection = db.collection('User');
        const user = await collection.findOne({ username });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;

                console.log('Login successful for user:', user.username);
                return res.redirect("/main");
            }
        }

        console.log('Login failed for user:', username);

        res.render('loginError', {
            message: 'Invalid username or password',
            showLoginAgain: true,
            showGuestPage: true
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.send('An error occurred during login');
    }
});



app.get("/view%20profile/:parameter", async (req, res)=> {
    const userID = await getUserID(req.params.parameter);
    const userInfo = await getUserInfo(req.params.parameter);
    const allPost = await getAllReviewsOfUser(userID);
    const allComment = await getAllReplyOfUser(userID);

    const dataToRender = {
        userInfo: userInfo,
        allPost: allPost,
        allComment: allComment
    }

    res.render("viewProfile", dataToRender);
});

app.get("/view%20profile/edit%20profile/:parameter", async (req, res)=> {
    const user = await getUser(req.params.parameter);
    const serializedprofPic = JSON.stringify(user.profilePicture); // Serialize the object to JSON

    res.render("editProfile", {user, serializedprofPic});

});


app.patch("/view%20profile/edit%20profile/edit", async (req, res) => {
    // console.log("HEREE");
    const db = getDb();

    const key = req.body.key;
    const des = req.body.shortDescription;
    const links = req.body.pictureLink;
    const userCollection = db.collection('User');
    try {
        console.log(key);
        await userCollection.updateOne(
            { username: key },
            { $set: { shortDescription: des, profilePicture: links } }
        );
        res.redirect("main")

        // res.render("/login")
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user.');
    }
});

app.get("/confirmEDIT/:key/:id", async (req, res)=> {
    const key = req.params.key;
    const db = getDb();
    const postId = req.params.id
    const collection = db.collection('Reviews');
    const postOwner = await collection.findOne({ post: key, _id: new ObjectId(postId)});
    const estab = postOwner.restaurant.replace(/'/g, "%27").replace(/ /g, "%20");

    
    res.render("confirmEDIT", { key: key, postOwner, postId, estab });
})

// post deletion
app.post('/confirm-deletion/:key/:id', async (req, res) => {
    const key = req.params.key.trim();
    const postId = req.params.id

    // console.log(key);
    const enteredPassword = req.body.password;

    const db = getDb();
    const collection = db.collection('User');
    const review = db.collection('Reviews');

    // console.log("HIIIII");
    // console.log(postId);

    // const postOwner = await review.findOne({ post: key });
    const postOwner = await review.findOne({ post: key, _id: new ObjectId(postId)});

    const correctPasswordDoc = await collection.findOne({ username: postOwner.username });

    if (!correctPasswordDoc) {
        res.send('User not found.');
        return;
    }

    const correctPasswordHash = correctPasswordDoc.password;

    try {
        const isPasswordValid = await bcrypt.compare(enteredPassword, correctPasswordHash);
        if (isPasswordValid) {
            const reviewsCollection = db.collection('Reviews');
            await reviewsCollection.updateOne(
                { post: key, _id: new ObjectId(postId) },
                { $set: { isDeleted: true } }
            );
            res.redirect(`/trial/${postOwner.restaurant}`);
        } else {
            // res.send('Incorrect password. Only the author of the post can delete this.');
            res.render('errorMessage', {
                message: "Incorrect password. Only the author of the post can delete this.",
                restoname: postOwner.restaurant 
            });
        }
    } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).send('Error deleting comment.');
    }
});


// post edit
app.post('/confirm-edit/:key/:edited/:id', async (req, res) => {
    let key = req.params.key;
    const editedText = req.params.edited;
    const postId = req.params.id

    key = decodeURIComponent(key); 
    key = key.trim(); 

    const enteredPassword = req.body.password;

    const db = getDb();
    const collection = db.collection('User');
    const review = db.collection('Reviews');

    try {
        const postOwner = await review.findOne({ post: key, _id: new ObjectId(postId)});
    
        if (!postOwner) {
            res.send('Review post not found.', key, postId);
            return;
        }

        const correctPasswordDoc = await collection.findOne({ username: postOwner.username });
    
        if (!correctPasswordDoc) {
            res.send('User not found.');
            return;
        }

        const correctPasswordHash = correctPasswordDoc.password;

        try {
            const isPasswordValid = await bcrypt.compare(enteredPassword, correctPasswordHash);
            if (isPasswordValid) {
                const reviewsCollection = db.collection('Reviews');
                const commentsCollection = db.collection('Comments');

                try {
                    await reviewsCollection.updateOne(
                        { post: key, _id: new ObjectId(postId) }, 
                        { $set: { isEdited: true, post: editedText } }
                    );
                    await commentsCollection.updateOne(
                        { parentPostContent: key, parentPost:new ObjectId(postId)  },
                        { $set: { parentPostContent: editedText } }
                    );
                    res.redirect(`/trial/${postOwner.restaurant}`);
                } catch (error) {
                    console.error('Error updating document:', error);
                    res.status(500).send('Error updating post.');
                }
            } else {
                res.render('errorMessage', {
                    message: "Incorrect password. Only the author of the post can edit this.",
                    restoname: postOwner.restaurant 
                });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Error finding review post.');
        }
    } catch (error) {
        console.error('Error finding review post:', error);
        res.status(500).send('Error finding review post.');
    }
});



// check if a user is logged in
app.get("/", (req, res) => {
    res.redirect("/main");
});


// Middleware to set the login status for the header template
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.userId = req.session.user ? req.session.user._id : null;
    res.locals.username = req.session.user ? req.session.user.username : null; // Assuming the username property exists in the user object
    res.locals.pic = req.session.user ? req.session.user.profilePicture : null; // Assuming the username property exists in the user object

    next();
});

app.use(express.json());


//view establishment
app.get("/main", async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("Establishments");
        const resto = await collection.find().toArray();
    
        // Function to calculate the average rating for each restaurant
        async function getAverageRatingForRestaurants() {
            try {
                const reviewsCollection = db.collection("Reviews");
                const pipeline = [
                    {
                        $match: { isDeleted: false } 
                    },
                    {
                        $group: {
                            _id: "$restaurant",
                            averageRating: { $avg: "$ratings" } // Calculate the average rating
                        }
                    }
                ];
            
                const result = await reviewsCollection.aggregate(pipeline).toArray();
                const averageRatingsMap = new Map();
            
                result.forEach((restaurant) => {
                    averageRatingsMap.set(restaurant._id, restaurant.averageRating || 0);
                });
        
                return averageRatingsMap;
            } catch (err) {
                console.error("Error retrieving average ratings:", err);
                return new Map();
            }
        }
        const averageRatings = await getAverageRatingForRestaurants();
    
        // console.log("Final data to render:", resto);
    
        resto.forEach((restaurant) => {
            const averageRating = averageRatings.get(restaurant.restaurant);
            restaurant.averageRating = averageRating;
        });
    
        res.render("main", { resto });
        } catch (error) {
        res.status(500).send("Error fetching user");
    }
});


//get resto and post
app.get("/trial/:restaurant", async (req, res) => {
    try {
        const db = getDb();
        const restaurantsCollection = db.collection("Establishments");
        const reviewsCollection = db.collection("Reviews");
        const userCollection = db.collection("User");
        const { restaurant } = req.params;
        
        const restaurantData = await restaurantsCollection.findOne({
            restaurant: restaurant
        });
        
        if (!restaurantData) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        
        const reviewData = await reviewsCollection.find({
            restaurant: restaurant, 
            isDeleted: false
        }).toArray();
        
        const currentUser = req.session.user ? req.session.user.username : null; // Assuming the username property exists in the user object

            
        const filteredResultLIKE = await reviewsCollection.aggregate([
        {
            $match: {
                restaurant: restaurant,
                isDeleted: false,
                liked: req.session.user ? req.session.user._id : null
            }
        },
        {
            $lookup: {
                from: 'User',
                localField: 'username',
                foreignField: 'username',
                as: 'pic'
            }
        }]).toArray();
        
        // Filter the data on the client-side
        const filteredResultDISLIKE = await reviewsCollection.aggregate([
        {
            $match: {
                restaurant: restaurant,
                isDeleted: false,
                disliked: req.session.user ? req.session.user._id : null
            }
        },
        {
            $lookup: {
                from: 'User',
                localField: 'username',
                foreignField: 'username',
                as: 'pic'
            }
        }]).toArray();

        const filteredResultNEITHER = await reviewsCollection.aggregate([
                {
                    $match: {
                        restaurant: restaurant,
                        isDeleted: false,
                        liked: { $nin: [req.session.user ? req.session.user._id : null] },
                        disliked: { $nin: [req.session.user ? req.session.user._id : null] },
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        localField: 'username',
                        foreignField: 'username',
                        as: 'pic'
                    }
                }]).toArray();

        // const filteredResultNEITHER = await reviewsCollection.aggregate([
        //     {
        //         $match: {
        //             restaurant: restaurant,
        //             isDeleted: false,
        //             liked: { $nin: [req.session.user ? req.session.user._id : null] },
        //             disliked: { $nin: [req.session.user ? req.session.user._id : null] },
        //             username: { $in: [req.session.user ? req.session.user.username : null] }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'User',
        //             localField: 'username',
        //             foreignField: 'username',
        //             as: 'pic'
        //         }
        //     }]).toArray();
        
        // const filteredResultNEITHERDISABLE = await reviewsCollection.aggregate([
        // {
        //     $match: {
        //         restaurant: restaurant,
        //         isDeleted: false,
        //         liked: { $nin: [req.session.user ? req.session.user._id : null] },
        //         disliked: { $nin: [req.session.user ? req.session.user._id : null] },
        //         username: { $nin: [req.session.user ? req.session.user.username : null] }
        //     }
        // },
        // {
        //     $lookup: {
        //         from: 'User',
        //         localField: 'username',
        //         foreignField: 'username',
        //         as: 'pic'
        //     }
        // }]).toArray();

        // filteredResultNEITHER.forEach((review) => {
        //     console.log(review); 
        //     review.pic.forEach((picObject) => {
        //         console.log(picObject);
        //     });
        // });

        const dataToRender = {
            restaurantData: restaurantData,
            reviewData: reviewData,
            currentUser: currentUser,
            filteredResultLIKE: filteredResultLIKE,
            filteredResultDISLIKE: filteredResultDISLIKE,
            filteredResultNEITHER: filteredResultNEITHER,
            // filteredResultNEITHERDISABLE:filteredResultNEITHERDISABLE
        };
        // console.log(dataToRender);
        res.render("trial", dataToRender);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during the search." });
    }
});

app.get("/confirmDELETE/:key/:id", async (req, res)=> {
    const key = req.params.key;
    const db = getDb();
    const postId = req.params.id
    const collection = db.collection('Reviews');
    const postOwner = await collection.findOne({ post: key, _id: new ObjectId(postId)});
    const estab = postOwner.restaurant.replace(/'/g, "%27").replace(/ /g, "%20");
    
    res.render("confirmDELETE", { key: key, postOwner, postId, estab });
})

//like and dislike trial
app.post('/like-comment/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const reviewsCollection = db.collection("Reviews");
    const currentUser = req.session.user ? req.session.user._id : null;
    const currentUserPic = req.session.user ? req.session.user.profilePicture : null;

    const idcomment = new ObjectId(commentId);

    const reviewData = await reviewsCollection.findOne({
        _id: new ObjectId(commentId)
    });

    if (!reviewData) {
        console.log("Review not found in the database.");
        return res.status(404).json({ error: "Review not found" });
    }else{
        await reviewsCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
                $pull: { liked: currentUser },
                $addToSet: { liked: currentUser },
                $pull: { disliked: currentUser }
            }
        );
    }
    console.log(reviewData);  
    res.json({ success: true, likeCount: reviewData.liked.length, dislikeCount: reviewData.disliked.length });
});

// Endpoint to handle the dislike action for a comment
app.post('/dislike-comment/:commentId', async(req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const reviewsCollection = db.collection("Reviews");
    const currentUser = req.session.user ? req.session.user._id : null;
    const idcomment = new ObjectId(commentId);

    const reviewData = await reviewsCollection.findOne({
        _id: new ObjectId(commentId)
    });

    if (!reviewData) {
        console.log("Review not found in the database.");
        return res.status(404).json({ error: "Review not found" });
    }else{
        await reviewsCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
                $pull: { disliked: currentUser },
                $addToSet: { disliked: currentUser },
                $pull: { liked: currentUser }
            }
        );
    }
    console.log(reviewData);  
    res.json({ success: true, likeCount: reviewData.liked.length, dislikeCount: reviewData.disliked.length });
});

app.post('/clear-reactions/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const reviewsCollection = db.collection("Reviews");
    const currentUser = req.session.user ? req.session.user._id : null;
    const reviewData = await reviewsCollection.findOne({
        _id: new ObjectId(commentId)
    });
    
    if (!reviewData) {
        console.log("Review not found in the database.");
        return res.status(404).json({ error: "Review not found" });
    } else {
        console.log("Review found in the database.");

        await reviewsCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
            $pull: { liked: currentUser, disliked: currentUser }
            }
        );
    
        // Fetch the updated review data after the update operation
        const updatedReviewData = await reviewsCollection.findOne({
            _id: new ObjectId(commentId)
        });
    
        // console.log(updatedReviewData);
        
        res.json({ 
            success: true, 
            likeCount: updatedReviewData.liked.length, 
            dislikeCount: updatedReviewData.disliked.length 
        });
    }
});

//Search Restaurant
app.get("/searchrestaurant/:key", async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("Establishments");
        const regex = new RegExp(req.params.key, 'i');

        const restoData = await collection.find({
            restaurant: { $regex: regex }
        }).toArray(); 

        res.json(restoData); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during the search." });
    }
});

//Search Post
app.get("/searchpost/:key", async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("Reviews");
        const regex = new RegExp(req.params.key, 'i'); 
        const postData = await collection.find({
            $and: [
                { post: { $regex: regex } },
                { isDeleted: false }
            ]
        }).toArray();  

        res.json(postData); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during the search." });
    }
});

/* ADDED */
const routes = express.Router();


// add posts to DB
routes.route("/trial/:restaurant").post(function (req, res) {
    const reviews = new Reviews({
        user: req.body.user,
        resto: req.body.resto,
        post: req.body.post.trim(),
        ratings: req.body.ratings,
        liked: req.body.liked, 
        disliked: req.body.disliked,
        isDeleted: req.body.isDeleted,
        isEdited: req.body.isEdited,
        pictures: req.body.pictures,
        restaurant: req.body.restaurant,
        username: req.body.username
    });
    reviews.save();
    res.json({ message: "Review saved" });
});

// add comments to DB
routes.route("/trial/:parameter/post").post(function (req, res) {
    const comments = new Comments({
        commenter: req.body.commenter,
        parentPost: req.body.parentPost,
        content: req.body.content,
        author: req.body.author,
        isEdited: req.body.isEdited,
        isDeleted: req.body.isDeleted,
        restaurant: req.body.restaurant,
        disliked: req.body.disliked,
        liked: req.body.liked,
        resto: req.body.resto,
        parentPostContent: req.body.parentPostContent
    });
    comments.save();
    res.json({ message: "Comment saved" });
});

app.use(routes);

//search comments of post
app.get("/trial/:post/post", async (req, res) => {
    try {
        const db = getDb();
        const reviewsCollection = db.collection("Reviews");
        const commentsCollection = db.collection("Comments");

        const { post } = req.params;
        // console.log("Post from params:", post);

        const reviewData = await reviewsCollection.aggregate([
            {
                $match: {
                    post: post, 
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'username',
                    foreignField: 'username',
                    as: 'pic'
                }
            }
        ]).toArray();

        if (!reviewData) {
            console.log("Review not found in the database.");
            return res.status(404).json({ error: "Review not found" });
        }
            
        const currentUser = req.session.user ? req.session.user.username : null; // Assuming the username property exists in the user object
                
        const filteredResultLIKE = await commentsCollection.aggregate([
            {
                $match: {
                    parentPostContent: post, 
                    isDeleted: false,
                    liked: req.session.user ? req.session.user._id : null
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'author',
                    foreignField: 'username',
                    as: 'pic'
                }
            }
        ]).toArray();

        const filteredResultDISLIKE = await commentsCollection.aggregate([
            {
                $match: {
                    parentPostContent: post, 
                    isDeleted: false,
                    disliked: req.session.user ? req.session.user._id : null
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'author',
                    foreignField: 'username',
                    as: 'pic'
                }
            }
        ]).toArray();
    
        const filteredResultNEITHER = await commentsCollection.aggregate([
            {
                $match: {
                    parentPostContent: post,
                    isDeleted: false,
                    liked: { $nin: [req.session.user ? req.session.user._id : null] },
                    disliked: { $nin: [req.session.user ? req.session.user._id : null] }
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'author',
                    foreignField: 'username',
                    as: 'pic'
                }
            }
        ]).toArray();
    
        const dataToRender = {
            reviewData: reviewData,
            currentUser: currentUser,
            filteredResultLIKE: filteredResultLIKE,
            filteredResultDISLIKE: filteredResultDISLIKE,
            filteredResultNEITHER: filteredResultNEITHER,
        };

        const serializedDataToRender = JSON.stringify(dataToRender); 
        res.render("commentTRIAL", { dataToRender, serializedDataToRender }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred during the search." });
    }
});

//comment
app.get("/confirmEDITCOMMENT/:key/:id", async(req, res)=> {
    const key = req.params.key;
    const db = getDb();
    const comment = db.collection('Comments');
    const postId = req.params.id
    const postOwner = await comment.findOne({ content: key, _id: new ObjectId(postId) });

    // console.log(postOwner);
    const estab = postOwner.parentPostContent;

    res.render("confirmEDITcomment", { key: key, postOwner, postId, estab });
})

app.post('/confirm-edit-comment/:key/:edited/:id', async (req, res) => {
    let key = req.params.key;
    const editedText = req.params.edited;
    const postId = req.params.id

    key = decodeURIComponent(key); 
    key = key.trim();
    
    const enteredPassword = req.body.password;
    
    const db = getDb();
    const collection = db.collection('User');
    const comment = db.collection('Comments');
    
    try {
        const commentOwner = await comment.findOne({ content: key, _id: new ObjectId(postId) });
    
        if (!commentOwner) {
            res.send('Comment not found.');
            return;
        }
    
        const correctPasswordDoc = await collection.findOne({ username: commentOwner.author });
    
        if (!correctPasswordDoc) {
            res.send('User not found.');
            return;
        }
    
        const correctPasswordHash = correctPasswordDoc.password;
    
        try {
            const isPasswordValid = await bcrypt.compare(enteredPassword, correctPasswordHash);
            if (isPasswordValid) {
            const commentCollection = db.collection('Comments');
            try {
                await commentCollection.updateOne(
                { content: key, _id: new ObjectId(postId) },
                { $set: { isEdited: true, content: editedText } }
                );
                res.redirect(`/trial/${commentOwner.restaurant}`);
            } catch (error) {
                console.error('Error updating document:', error);
                res.status(500).send('Error updating post.');
            }
            } else {
                res.render('errorMessage', {
                    message: "Incorrect password. Only the author of the comment can edit this.",
                    restoname: commentOwner.restaurant 
                });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Error finding comment.');
        }
    } catch (error) {
        console.error('Error finding comment:', error);
        res.status(500).send('Error finding comment.');
    }
});


app.get("/confirmDELETECOMMENT/:key/:id", async(req, res)=> {
    const key = req.params.key;
    const db = getDb();

    const postId = req.params.id
    // const postOwner = await collection.findOne({ post: key, _id: new ObjectId(postId)});

    const comment = db.collection('Comments');

    const keyTRIM = key.trim();
    const postOwner = await comment.findOne({ content: keyTRIM , _id: new ObjectId(postId)});
    const estab = postOwner.parentPostContent;

    res.render("confirmDELETEcomment", { key: key, postOwner, postId, estab });
})


// post deletion
app.post('/confirm-deletion-comment/:key/:id', async (req, res) => {
    const key = req.params.key.trim();
    const postId = req.params.id
    
    const enteredPassword = req.body.password;
    const db = getDb();
    const collection = db.collection('User');
    const comment = db.collection('Comments');
    const postOwner = await comment.findOne({ content: key, _id: new ObjectId(postId) });

    const correctPasswordDoc = await collection.findOne({ username: postOwner.author });
    
    if (!correctPasswordDoc) {
        res.send('User not found.');
        return;
    }

    const correctPasswordHash = correctPasswordDoc.password;

    try {
        const isPasswordValid = await bcrypt.compare(enteredPassword, correctPasswordHash);
        if (isPasswordValid) {
            const commentCollection = db.collection('Comments');
            try {
                await commentCollection.updateOne(
                    { content: key, _id: new ObjectId(postId) },
                    { $set: { isDeleted: true } }
                );
                res.redirect(`/trial/${postOwner.restaurant}`);
            } catch (error) {
                console.error('Error updating document:', error);
                res.status(500).send('Error deleting comment.');
            }
        } else {
            // res.send('Incorrect password. Only the author of the comment can delete this.');
            res.render('errorMessage', {
                message: "Incorrect password. Only the author of the comment can delete this.",
                restoname: postOwner.restaurant 
            });
        }
    } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).send('Error finding comment.');
    }
});


app.post('/like-comment-2/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const commentCollection = db.collection("Comments");
    const currentUser = req.session.user ? req.session.user._id : null;
    const currentUserPic = req.session.user ? req.session.user.profilePicture : null;

    const idcomment = new ObjectId(commentId);

    const commentData = await commentCollection.findOne({
        _id: new ObjectId(commentId)
    });

    if (!commentData) {
        return res.status(404).json({ error: "Review not found" });
    }else{
        await commentCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
                $pull: { liked: currentUser },
                $addToSet: { liked: currentUser },
                $pull: { disliked: currentUser }
            }
        );
    }
    res.json({ success: true, likeCount: commentData.liked.length, dislikeCount: commentData.disliked.length });
});

// Endpoint to handle the dislike action for a comment
app.post('/dislike-comment-2/:commentId', async(req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const commentCollection = db.collection("Comments");
    const currentUser = req.session.user ? req.session.user._id : null;
    const currentUserPic = req.session.user ? req.session.user.profilePicture : null;

    const idcomment = new ObjectId(commentId);

    const commentData = await commentCollection.findOne({
        _id: new ObjectId(commentId)
    });

    if (!commentData) {
        return res.status(404).json({ error: "Review not found" });
    }else{
        await commentCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
                $pull: { disliked: currentUser },
                $addToSet: { disliked: currentUser },
                $pull: { liked: currentUser }
            }
        );
    }
    res.json({ success: true, likeCount: commentData.liked.length, dislikeCount: commentData.disliked.length });
});

app.post('/clear-reactions-2/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const db = getDb();
    const commentCollection = db.collection("Comments");
    const currentUser = req.session.user ? req.session.user._id : null;
    const currentUserPic = req.session.user ? req.session.user.profilePicture : null;

    const idcomment = new ObjectId(commentId);

    const commentData = await commentCollection.findOne({
        _id: new ObjectId(commentId)
    });

    if (!commentData) {
        return res.status(404).json({ error: "Review not found" });
    }else{
        await commentCollection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
            $pull: { liked: currentUser, disliked: currentUser }
            }
        );
    
        // Fetch the updated review data after the update operation
        const updatedReviewData = await commentCollection.findOne({
            _id: new ObjectId(commentId)
        });
            
        res.json({ 
            success: true, 
            likeCount: updatedReviewData.liked.length, 
            dislikeCount: updatedReviewData.disliked.length 
        });
    }
});


app.listen(3000, ()=> {
    console.log("connected successfully");
    mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
});
