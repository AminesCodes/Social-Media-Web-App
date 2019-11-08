const express = require('express');
const router = express.Router();

//pg-promise request
const {
    db
} = require('../../Database/database'); //connected db instance

//This endpoint retrieves all the likes by the users
router.get('/', async (req, res) => {

    try {
        let post = await db.any(`SELECT * FROM likes`)
        res.json({
            status: "Success",
            message: "Success. Retrieved all the likes",
            body: post
        })
    } catch (error) {
        res.json({
            status: 'failure',
            message: "There was an error, try again"
        })
    }

});

//this middleware performs the query to the database for the endpoint to get likes by post id
//it outputs the returned promise
const getLikesByPostID = async (req, res, next) => {
    let postId = req.params.post_id;
    try {
        let insertQuery = `
        SELECT * FROM likes JOIN users ON users.username = likes.liker_username WHERE post_id = $1
        `
        let postLikes = await db.any(insertQuery, [postId])
        req.postLikes = postLikes;
        next();
    } catch (error) {
        res.json({
            status: 'failure',
            message: "There was an error"
        })
        console.log(error);
    }
}
//this function takes in the promise and checks if it contains data
const validateQuery = (req, res, next) => {
    let body = req.postLikes
    console.log(body);

    body.length === 0 ? res.json({
        status: 'failed',
        message: 'oops something went wrong'
    }) : next()
}
//this function sends the valid query results to server
const displayQuery = (req, res) => {
    res.json({
        status: "Success",
        message: "Success. Retrieved all the likes",
        body: req.postLikes
    })
}
//router endpoint for the query to get likes by post id
router.get('/posts/:post_id', getLikesByPostID, validateQuery, displayQuery)


module.exports = router;