const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance


// GET ALL USERS FROM THE DATABASE
const getAllUsers = async (request, response, next) => {
    try {
        const requestQuery = `
        SELECT username, firstname, 
                lastname, 
                TO_CHAR(dob, 'dd/mm/yyyy') AS dob, 
                TO_CHAR(signing_date, 'dd/mm/yyyy') AS signing_date
            FROM users`;
        const allUsers = await db.any(requestQuery);
        request.allUsers = allUsers; // Implement all users into the request
        next();
    } catch(err) {
        console.log(err) 
        response.status(500) // INTERNAL SERVER ERROR
        response.json({
            status: 'failed',
            message: 'Something went wrong!'
        });
    }
}


// RETURNING ALL USERS
const returnAllUsers = (request, response) => {
    response.json({
      status: 'success',
      message: 'Retrieved all users',
      body: request.allUsers
    });
}


// GET ALL USERS ROUTE
router.get('/', getAllUsers, returnAllUsers);
  
  
// Function to formate names
const formateName = (str) => {
    return (str[0].toUpperCase()+(str.slice(1, str.length)).toLowerCase());
}


// FUNCTION TO CHECK IF ALL INFORMATION HAVE BEEN SENT INTO THE BODY  
const checkValidBody = (request, response, next) => {
    const username = request.body.username;
    const firstName = formateName(request.body.firstname);
    const lastName = formateName(request.body.lastname);
    const dob = request.body.dob;
    const password = request.body.password;
  
    if (!username || !firstName || !lastName || !dob || !password) {
        response.status(400); // BAD REQUEST
        response.json({
            status: 'failed',
            message: 'Missing information'
        });
    } else {
        // Implements the body data to the request:
        request.username = username.toLowerCase();
        request.firstName = firstName;
        request.lastName = lastName;
        request.dob = dob;
        request.password = password;

        request.UserToLookFor = username.toLowerCase();

        next();
    }
}


// CHECK IF A USER IS IN DATABASE
const checkIfUsernameExists = async (request, response, next) => {
    try {
        const requestQuery = `
        SELECT username, firstname, 
                lastname, 
                TO_CHAR(dob, 'dd/mm/yyyy') AS dob, 
                TO_CHAR(signing_date, 'dd/mm/yyyy') AS signing_date , 
                user_password
            FROM users
            WHERE username = $1`
        const user = await db.one(requestQuery, [request.UserToLookFor]);
        request.userExists = true; // Validates that the user exists
        request.targetUser = user; // Implement the target user to the request
        request.secureTargetUser = {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            dob: user.dob,
            signing_date: user.signing_date
        }
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


// ADD USER TO DB
const addUser = async (request, response, next) => {
    if (request.userExists) {
        response.status(403); // FORBIDDEN REQUEST
        response.json({
            status: 'failed',
            message: 'User exists already'
        });
    } else {
        try {
            const insertQuery = `INSERT INTO users 
                    (username, firstname, lastname, dob, user_password) 
                VALUES
                    ($1, $2, $3, $4, $5)`
            await db.none(insertQuery, [request.username, request.firstName, request.lastName, request.dob, request.password]);
            next();
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
                status: 'failed',
                message: 'Something went wrong, Please double check your inputs'
            })
        }
    }
}


// RETURN THE CONCERNED USER
const getConcernedUser = (request, response) => {
    if (request.userExists) {
        response.json({
            status: 'success',
            message: 'Logged user',
            body: request.secureTargetUser
        });
    } else {
        response.status(400);
        response.json({
            status: 'failed',
            message: 'User does not exist !!'
        }); 
    }
}


// CREATE A NEW USER ROUTE
router.post('/', checkValidBody, checkIfUsernameExists, addUser, checkIfUsernameExists, getConcernedUser);
  

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
        request.UserToLookFor = username.toLowerCase();

        next();
    }
}


// AUTHENTICATION
const authenticateUser = (request, response, next) => {
    if (request.userExists) {
        // console.log(request.targetUser, request.loggedUsername, request.loggedPassword)
        if (request.targetUser.username === request.loggedUsername 
            && request.targetUser.user_password === request.loggedPassword) {
                request.secureTargetUser = {
                    username: request.targetUser.username,
                    firstname: request.targetUser.firstname,
                    lastname: request.targetUser.lastname,
                    dob: request.targetUser.dob,
                    signing_date: request.targetUser.signing_date
                };
                next()
        } else {
            response.status(401) // Unauthorized
            response.json({
                status: 'failed',
                message: 'Bad combination username/password'
            })
        }
    } else {
        response.status(401) // Unauthorized
        response.json({
            status: 'failed',
            message: 'User Does not exist'
        })
    }
}

// LOGGING ROUTE
// USE OF PUT TO ACCEPT A BODY IN THE REQUEST
router.put('/logging', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getConcernedUser);


// 
const checkValidRoute = (request, response, next) => {
    const username = request.params.username;
    if (!username) {
      response.status(404);
      response.json({
        status: 'failed',
        message: 'Invalid route'
      });
    } else {
      request.username = username.toLowerCase();
      next();
    }
}
  
// 
const checkPatchBody = (request, response, next) => {
    console.log("line 232", request.body)
    if (!request.body.username 
        && !request.body.firstname 
        && !request.body.lastname 
        && !request.body.dob 
        && !request.body.password) {
            response.status(400); // BAD REQUEST
            response.json({
                status: 'failed',
                message: 'Missing information, nothing to update'
            });
    } else {
        if (request.body.username) {
            request.body.username = (request.body.username).toLowerCase()
        }
        if (request.body.firstname) {
            request.body.firstname = formateName(request.body.firstname);
        }
        if (request.body.lastname) {
            request.body.lastname = formateName(request.body.lastname);
        }
        next()
    }
}


// UPDATE USER
const updateUser = async (request, response, next) => {
    console.log('\nUPDATE USER MIDDLEWARE (line 260)', request.secureTargetUser);
    console.log(request.body)
    if (request.body.password) {
        try {
            let updateQuery = `UPDATE users 
            SET user_password = $2 
            WHERE username = $1`
            await db.none(updateQuery, [request.secureTargetUser.username, request.body.password]);
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
            return;
        }
    }

    if (request.body.firstname) {
        try {
            let updateQuery = `UPDATE users 
            SET firstname = $2 
            WHERE username = $1`
            await db.none(updateQuery, [request.secureTargetUser.username, request.body.firstname]);
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
            return;
        }
    }

    if (request.body.lastname) {
        try {
            let updateQuery = `UPDATE users 
            SET lastname = $2 
            WHERE username = $1`
            await db.none(updateQuery, [request.secureTargetUser.username, request.body.lastname]);
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
            return;
        }
    }

    if (request.body.dob) {
        try {
            let updateQuery = `UPDATE users 
            SET dob = $2 
            WHERE username = $1`
            await db.none(updateQuery, [request.secureTargetUser.username, request.body.dob]);
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
            return;
        }
    }

    if (request.body.username) {
        try {
            let updateQuery = `UPDATE users 
            SET username = $2 
            WHERE username = $1`
            await db.none(updateQuery, [request.secureTargetUser.username, request.body.username]);
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
            return;
        }
    }
    next();
}


// RETRIEVING the updated user
const getUpdatedUser = async (request, response) => {
    const requestQuery = `
        SELECT username, firstname, lastname, TO_CHAR(dob, 'dd/mm/yyyy') AS dob, TO_CHAR(signing_date, 'dd/mm/yyyy') AS signing_date
        FROM users
        WHERE username = $1`
    if (request.body.username) {
        try {
            const user = await db.one(requestQuery, [request.body.username]);
            response.json({
                status: 'success',
                message: 'Updated user',
                body: user
            });
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
        }
    } else {
        try {
            const user = await db.one(requestQuery, [request.secureTargetUser.username]);
            response.json({
                status: 'success',
                message: 'Updated user',
                body: user
            });
        } catch (err) {
            console.log(err);
            response.status(500)
            response.json({
              status: 'failed',
              message: 'Something went wrong!'
            });
        }
    }
}
  

// EXPECTING A BODY WITH {firstname, lastname, age}
router.patch('/:username', checkValidRoute, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, checkPatchBody, updateUser, getUpdatedUser);
  
  
// 
const deleteUser = async (request, response) => {
    try {
      let deleteQuery = `DELETE FROM users WHERE username = $1`
      await db.none(deleteQuery, [request.secureTargetUser.username]);
      response.json({
        status: 'success',
        message: 'Deleted user',
        body: request.secureTargetUser
      })
    } catch (err) {
      console.log(err);
      response.status(500)
      response.json({
        status: 'failed',
        message: 'Something went wrong'
      })
    }
  }


// DELETING A USER
// USE OF PUT TO ACCEPT A BODY IN THE REQUEST
router.put('/:username/delete', checkValidRoute, checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, deleteUser);
  

//
const getTargetUser = (request, response, next) => {
    request.UserToLookFor = request.username;
    next();
}


// GET USER BY USERNAME
router.get('/:username', checkValidRoute, getTargetUser, checkIfUsernameExists, getConcernedUser);
  

module.exports = router;