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
        req.postLikes = await db.any(insertQuery, [postId])
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
const validatePostQuery = (req, res, next) => {
    let body = req.postLikes
    // console.log(body);

    body.length === 0 ? res.json({
        status: 'failed',
        message: 'Post doesn\'t exist'
    }) : next()
}
//this function sends the valid query results to server
const displayPostQuery = (req, res) => {
    res.json({
        status: "Success",
        message: "Success. Retrieved all the likes",
        body: req.postLikes
    })
}
//router endpoint for the query to get likes by post id
router.get('/posts/:post_id', getLikesByPostID, validatePostQuery, displayPostQuery)


//this route allows the user to like another users post
const queryToLikePost = async (req, res, next) => {
    try {
        let insertQuery = `
        INSERT INTO likes (liker_username,post_id)
            VALUES($1, $2)`

        req.test = await db.none(insertQuery, [req.body.liker_username, req.body.post_id])
        next()
    } catch (error) {
        res.json({
            status: 'failure',
            message: 'There was an error sending like request'
        })
        console.log(error);
    }
}

const noDupeLike = (req, res, next) => {
    let data = req.test
    console.log(data);

    // data.forEach(ele => {
    //     if (ele.liker_username === req.body.liker_username) {
    //         res.json({
    //             status: 'failure'
    //         })
    //     }
    //     // ele.liker_username === req.body.liker_username ? res.json({
    //     //     status: 'failure'
    //     // }) : next();
    // });
    // next();
}

const likedPost = (req, res) => {
    res.json({
        status: 'success',
        message: 'Success, request sent',
        body: req.body
    })
}

router.post('/posts/:post_id', queryToLikePost, noDupeLike, likedPost)

module.exports = router;