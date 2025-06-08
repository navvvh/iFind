// --- START OF NEW main.js ---

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  let allPosts = [];
  let currentUser = {};
  let editingPostId = null;

  // DOM Elements
  const feed = document.getElementById("feed");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  
  // Modals & Forms
  const postModal = document.getElementById("post-modal");
  const postForm = document.getElementById("post-form");
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");

  // --- 1. INITIALIZATION ---

  // Main function to start the app
  async function initializeApp() {
    currentUser = getCurrentUserFromStorage();
    if (!currentUser.id) {
        alert("Could not identify user. Please log in again.");
        window.location.href = 'index.html';
        return;
    }

    if (!currentUser.completedSetup) {
        window.location.href = 'setup.html';
        return;
    }
    
    initializeUserAvatar();
    await loadPosts();
    attachEventListeners();
  }

  // Gets user data stored during login/setup
  function getCurrentUserFromStorage() {
    const data = JSON.parse(localStorage.getItem("ifindUserData")) || {};
    if (!data.name) return {}; // Return empty if no user data
    return {
        id: data.id,
        name: data.name,
        initials: data.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
        role: data.role?.toUpperCase() || 'STUDENT',
        completedSetup: data.completedSetup || false,
    };
  }

  // Sets the user's avatar in the top navbar
  function initializeUserAvatar() {
    const profilePicDiv = hamburgerMenu.querySelector('.profile-pic');
    if (profilePicDiv) {
        profilePicDiv.innerHTML = `<div class="default-avatar">${currentUser.initials}</div>`;
    }
  }

  // Attaches all event listeners for the page
  function attachEventListeners() {
    document.getElementById("add-post-btn").addEventListener("click", () => openPostModal());
    document.getElementById("close-modal").addEventListener("click", () => closePostModal());
    postForm.addEventListener("submit", handlePostSubmit);

    // Add listeners for edit modal
    document.getElementById("close-edit-modal").addEventListener("click", () => closeEditModal());
    editForm.addEventListener("submit", handleEditSubmit);

    // Search and logout
    searchInput.addEventListener("input", () => displayPosts(filterPosts()));
    document.getElementById("nav-logout").addEventListener("click", handleLogout);
  }

  // --- 2. DATA HANDLING (API Calls) ---

  // Fetches all posts and their comments from the API
  async function loadPosts() {
    try {
        const postsResponse = await window.iFindAPI.Post.getAllPosts();
        if (!postsResponse.success) throw new Error("Failed to fetch posts");
        
        // Fetch comments for each post
        const postsWithComments = await Promise.all(postsResponse.data.map(async (post) => {
            const commentsResponse = await window.iFindAPI.Comment.getCommentsForPost(post.post_id);
            post.comments = commentsResponse.success ? commentsResponse.data : [];
            return post;
        }));

        allPosts = postsWithComments;
        displayPosts(allPosts);
    } catch (error) {
        console.error("Error loading posts:", error);
        feed.innerHTML = "<p>Could not load posts. Please try again later.</p>";
    }
  }
  
  // Handles submission of the "Add Post" form
  async function handlePostSubmit(event) {
    event.preventDefault();
    const description = document.getElementById("post-description").value;
    const postData = {
        user_id: currentUser.id,
        title: description.substring(0, 50),
        description: description,
        campus: document.getElementById("post-location").value,
        post_type: document.getElementById("post-type").value,
        image_path: null, // Image upload needs a separate implementation
    };

    try {
        const response = await window.iFindAPI.Post.createPost(postData);
        if (response.success) {
            closePostModal();
            await loadPosts(); // Reload all posts to show the new one
        } else {
            alert("Error creating post: " + response.error);
        }
    } catch (error) {
        console.error("Post creation failed:", error);
        alert("An error occurred. Please try again.");
    }
  }
  
  // Handles submission of the "Edit Post" form
  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!editingPostId) return;

    const postData = {
        title: document.getElementById("edit-description").value.substring(0, 50),
        description: document.getElementById("edit-description").value,
        campus: document.getElementById("edit-location").value,
        post_type: document.getElementById("edit-type").value,
    };

    try {
        const response = await window.iFindAPI.Post.updatePost(editingPostId, postData);
        if (response.success) {
            closeEditModal();
            await loadPosts();
        } else {
            alert("Error updating post: " + response.error);
        }
    } catch (error) {
        console.error("Post update failed:", error);
        alert("An error occurred while updating. Please try again.");
    }
  }

  // Deletes a post
  window.deletePost = async (postId) => {
    if (confirm("Are you sure you want to delete this post?")) {
        try {
            const response = await window.iFindAPI.Post.deletePost(postId);
            if(response.success) {
                await loadPosts();
            } else {
                alert("Error deleting post: " + response.error);
            }
        } catch (error) {
            alert("An error occurred while deleting the post.");
        }
    }
  }
  
  // Adds a comment to a post
  window.handleCommentSubmit = async (postId, button) => {
    const input = button.previousElementSibling;
    const commentText = input.value.trim();
    if (!commentText) return;

    const commentData = {
        post_id: postId,
        user_id: currentUser.id,
        comment_text: commentText
    };

    try {
        const response = await window.iFindAPI.Comment.addComment(commentData);
        if (response.success) {
            input.value = '';
            await loadPosts(); // Simple way to refresh everything
        } else {
            alert("Error adding comment: " + response.error);
        }
    } catch (error) {
        alert("An error occurred while commenting.");
    }
  }
  
  // Marks a post as claimed
  window.markAsClaimed = async (postId) => {
    const post = allPosts.find(p => p.post_id === postId);
    if (!post) return;

    const postData = { ...post, post_type: 'claimed' };

    try {
        const response = await window.iFindAPI.Post.updatePost(postId, postData);
        if (response.success) {
            await loadPosts();
        } else {
            alert("Error marking as claimed: " + response.error);
        }
    } catch (error) {
        alert("An error occurred while updating the post.");
    }
  }

  // --- 3. UI RENDERING & INTERACTIONS ---
  
  // Filters posts based on the search input
  function filterPosts() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return allPosts;
    return allPosts.filter(post => 
        post.description.toLowerCase().includes(searchTerm) ||
        post.campus.toLowerCase().includes(searchTerm)
    );
  }

  // Renders the posts to the feed
  function displayPosts(postsToDisplay) {
    feed.innerHTML = ''; // Clear the feed
    if (postsToDisplay.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        postsToDisplay.forEach(post => {
            const postElement = createPostElement(post);
            feed.appendChild(postElement);
        });
    }
  }

  // Creates the HTML for a single post
  function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.dataset.postId = post.post_id;
    
    const postDate = new Date(post.date_posted).toLocaleDateString();
    const userInitials = post.author_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

    const commentsHtml = post.comments.map(comment => `
        <div class="comment">
            <div class="comment-avatar"><div class="default-avatar">${comment.author_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}</div></div>
            <div class="comment-bubble">
                <div class="comment-author">${comment.author_name}</div>
                <div class="comment-text">${comment.comment_text}</div>
            </div>
        </div>
    `).join('');

    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="profile-pic"><div class="default-avatar">${userInitials}</div></div>
                <div class="post-user-info">
                    <div class="post-user-name">${post.author_name}</div>
                    <div class="post-user-meta">${post.author_type}</div>
                    <div class="post-time">${postDate}</div>
                </div>
            </div>
            <div class="post-options" onclick="this.querySelector('.post-options-dropdown').style.display='block'">
                <i class="fas fa-ellipsis-h"></i>
                <div class="post-options-dropdown" style="display:none;" onmouseleave="this.style.display='none'">
                    <button class="dropdown-item" onclick="openEditModal(${post.post_id})">Edit</button>
                    <button class="dropdown-item" onclick="markAsClaimed(${post.post_id})">Mark as Claimed</button>
                    <button class="dropdown-item" onclick="deletePost(${post.post_id})">Delete</button>
                </div>
            </div>
        </div>
        <div class="post-content">
            <div class="post-text">
                <span class="post-tag ${post.post_type}">${post.post_type}</span>
                ${post.description} — <strong>${post.campus}</strong>
            </div>
            ${post.image_path ? `<div class="post-image-container"><img src="${post.image_path}" class="post-image"></div>` : ''}
        </div>
        <div class="post-actions">
            <button class="post-action">Like</button>
            <button class="post-action" onclick="this.closest('.post').querySelector('.comments-list').style.display='block'">Comment (${post.comments.length})</button>
        </div>
        <div class="post-comments">
            <div class="comments-list" style="display:none;">${commentsHtml}</div>
            <div class="comment-input">
                <div class="comment-input-avatar"><div class="default-avatar">${currentUser.initials}</div></div>
                <input type="text" class="comment-text" placeholder="Write a comment...">
                <button class="send-comment" onclick="handleCommentSubmit(${post.post_id}, this)"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    return postElement;
  }

  // --- 4. MODAL & MISC UI FUNCTIONS ---
  
  // Functions to open/close modals
  function openPostModal() {
    postModal.style.display = 'flex';
  }
  function closePostModal() {
    postModal.style.display = 'none';
    postForm.reset();
  }
  window.openEditModal = (postId) => {
    editingPostId = postId;
    const post = allPosts.find(p => p.post_id === postId);
    if (!post) return;
    
    document.getElementById("edit-type").value = post.post_type;
    document.getElementById("edit-location").value = post.campus;
    document.getElementById("edit-description").value = post.description;

    editModal.style.display = 'flex';
  }
  function closeEditModal() {
    editModal.style.display = 'none';
    editForm.reset();
    editingPostId = null;
  }
  
  // Logout function
  function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
  }

  // --- KICK OFF THE APPLICATION ---
  initializeApp();
});