const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance


const getAllPosts = async (request, response, next) => {
    try {
        const requestQuery = `
        SELECT posts.id AS post_id, 
            poster_username,
            body,
            TO_CHAR(posts.posting_date, 'dd/mm/yyyy') AS posting_date,
            COUNT(likes.id) AS total_likes
            FROM posts FULL OUTER JOIN likes ON posts.id = likes.post_id
            GROUP BY (posts.id) 
            ORDER BY posts.id DESC
        `;
        let allPosts = await db.any(requestQuery);
        response.json({
            status: 'success',
            message: 'Retrieved all posts',
            body: allPosts
        });
    } catch(err) {
      console.log(err) 
      response.status(500)
      response.send({
        status: 'failed',
        message: 'Something went wrong!'
      });
    }
}
  
  
// GET ALL POSTS
router.get('/', getAllPosts);


const validateRoute = (request, response, next) => {
    const postID = request.params.postID;

    if (!isNaN(parseInt(postID)) && postID * 1 === parseInt(postID)) {
        request.postID = parseInt(postID)
    } else {
        request.posterUsername = postID.toLowerCase()
    }
    next()
}


const routerTheEndpoint = (request, response) => {
    if (request.postID) {
        getPostById(request, response);
    } else if (request.posterUsername) {
        getAllPostsByUsername(request, response);
    }
}


const getPostById = async (request, response) => {
    try {
        const requestQuery = `
        SELECT posts.id AS post_id, 
                poster_username,
                body,
                TO_CHAR(posts.posting_date, 'dd/mm/yyyy') AS posting_date,
                COUNT(likes.id) AS total_likes
            FROM posts FULL OUTER JOIN likes ON posts.id = likes.post_id
            WHERE posts.id = $1
            GROUP BY (posts.id)
            ORDER BY posts.id DESC
        `;
        const post = await db.one(requestQuery, [request.postID]);
        response.json({
            status: 'success',
            message: `Retrieved the post with the id: ${request.postID}`,
            body: post
        });
    } catch(err) {
        console.log(err) 
        response.status(500)
        response.send({
            status: 'failed',
            message: 'Something went wrong or inexistent id'
        });
    }
}


const getAllPostsByUsername = async (request, response) => {
    try {
        const requestQuery = `
                SELECT posts.id AS post_id, 
                    poster_username,
                    body,
                    TO_CHAR(posts.posting_date, 'dd/mm/yyyy') AS posting_date,
                    COUNT(likes.id) AS total_likes
                FROM posts FULL OUTER JOIN likes ON posts.id = likes.post_id
                WHERE poster_username = $1
                GROUP BY (posts.id) 
                ORDER BY posts.id DESC
            `;
        const userPosts = await db.any(requestQuery, [request.posterUsername]);
        if (userPosts.length) {
            response.json({
                status: 'success',
                message: `Retrieved all posts related to ${request.posterUsername}`,
                body: userPosts
            });
        } else {
            response.send({
                status: 'failed',
                message: 'User doe not exist or has no posts'
            });
        }
    } catch(err) {
        console.log(err) 
        response.status(500)
        response.send({
            status: 'failed',
            message: 'Something went wrong!'
        });
    }
}


//GET ALL POSTS OF A SPECIFIC USER OR A POST BY ID
router.get('/:postID', validateRoute, routerTheEndpoint);


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
    } catch(err) {
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


// AUTHENTICATION
const authenticateUser = (request, response, next) => {
    if (request.userExists) {
        if (request.targetUser.username === request.loggedUsername 
            && request.targetUser.user_password === request.loggedPassword) {
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


const checkValidBody = (request, response, next) => {
    request.postBody = (request.body.body);
  
    if (!request.postBody) {
      response.status(400);
      response.json({
        status: 'failed',
        message: 'Missing information'
      });
    } else {
      next();
    }
  }


const addPost = async (request, response, next) => {
    try {
        let insertQuery = `INSERT INTO posts (poster_username, body) 
        VALUES($1, $2)`
        await db.none(insertQuery, [request.loggedUsername, request.postBody]);
        next();
    } catch (err) {
        console.log(err);
        response.status(500)
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        })
    }
}


const getTheAddedPost = async (request, response) => {
    try {
        const requestQuery = `
        SELECT posts.id AS post_id, 
                poster_username,
                body,
                TO_CHAR(posts.posting_date, 'dd/mm/yyyy') AS posting_date,
                COUNT(likes.id) AS total_likes
            FROM posts FULL OUTER JOIN likes ON posts.id = likes.post_id
            WHERE poster_username = $1 AND body = $2
            GROUP BY (posts.id) 
            LIMIT 1`;
        let addedPosts = await db.one(requestQuery, [request.targetUser.username, request.postBody])
        response.json({
            status: 'success',
            message: 'Added a new post',
            body: addedPosts
        })
    } catch (err) {
        console.log(err);
        response.status(500)
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        })
    }
}


// POST A NEW POST (EXPECTS IN THE BODY:  post's body, loggedUsername, loggedPassword)
router.post('/', checkValidBody, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addPost, getTheAddedPost);


const checkExistingPost = async (request, response, next) => {
    if (request.postID) {
        try {
            let targetPost = await db.one('SELECT * FROM posts WHERE id = $2 AND poster_username = $1 ', [request.targetUser.username, request.postID])
            request.targetPost = targetPost;
            next();
        } catch (err) {
            console.log(err);
            response.status(500);
            response.json({
                status: 'failed',
                message: 'Something went wrong or post does not exist'
            });
        }
    } else {
        response.status(400);
            response.json({
                status: 'failed',
                message: 'Something went wrong!'
            });
    }
}


const updatePost = async (request,response, next) => {
    try {
        let updateQuery = `UPDATE posts 
        SET body = $3 
        WHERE id = $1 AND poster_username = $2`
        await db.none(updateQuery, [request.targetPost.id, request.targetUser.username, request.postBody]);
        next();
    } catch (err) {
        console.log(err);
        response.status(500);
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        });
    }
}


const getUpdatedPost = async (request, response) => {
    try {
        let updatedPost = await db.one(`SELECT * FROM posts WHERE poster_username = $1 AND id = $2`, [request.targetUser.username, request.targetPost.id])
        response.json({
            status: 'success',
            message: `Updated the post with the id: ${request.targetPost.id}`,
            body: updatedPost
        })
    } catch (err) {
        console.log(err);
        response.status(500);
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        });
    }
}


// // EDITING A POST, EXPECTING A BODY WITH THE POSTS BODY
router.patch('/:postID', validateRoute, checkValidBody, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, checkExistingPost, updatePost, getUpdatedPost);


const deletePost = async (request, response) => {
    try {
        let deleteQuery = `DELETE FROM posts WHERE id = $1 AND poster_username = $2`
        await db.none(deleteQuery, [request.targetPost.id, request.targetUser.username]);
        response.json({
            status: 'success',
            message: `Deleted the post with the id: ${request.targetPost.id}`,
            body: request.targetPost
        })
    } catch (err) {
        console.log(err);
        response.status(500)
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        })
    }
}

// // DELETING A POST
// USE OF PUT TO ACCEPT A BODY IN THE REQUEST
router.put('/:postID/delete', validateRoute, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, checkExistingPost, deletePost);



module.exports = router;