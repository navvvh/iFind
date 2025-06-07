-- Create the iFindDB database
CREATE DATABASE iFindDB;
GO

USE iFindDB;
GO

-- USERS TABLE
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    user_type VARCHAR(50) DEFAULT 'Student',
    date_registered DATETIME DEFAULT GETDATE()
);

-- POSTS TABLE (Lost/Found Items)
CREATE TABLE posts (
    post_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    description TEXT,
    campus VARCHAR(50) NOT NULL,           -- 'Main Building', 'Annex Building', 'Annex II Building'
    post_type VARCHAR(10) NOT NULL,        -- 'Lost' or 'Found'
    image_path VARCHAR(255),
    date_posted DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- COMMENTS TABLE (Optional user comments on posts)
CREATE TABLE comments (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    date_posted DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- NOTIFICATIONS TABLE (User alerts)
CREATE TABLE notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BIT DEFAULT 0,                        -- 0 = Unread, 1 = Read
    date_created DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- LIKES TABLE (Optional: track likes on posts)
CREATE TABLE likes (
    like_id INT IDENTITY(1,1) PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    date_liked DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- SAVED POSTS TABLE (Optional: bookmark functionality)
CREATE TABLE saved_posts (
    save_id INT IDENTITY(1,1) PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    date_saved DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

PRINT 'Database and tables created successfully!';
