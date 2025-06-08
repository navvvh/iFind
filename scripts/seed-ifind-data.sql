-- Insert sample users
INSERT INTO users (full_name, email, password, user_type, username, completed_setup) VALUES
('John Doe', 'john@example.com', 'password123', 'Student', 'johndoe', 1),
('Jane Smith', 'jane@example.com', 'password123', 'Staff', 'janesmith', 1),
('Mike Johnson', 'mike@example.com', 'password123', 'Faculty', 'mikejohnson', 0);

-- Insert sample posts
INSERT INTO posts (user_id, title, description, campus, post_type, image_path) VALUES
(1, 'Lost Item: Blue Backpack', 'Lost my blue backpack in the library on the 2nd floor. It contains my laptop and textbooks.', 'Main Building', 'Lost', '/images/backpack.jpg'),
(2, 'Found: Car Keys', 'Found a set of Toyota car keys in the parking lot near the Engineering building.', 'Engineering Building', 'Found', '/images/keys.jpg'),
(1, 'Lost Phone: iPhone 13', 'Lost my black iPhone 13 somewhere between the cafeteria and the gym.', 'Student Center', 'Lost', NULL);

-- Insert sample comments
INSERT INTO comments (post_id, user_id, comment_text) VALUES
(1, 2, 'I think I saw a blue backpack in the lost and found office!'),
(2, 1, 'Are they Toyota keys with a black keychain?'),
(3, 3, 'Check with the gym staff, they usually keep lost items at the front desk.');

PRINT 'Sample data inserted successfully!';
