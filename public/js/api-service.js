const API_URL = "http://localhost:3001/api";

const UserAPI = {
  loginUser: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
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
      const response = await fetch(`${API_BASE_URL}/users`, {
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
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

      const url = `${API_BASE_URL}/posts${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
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
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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
      const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  addComment: async (commentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
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
