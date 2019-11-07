DROP DATABASE IF EXISTS social_media_app_db;

CREATE DATABASE social_media_app_db;

\c social_media_app_db

-- USERS TABLE:
CREATE TABLE users (
    username VARCHAR PRIMARY KEY,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    dob DATE NOT NULL,
    user_password VARCHAR NOT NULL,
    signing_date DATE NOT NULL DEFAULT CURRENT_DATE
);
-- PostgreSQL uses the  yyyy-mm-dd format (ENTERED AS A STRING!!!)
-- TO REQUEST A DATE : SELECT TO_CHAR(NOW() :: DATE, 'Mon dd, yyyy'); 
-- TO CALCULATE AGE : SELECT AGE(birth_date);

-- POSTS TABLE:
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    poster_username VARCHAR REFERENCES users (username) ON DELETE CASCADE,
    body VARCHAR NOT NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE
);


-- ALBUMS TABLE:
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    album_name VARCHAR,
    owner_username VARCHAR REFERENCES users (username) ON DELETE CASCADE,
    album_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- PICTURES TABLE
CREATE TABLE pictures (
    id SERIAL PRIMARY KEY,
    album_id INT REFERENCES albums (id) ON DELETE CASCADE,
    picure_link VARCHAR NOT NULL,
    picture_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- COMMENTS TABLE:
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    author_username VARCHAR REFERENCES users (username) ON DELETE CASCADE,
    post_id INT REFERENCES posts (id) ON DELETE CASCADE,
    picture_id INT REFERENCES pictures (id) ON DELETE CASCADE,
    comment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- LIKES TABLE:
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    liker_username VARCHAR REFERENCES users (username) ON DELETE CASCADE,
    post_id INT REFERENCES posts (id) ON DELETE CASCADE,
    picture_id INT REFERENCES pictures (id) ON DELETE CASCADE
);


INSERT INTO users (username, firstname, lastname, dob, user_password)
    VALUES ('vonbar','Voniel','Brown', '1995-08-23', '123'),
            ('AminesCodes', 'Amine', 'Bensalem', '1983-06-14', '456'),
            ('sergiocohens', 'Sergio', 'Cohen-Salama', '1987-04-10', '789'),
            ('jenama','Johanne','Enama', '1991-03-15', '234');


INSERT INTO posts (poster_username, body)
    VALUES ('AminesCodes', 'This is my first post :)'),
            ('vonbar', 'I like turtles'),
            ('AminesCodes', 'I like this chair !!'),
            ('vonbar', 'this is a comment'),
            ('jenama', 'let''s do this'),
            ('jenama', 'comment on a picture'),
            ('sergiocohens', 'save the whales'),
            ('sergiocohens', 'eat pray and love');
            
SELECT * FROM users JOIN posts ON username = poster_username;