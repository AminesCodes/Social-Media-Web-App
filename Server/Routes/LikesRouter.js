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
            status: 'failure',
            message: 'There was an error, try again'
        });
    }

});

//retrieve the number of times a post is liked by all users
router.get('/posts/times_liked', async (req, res) => {
    try {
        let insertQuery = `
        SELECT posts.id AS post_id, COUNT(posts.id) AS times_liked
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
            status: 'failure',
            message: 'There was an error the retrieving data'
        });
        console.log(error);
    }
});

//finding the most liked post
router.get('/posts/popular', async (req, res) => {
    try {
        let insertQuery = `
        SELECT * from users
        JOIN posts ON users.username = posts.poster_username
        WHERE posts.id = (
            SELECT posts.id FROM posts JOIN likes ON posts.id = likes.post_id 
            GROUP BY posts.id ORDER BY COUNT(posts.body) DESC LIMIT 1
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
            status: 'failure',
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
        SELECT * FROM likes JOIN users ON users.username = likes.liker_username WHERE post_id = $1
        `;
        req.postLikes = await db.any(insertQuery, [postId]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
            message: 'There was an error'
        })
        console.log(error);
    }
}
//this function takes in the promise and checks if it contains data
const validatePostQuery = (req, res, next) => {
    let body = req.postLikes
    // console.log(body);
    res.status(404);
    body.length === 0 ? res.json({
        status: 'failed',
        message: 'Post doesn\'t exist'
    }) : next();
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
router.get('/posts/interest/:liker_username', async (req, res) => {
    let likerUsername = req.params.liker_username;
    try {
        let specPost = await db.any('SELECT * FROM likes WHERE liker_username = $1', [likerUsername])
        res.json({
            status: 'success',
            message: 'retrieved the likes',
            body: specPost,
        })

    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
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

        req.postLiker = await db.none(insertQuery, [req.body.liker_username, req.body.post_id])
        next()
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
            message: 'There was an error sending like request'
        })
        console.log(error);
    }
}

//middleware to send the information to the server is user successfully liked a pot
const likeRequestSent = (req, res) => {
    console.log(req.body);
    res.status(200);
    res.json({
        status: 'success',
        message: 'request sent',
        body: req.body
    });
}
//router endpoint to create a like on a post
router.post('/posts/:post_id', queryToLikePost, likeRequestSent);

//this route will allow users to delete their likes on a post
//by using the post_id
const deletePostLikeQuery = async (req, res, next) => {
    postId = req.params.post_id;
    likerUsername = req.params.liker_username;
    let deleteQuery = `DELETE FROM likes WHERE post_id = $1 AND liker_username = $2`
    try {
        req.delete = await db.none(deleteQuery, [postId, likerUsername])
        next()
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
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
        body: req.delete
    });
}
//router endpoint to delete a post by a user
router.delete('/posts/:post_id/:liker_username', getLikesByPostID, validatePostQuery, deletePostLikeQuery, deletedLike);

//retrieves the number of times a picture is liked by all users
router.get('/pictures/times_liked', async (req, res) => {
    try {
        let insertQuery = `
        SELECT pictures.id AS picture_id, COUNT(pictures.id) AS times_liked
        from pictures
        JOIN likes ON pictures.id = likes.picture_id
        GROUP BY pictures.id
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
            status: 'failure',
            message: 'There was an error the retrieving data'
        })
        console.log(error);
    }
});

//this router queries to the database to find the most liked picture
router.get('/pictures/popular', async (req, res) => {
    try {
        let insertQuery = `
        SELECT * from pictures 
        WHERE pictures.id = (
            SELECT pictures.id FROM pictures JOIN likes ON pictures.id = likes.picture_id 
            GROUP BY pictures.id ORDER BY COUNT(pictures.id) DESC LIMIT 1
        )
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
            status: 'failure',
            message: 'There was an error sending request'
        })
        console.log(error);
    }
});

//this middleware performs the query to the database for the endpoint to get picture by picture id
//it outputs the returned promise
const getLikesByPictureID = async (req, res, next) => {
    let picId = req.params.picture_id;
    try {
        let insertQuery = `
        SELECT * FROM likes JOIN users ON users.username = likes.liker_username WHERE picture_id = $1
        `;
        req.picLikes = await db.any(insertQuery, [picId]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
            message: 'There was an error'
        })
        console.log(error);
    }
}
// middleware that takes in the promise and checks if it contains data
const validatePicQuery = (req, res, next) => {
    res.status(404);
    req.picLikes.length === 0 ? res.json({
        status: 'failure',
        message: 'Picture doesn\'t exist'
    }) : next();
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
    let likerUsername = req.params.liker_username;
    try {
        let specPost = await db.any('SELECT * FROM likes WHERE liker_username = $1', [likerUsername]);
        res.json({
            status: 'success',
            message: 'retrieved all likes',
            body: specPost,
        });

    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
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

        req.picLiker = await db.none(insertQuery, [req.body.liker_username, req.body.picture_id]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
            message: 'There was an error sending like request'
        })
        console.log(error);
    }
}

router.post('/pictures/:picture_id', queryToLikePicture, likeRequestSent);

//this route will allow users to delete their likes on pictures
//by using the picture_id
const deletePicLikeQuery = async (req, res, next) => {
    picId = req.params.picture_id;
    likerUsername = req.params.liker_username;
    let deleteQuery = `DELETE FROM likes WHERE picture_id = $1 AND liker_username = $2`
    try {
        req.delete = await db.none(deleteQuery, [picId, likerUsername]);
        next();
    } catch (error) {
        res.status(500);
        res.json({
            status: 'failure',
            message: 'you took a wrong turn'
        });
    }
}

router.delete('/pictures/:picture_id/:liker_username', getLikesByPictureID, validatePicQuery, deletePicLikeQuery, deletedLike);

module.exports = router;