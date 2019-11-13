const express = require('express');
const router = express.Router();

//pg-promise request
const {
    db
} = require('../../Database/database'); //connected db instance

//This endpoint retrieves everything from the likes tables
//shows all posts/pictures that were liked by any user
router.get('/', async (req, res) => {

    try {
        let post = await db.any(`SELECT * FROM likes`);
        res.json({
            status: 'Success',
            message: 'retrieved all the likes',
            body: post
        });
    } catch (error) {
        res.status(500)
        res.json({
            status: 'failed',
            message: 'There was an error, try again'
        });
    }

});

//retrieve the number of times a post is liked by all users
router.get('/posts/times_liked', async (req, res) => {
    try {
        let insertQuery = `
        SELECT poster_username,body,posts.id AS post_id, COUNT(posts.id) AS times_liked
        from posts
        JOIN likes ON posts.id = likes.post_id
        GROUP BY posts.id
        ORDER BY times_liked DESC
        `;
        let liked = await db.any(insertQuery)
        res.json({
            status: 'success',
            message: 'request sent',
            body: liked,
        });
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error the retrieving data'
        });
        console.log(error);
    }
});

//finding the most liked post
router.get('/posts/popular', async (req, res) => {
    try {
        let insertQuery = `
        SELECT poster_username,body, id from posts
        WHERE posts.id = (
            SELECT posts.id FROM posts JOIN likes ON posts.id = likes.post_id 
            GROUP BY posts.id ORDER BY COUNT(posts.body) DESC, posts.id DESC LIMIT 1
        )
        `;
        let num1 = await db.any(insertQuery)
        res.json({
            status: 'success',
            message: 'request sent',
            body: num1
        });
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error sending request'
        })
        console.log(error);
    }
});

//this middleware performs the query to the database for the endpoint to get likes by post id
//it outputs the returned promise
const getLikesByPostID = async (req, res, next) => {
    let postId = req.params.post_id;
    try {
        let insertQuery = `
        SELECT poster_username,liker_username,body FROM likes JOIN posts ON post_id = posts.id WHERE post_id =$1
        `;
        req.postLikes = await db.any(insertQuery, [postId]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error'
        })
        console.log(error);
    }
}
//this function takes in the promise and checks if it contains data
const validatePostQuery = (req, res, next) => {
    let body = req.postLikes
    // console.log(body);
    if (body.length === 0) {
        res.status(404);
        res.json({
            status: 'failed',
            message: 'Post doesn\'t have any likes'
        })
    } else {
        next();
    }
}
//this function sends the valid query results to server
const displayPostQuery = (req, res) => {
    res.json({
        status: 'Success',
        message: 'retrieved all post likes',
        body: req.postLikes
    });
}
//router endpoint for the query to get likes by post id
router.get('/posts/:post_id', getLikesByPostID, validatePostQuery, displayPostQuery)

//get the posts that a user liked
//use liker username
router.get('/posts/interest/:liker_username', async (req, res) => {
    try {
        let specPost = await db.any('SELECT post_id,liker_username,body,poster_username FROM likes JOIN posts ON post_id = posts.id WHERE liker_username = $1', [req.params.liker_username])
        res.json({
            status: 'success',
            message: 'retrieved the likes',
            body: specPost,
        })

    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: `You took a wrong turn`
        })
    }
});

//this route allows the user to like another users post
const queryToLikePost = async (req, res, next) => {
    try {
        let insertQuery = `
        INSERT INTO likes (liker_username,post_id)
            VALUES($1, $2)`

        await db.none(insertQuery, [req.loggedUsername, req.params.post_id])
        next()
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error sending like request'
        })
        console.log(error);
    }
}
const noDupeLike = (req, res, next) => {
    let body = req.postLikes;
    let postAlreadyLiked = false;
    body.forEach(el => {
        if (el.liker_username === req.loggedUsername) {
            postAlreadyLiked = true;
            res.json({
                status: 'failed',
                message: 'post already liked'
            })
        }
    });
    if (!postAlreadyLiked) {
        next();
    }
}

// CHECK AUTHENTICATION REQUEST BODY
const checkValidAuthenticationBody = (request, response, next) => {
    const username = request.body.loggedUsername;
    const password = request.body.loggedPassword;

    if (!username || !password) {
        response.status(400); // BAD REQUEST
        response.json({
            status: 'failed',
            message: 'Missing authentication information'
        });
    } else {
        // Implements the body data to the request:
        request.loggedUsername = username.toLowerCase();
        request.loggedPassword = password;
        next();
    }
}
// CHECK IF A USER IS IN DATABASE
const checkIfUsernameExists = async (request, response, next) => {
    try {
        const user = await db.one('SELECT * FROM users WHERE username = $1', [request.loggedUsername]);
        request.userExists = true; // Validates that the user exists
        request.targetUser = user; // Implement the target user to the request
        next();
    } catch (err) {
        if (err.received === 0) { // SQL QUERY was expecting one row but didn't receive any one
            request.userExists = false;
            next();
        } else {
            response.status(500) // Internal Server Error
            console.log(err)
            response.json({
                status: 'failed',
                message: 'Something went wrong!'
            });
        }
    }
}
//middleware to authenticate 
const authenticateUser = (request, response, next) => {
    if (request.userExists) {
        if (request.targetUser.username === request.loggedUsername &&
            request.targetUser.user_password === request.loggedPassword) {
            next()
        } else {
            response.status(401) // Unauthorized
            response.json({
                status: 'failed',
                message: 'Not authorized to accomplish the request'
            })
        }
    } else {
        response.status(404)
        response.json({
            status: 'failed',
            message: 'User Does not exist'
        })
    }
}

//middleware to send the information to the server is user successfully liked a pot
const likeRequestSent = (req, res) => {
    res.status(200);
    res.json({
        status: 'success',
        message: 'request sent'
    });
}
//router endpoint to create a like on a post
router.post('/posts/:post_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getLikesByPostID, validatePostQuery, noDupeLike, queryToLikePost, likeRequestSent);

//this route will allow users to delete their likes on a post
//by using the post_id
const deletePostLikeQuery = async (req, res, next) => {
    postId = req.params.post_id;
    let deleteQuery = `DELETE FROM likes WHERE post_id = $1 AND liker_username = $2`
    try {
        await db.none(deleteQuery, [postId, req.loggedUsername])
        next()
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'you took a wrong turn'
        });
    }

}

//middleware that will send to the server information if the delete request was successful
const deletedLike = (req, res) => {
    res.status(200);
    res.json({
        status: 'success',
        message: 'request sent',
    });
}
//router endpoint to delete a post by a user
router.put('/posts/:post_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getLikesByPostID, validatePostQuery, deletePostLikeQuery, deletedLike);

//retrieves the number of times a picture is liked by all users
router.get('/pictures/times_liked', async (req, res) => {
    try {
        let insertQuery = `
        SELECT owner_username,picture_link,picture_id, COUNT(picture_id) AS times_liked
        from pictures
        JOIN likes ON pictures.id = likes.picture_id JOIN albums ON album_id = albums.id WHERE picture_id = pictures.id
        GROUP BY picture_id, owner_username,picture_link
        ORDER BY times_liked DESC
        `;
        let liked = await db.any(insertQuery)
        res.json({
            status: 'success',
            message: 'request sent',
            body: liked,
        })
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error the retrieving data'
        })
        console.log(error);
    }
});

//this router queries to the database to find the most liked picture
router.get('/pictures/popular', async (req, res) => {
    try {
        let insertQuery = `
        SELECT owner_username,album_id,picture_id, owner_username, picture_link FROM likes JOIN pictures ON picture_id = pictures.id JOIN albums ON album_id = albums.id WHERE picture_id = (
            SELECT pictures.id FROM pictures JOIN likes ON pictures.id = picture_id GROUP BY pictures.id ORDER BY COUNT(pictures.id) DESC LIMIT 1
        ) GROUP BY liker_username, album_id, picture_id, owner_username, picture_link ORDER BY COUNT(picture_id) LIMIT 1
        `;
        let num1 = await db.any(insertQuery)
        res.json({
            status: 'success',
            message: 'request successfully sent',
            body: num1
        });
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error sending request'
        })
        console.log(error);
    }
});

//this middleware performs the query to the database for the endpoint to get picture by picture id
//it outputs the returned promise
const getLikesByPictureID = async (req, res, next) => {
    try {
        let insertQuery = `
                SELECT liker_username, owner_username, picture_link FROM likes JOIN pictures ON picture_id = pictures.id JOIN albums ON album_id = albums.id WHERE picture_id = $1 
        `;
        req.picLikes = await db.any(insertQuery, [req.params.picture_id]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error'
        })
        console.log(error);
    }
}
// middleware that takes in the promise and checks if it contains data
const validatePicQuery = (req, res, next) => {
    if (req.picLikes.length === 0) {
        res.json({
            status: 'success',
            message: 'Picture doesn\'t have likes'
        })
    } else {
        next();
    }

}

//this middleware sends the valid query results to server after the checks
const displayPicQuery = (req, res) => {
    res.status(200);
    res.json({
        status: 'Success',
        message: 'Success. Retrieved all the likes for picture',
        body: req.picLikes
    });
}
//router endpoint for the query to get likes by picture id
router.get('/pictures/:picture_id', getLikesByPictureID, validatePicQuery, displayPicQuery);

//router that gets the pictures that a user liked
router.get('/pictures/interest/:liker_username', async (req, res) => {
    try {
        let specPost = await db.any('SELECT picture_id,liker_username,owner_username,picture_link FROM likes JOIN pictures ON picture_id = pictures.id JOIN albums ON album_id = albums.id WHERE liker_username = $1', [req.params.liker_username]);
        res.json({
            status: 'success',
            message: 'retrieved all likes',
            body: specPost,
        });

    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: `You took a wrong turn`
        });
    }
});

//this route will allow users to like another users picture
//by using the picture_id
const queryToLikePicture = async (req, res, next) => {

    try {
        let insertQuery = `
        INSERT INTO likes (liker_username,picture_id)
            VALUES($1, $2)`;

        await db.none(insertQuery, [req.loggedUsername, req.params.picture_id]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'There was an error sending like request'
        })
        console.log(error);
    }
}

// no duplicate pictures like
const noDupePicLike = (req, res, next) => {
    let body = req.picLikes;
    let picAlreadyLiked = false;
    body.forEach(el => {
        if (el.liker_username === req.loggedUsername) {
            picAlreadyLiked = true;
            res.json({
                status: 'failed',
                message: 'picture already liked'
            })
        }
    });
    if (!picAlreadyLiked) {
        next();
    }
}

router.post('/pictures/:picture_id', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getLikesByPictureID, validatePicQuery, noDupePicLike, queryToLikePicture, likeRequestSent);

//this route will allow users to delete their likes on pictures
//by using the picture_id
const deletePicLikeQuery = async (req, res, next) => {
    picId = req.params.picture_id;
    let deleteQuery = `DELETE FROM likes WHERE picture_id = $1 AND liker_username = $2`
    try {
        await db.none(deleteQuery, [picId, req.loggedUsername]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'you took a wrong turn'
        });
    }
}

router.put('/pictures/:picture_id/delete', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getLikesByPictureID, validatePicQuery, deletePicLikeQuery, deletedLike);

module.exports = router;