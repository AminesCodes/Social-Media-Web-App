const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance


const getAllAlbums = async (request, response, next) => {
    try {
        const requestQuery = `
        SELECT username, 
                firstname,
                lastname, 
                id,
                album_name,
                TO_CHAR(album_date, 'dd/mm/yyyy') AS posting_date
            FROM users JOIN albums ON username = owner_username`;

        const allAlbums = await db.any(requestQuery);
        response.json({
            status: 'success',
            message: 'Retrieved all albums',
            body: allAlbums
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
  
  
// GET ALL ALBUMS
router.get('/', getAllAlbums);


const validateRoute = (request, response, next) => {
    const albumID = request.params.albumID;

    if (!isNaN(parseInt(albumID)) && albumID * 1 === parseInt(albumID)) {
        request.albumID = parseInt(albumID)
    } else {
        request.ownerUsername = albumID.toLowerCase()
    }
    next()
}


const routerTheEndpoint = (request, response) => {
    if (request.albumID) {
        getAlbumByID(request, response);
    } else if (request.ownerUsername) {
        getAllAlbumsByUsername(request, response);
    }
}


const getAlbumByID = async (request, response) => {
    try {
        const requestQuery = `
            SELECT username, 
                firstname,
                lastname, 
                id,
                album_name,
                TO_CHAR(album_date, 'dd/mm/yyyy') AS posting_date
            FROM users JOIN albums ON username = owner_username
            WHERE id = $1`;
        const album = await db.one(requestQuery, [request.albumID]);
        response.json({
            status: 'success',
            message: `Retrieved the album with the id: ${request.albumID}`,
            body: album
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


const getAllAlbumsByUsername = async (request, response) => {
    try {
        const requestQuery = `
            SELECT username, 
                firstname,
                lastname, 
                id,
                album_name,
                TO_CHAR(album_date, 'dd/mm/yyyy') AS posting_date
            FROM users JOIN albums ON username = owner_username
            WHERE username = $1`;
        const userAlbums = await db.any(requestQuery, [request.ownerUsername]);
        if (userAlbums.length) {
            response.json({
                status: 'success',
                message: `Retrieved all albums related to ${request.ownerUsername}`,
                body: userAlbums
            });
        } else {
            response.send({
                status: 'failed',
                message: 'User does not exist or has no albums'
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


//GET ALL albums OF A SPECIFIC USER OR AN ALBUM BY ID
router.get('/:albumID', validateRoute, routerTheEndpoint);


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
    request.albumName = request.body.albumName;
  
    if (!request.albumName) {
      response.status(400);
      response.json({
        status: 'failed',
        message: 'Missing information'
      });
    } else {
      next();
    }
  }


const addAlbum = async (request, response, next) => {
    try {
        const insertQuery = `INSERT INTO albums (owner_username, album_name) 
        VALUES($1, $2)`
        await db.none(insertQuery, [request.targetUser.username, request.albumName]);
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


const getTheAddedAlbum = async (request, response) => {
    try {
        const requestQuery = `SELECT * FROM albums 
        WHERE owner_username = $1 AND album_name = $2
        ORDER BY id DESC`;
        const addedAlbum = await db.one(requestQuery, [request.targetUser.username, request.albumName])
        response.json({
            status: 'success',
            message: 'Added a new album',
            body: addedAlbum
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


// POST A NEW ALBUM (EXPECTS IN THE BODY:  album's name, loggedUsername, loggedPassword)
router.post('/', checkValidBody, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, addAlbum, getTheAddedAlbum);


const checkExistingAlbum = async (request, response, next) => {
    if (request.albumID) {
        try {
            let targetAlbum = await db.one('SELECT * FROM albums WHERE id = $2 AND owner_username = $1 ', [request.targetUser.username, request.albumID])
            request.targetAlbum = targetAlbum;
            next();
        } catch (err) {
            console.log(err);
            response.status(500);
            response.json({
                status: 'failed',
                message: 'Something went wrong or album does not exist'
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


const updateAlbum = async (request,response, next) => {
    try {
        let updateQuery = `UPDATE albums 
        SET album_name = $3 
        WHERE id = $1 AND owner_username = $2`
        await db.none(updateQuery, [request.targetAlbum.id, request.targetUser.username, request.albumName]);
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


const getUpdatedAlbum = async (request, response) => {
    try {
        const updatedAlbum = await db.one(`SELECT * FROM albums WHERE owner_username = $1 AND id = $2`, [request.targetUser.username, request.targetAlbum.id])
        response.json({
            status: 'success',
            message: `Updated the album with the id: ${request.targetAlbum.id}`,
            body: updatedAlbum
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


// EDITING AN ALBUM, EXPECTING A BODY WITH THE ALBUM's NAME
router.patch('/:albumID', validateRoute, checkValidBody, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, checkExistingAlbum, updateAlbum, getUpdatedAlbum);


const deleteAlbum = async (request, response) => {
    try {
        let deleteQuery = `DELETE FROM albums WHERE id = $1 AND owner_username = $2`
        await db.none(deleteQuery, [request.targetAlbum.id, request.targetUser.username]);
        response.json({
            status: 'success',
            message: `Deleted the album with the id: ${request.targetAlbum.id}`,
            body: request.targetAlbum
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

// DELETING AN ALBUM
router.delete('/:albumID', validateRoute, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, checkExistingAlbum, deleteAlbum);


module.exports = router;