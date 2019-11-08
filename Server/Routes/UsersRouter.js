const express = require('express');
const router = express.Router();

//pg-promise request
const {db} = require('../../Database/database'); //connected db instance


// GET ALL USERS FROM THE DATABASE
const getAllUsers = async (request, response, next) => {
    try {
        let allUsers = await db.any(`SELECT username, firstname, lastname, TO_CHAR(dob, 'dd/mm/yyyy') AS dob, TO_CHAR(signing_date, 'dd/mm/yyyy') AS signing_date FROM users`);
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
        request.username = username;
        request.firstName = firstName;
        request.lastName = lastName;
        request.dob = dob;
        request.password = password;

        next();
    }
}


// CHECK IF A USER IS IN DATABASE
const checkIfUsernameExists = async (request, response, next) => {
    try {
        const requestQuery = `
        SELECT username, firstname, lastname, TO_CHAR(dob, 'dd/mm/yyyy') AS dob, TO_CHAR(signing_date, 'dd/mm/yyyy') AS signing_date , user_password
        FROM users
        WHERE username = $1`
        const user = await db.one(requestQuery, [request.username]);
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
        response.status(500);
        response.json({
            status: 'failed',
            message: 'Something went wrong!!'
        }); 
    }
}


// CREATE A NEW USER ROUTE
router.post('/', checkValidBody, checkIfUsernameExists, addUser, checkIfUsernameExists, getConcernedUser);
  

// CHECK AUTHENTICATION REQUEST BODY
const checkValidAuthenticationBody = (request, response, next) => {
    const username = request.body.username;
    const password = request.body.password;
  
    if (!username || !password) {
        response.status(400); // BAD REQUEST
        response.json({
            status: 'failed',
            message: 'Missing information'
        });
    } else {
        // Implements the body data to the request:
        request.username = username;
        request.password = password;

        next();
    }
}


// AUTHENTICATION
const authenticateUser = (request, response, next) => {

    if (request.userExists) {
        if (request.targetUser.username === request.username 
            && request.targetUser.user_password === request.password) {
                request.loggedUser = request.targetUser;
                next()
        } else {
            //response.status(401) // Unauthorized
            response.json({
                status: 'failed',
                message: 'Bad combination username/password'
            })
        }
    } else {
        //response.status(401) // Unauthorized
        response.json({
            status: 'failed',
            message: 'User Does not exist'
        })
    }
}

// LOGGING ROUTE
router.get('/logging', checkValidAuthenticationBody, checkIfUsernameExists, authenticateUser, getConcernedUser);

//   const userToLog = (request, response) => {
//     if (request.userExists) {
//       response.json({
//         status: 'success',
//         message: request.userToLog
//       })
//     } else {
//       response.json({
//         status: 'failed',
//         message: 'User does not exist'
//       })
//     }
//   }
  
//   // NOT A REAL PATCH, JUST TO HAVE A ABILITY TO ACCEPT A BODY
//   // LOGIN A USER
//   router.patch('/login', checkValidBody, getAllUsers, checkIfUsernameExists, userToLog);
  
  
//   const checkValidRoute = (request, response, next) => {
//     const id = parseInt(request.params.userID);
//     if (isNaN(id)) {
//       response.status(500);
//       response.json({
//         status: 'failed',
//         message: 'Invalid route'
//       });
//     } else {
//       request.id = id;
//       next();
//     }
//   }
  
  
//   const getUserByID = async (request, response, next) => {
//     try {
//       const targetUser = await db.one('SELECT * FROM users WHERE id = $1', [request.id]);
//       if (targetUser.id) {
//         request.targetUser = targetUser;
//         next();
//       } 
//     } catch (err) {
//       console.log(err);
//       response.json({
//         status: 'failed',
//         message: 'Something went wrong or inexistent user'
//       });
//     }
//   }
  
//   const updateUser = async (request, response, next) => {
//     try {
//       let updateQuery = `UPDATE users 
//       SET firstname = $2, lastname = $3, age = $4 
//       WHERE id = $1`
//       await db.none(updateQuery, [request.id, request.firstName, request.lastName, request.age]);
//       next();
//     } catch (err) {
//       console.log(err);
//       response.json({
//         status: 'failed',
//         message: 'Something went wrong'
//       });
//     }
//   }
  
//   const returnUserByID = (request, response) => {
//     response.json({
//       status: 'success',
//       message: request.targetUser
//     })
//   }
//   // EXPECTING A BODY WITH {firstname, lastname, age}
//   router.put('/:userID', checkValidRoute, checkValidBody, getUserByID, updateUser, getUserByID, returnUserByID);
  
  
//   const deleteUser = async (request, response) => {
//     try {
//       let deleteQuery = `DELETE FROM users WHERE id = $1`
//       await db.none(deleteQuery, [request.id]);
//       response.json({
//         status: 'success',
//         message: request.targetUser
//       })
//     } catch (err) {
//       console.log(err);
//       response.json({
//         status: 'failed',
//         message: 'Something went wrong'
//       })
//     }
//   }
//   // DELETING A USER
//   router.delete('/:userID', checkValidRoute, getUserByID, deleteUser);
  
  

module.exports = router;