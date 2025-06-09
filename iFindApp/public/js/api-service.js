const API_URL = "http://localhost:3001/api";

const UserAPI = {
  // Functions for login, registration, etc.
  loginUser: (credentials) => fetch(`${API_URL}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(res => res.json()),
  createUser: (userData) => fetch(`${API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(res => res.json()),
  
  // --- THIS IS THE CRITICAL PART FOR THE PROFILE PAGE ---
  getUserById: (userId) => fetch(`${API_URL}/users/${userId}`).then(res => res.json()),
  updateUser: (userId, userData) => fetch(`${API_URL}/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(res => res.json()),
};

const PostAPI = {
  getAllPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/posts?${query}`).then(res => res.json());
  },
  createPost: (postData) => fetch(`${API_URL}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(postData) }).then(res => res.json()),
  updatePost: (postId, postData) => fetch(`${API_URL}/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(postData) }).then(res => res.json()),
  deletePost: (postId) => fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' }).then(res => res.json()),
};

const CommentAPI = {
  getCommentsForPost: (postId) => fetch(`${API_URL}/comments/post/${postId}`).then(res => res.json()),
  addComment: (commentData) => fetch(`${API_URL}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(commentData) }).then(res => res.json()),
};

const LikeAPI = {
  addLike: (postId, userId) => fetch(`${API_URL}/likes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, user_id: userId }) }).then(res => res.json()),
  removeLike: (postId, userId) => fetch(`${API_URL}/likes/post/${postId}/user/${userId}`, { method: 'DELETE' }).then(res => res.json()),
};

const NotificationAPI = {
  getNotificationsForUser: (userId) => fetch(`${API_URL}/notifications/user/${userId}`).then(res => res.json()),
  markAllAsRead: (userId) => fetch(`${API_URL}/notifications/user/${userId}/mark-read`, { method: 'PUT' }).then(res => res.json()),
};

// Make sure all APIs are exposed to the window object
window.iFindAPI = { 
  User: UserAPI, 
  Post: PostAPI, 
  Comment: CommentAPI, 
  Like: LikeAPI,
  Notification: NotificationAPI 
};