USE iFind;
GO

-- Insert sample users (only if table is empty)
IF NOT EXISTS (SELECT * FROM users)
BEGIN
    INSERT INTO users (full_name, email, password, user_type) VALUES
    ('John Doe', 'john.doe@university.edu', 'hashed_password_1', 'Student'),
    ('Jane Smith', 'jane.smith@university.edu', 'hashed_password_2', 'Faculty'),
    ('Mike Johnson', 'mike.johnson@university.edu', 'hashed_password_3', 'Student'),
    ('Sarah Wilson', 'sarah.wilson@university.edu', 'hashed_password_4', 'Staff');

    PRINT 'Sample users inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Users table already has data.';
END

-- Insert sample posts (only if table is empty)
IF NOT EXISTS (SELECT * FROM posts)
BEGIN
    INSERT INTO posts (user_id, title, description, campus, post_type, image_path) VALUES
    (1, 'Lost iPhone 13', 'Lost my black iPhone 13 near the library. Has a blue case with initials JD.', 'Main Building', 'Lost', '/images/iphone.jpg'),
    (2, 'Found Keys', 'Found a set of keys with a Toyota keychain near the parking lot.', 'Annex Building', 'Found', '/images/keys.jpg'),
    (3, 'Lost Textbook', 'Lost my Chemistry textbook in the cafeteria. Title: Organic Chemistry 101', 'Main Building', 'Lost', NULL),
    (4, 'Found Wallet', 'Found a brown leather wallet in the restroom. Contains student ID.', 'Annex II Building', 'Found', '/images/wallet.jpg');

    PRINT 'Sample posts inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Posts table already has data.';
END

-- Insert sample comments (only if table is empty)
IF NOT EXISTS (SELECT * FROM comments)
BEGIN
    INSERT INTO comments (post_id, user_id, comment_text) VALUES
    (1, 2, 'I saw someone with a similar phone near the gym yesterday.'),
    (2, 1, 'Are these Honda keys? I think I know who lost them.'),
    (4, 3, 'Is there a name on the student ID? I can help identify the owner.');

    PRINT 'Sample comments inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Comments table already has data.';
END

-- Insert sample notifications (only if table is empty)
IF NOT EXISTS (SELECT * FROM notifications)
BEGIN
    INSERT INTO notifications (user_id, message) VALUES
    (1, 'Someone commented on your lost iPhone post.'),
    (2, 'Your found keys post has been viewed 15 times.'),
    (4, 'New comment on your found wallet post.');

    PRINT 'Sample notifications inserted successfully!';
END
ELSE
BEGIN
    PRINT 'Notifications table already has data.';
END

-- Show summary of data
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM users
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Likes', COUNT(*) FROM likes
UNION ALL
SELECT 'Saved Posts', COUNT(*) FROM saved_posts;

PRINT 'Sample data setup complete for iFind database!';
