// --- START OF CORRECTED api-service.js ---

const API_URL = "http://localhost:3001/api"; // This is the correct variable

const UserAPI = {
  loginUser: async (credentials) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
};

// ==========================
// Post API
// ==========================
const PostAPI = {
  getAllPosts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.campus) queryParams.append("campus", filters.campus);
      if (filters.post_type) queryParams.append("post_type", filters.post_type);

      // ✅ FIX: Changed API_BASE_URL to API_URL
      const url = `${API_URL}/posts${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/posts/${postId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw error;
    }
  },
};

// ==========================
// Comment API
// ==========================
const CommentAPI = {
  getCommentsForPost: async (postId) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/comments/post/${postId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  addComment: async (commentData) => {
    try {
      // ✅ FIX: Changed API_BASE_URL to API_URL
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },
};

// ==========================
// Export to global window
// ==========================
const API = {
  User: UserAPI,
  Post: PostAPI,
  Comment: CommentAPI,
};

window.iFindAPI = API;