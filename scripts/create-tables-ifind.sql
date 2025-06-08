-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    user_type NVARCHAR(20) NOT NULL CHECK (user_type IN ('Student', 'Staff', 'Faculty')),
    username NVARCHAR(50) UNIQUE NOT NULL,
    completed_setup BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Create Posts table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='posts' AND xtype='U')
CREATE TABLE posts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NTEXT NOT NULL,
    campus NVARCHAR(100) NOT NULL,
    post_type NVARCHAR(10) NOT NULL CHECK (post_type IN ('Lost', 'Found')),
    image_path NVARCHAR(500),
    status NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'Closed')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Comments table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='comments' AND xtype='U')
CREATE TABLE comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text NTEXT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IX_posts_user_id ON posts(user_id);
CREATE INDEX IX_posts_post_type ON posts(post_type);
CREATE INDEX IX_posts_campus ON posts(campus);
CREATE INDEX IX_comments_post_id ON comments(post_id);
CREATE INDEX IX_comments_user_id ON comments(user_id);

PRINT 'Tables created successfully!';
