document.addEventListener("DOMContentLoaded", () => {
  // Global State
  let claimedPosts = [];
  let currentUser = {};

  // DOM Elements
  const claimedFeed = document.getElementById("claimed-feed");
  const emptyState = document.getElementById("empty-state");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  
  const AVATAR_EMOJIS = ["👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "🧑‍🎨", "👨‍🔬", "👩‍🔬", "👨‍🎨"];

  // --- 1. INITIALIZATION ---
  async function initializeApp() {
      currentUser = getCurrentUserFromStorage();
      if (!currentUser.id) {
          alert("Could not identify user. Please log in again.");
          window.location.href = 'index.html';
          return;
      }
      initializeUserAvatar();
      await loadClaimedPosts();
      attachEventListeners();
  }

  function getCurrentUserFromStorage() {
      const data = JSON.parse(localStorage.getItem("ifindUserData")) || {};
      return {
          id: data.id,
          name: data.name,
          initials: data.name ? data.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??",
          avatarId: data.avatarId,
      };
  }

  function getAvatarHtml(avatarId, initials) {
      const index = parseInt(avatarId) - 1;
      if (avatarId && index >= 0 && index < AVATAR_EMOJIS.length) {
          return `<div class="default-avatar" style="font-size: 20px;">${AVATAR_EMOJIS[index]}</div>`;
      }
      return `<div class="default-avatar">${initials}</div>`;
  }

  function initializeUserAvatar() {
      const profilePicDiv = hamburgerMenu.querySelector('.profile-pic');
      if (profilePicDiv) {
          profilePicDiv.innerHTML = getAvatarHtml(currentUser.avatarId, currentUser.initials);
      }
  }

  function attachEventListeners() {
      document.getElementById("nav-feed").addEventListener("click", () => window.location.href = 'main.html');
      document.getElementById("nav-logout").addEventListener("click", handleLogout);
      document.getElementById("nav-claimed").addEventListener("click", () => window.location.reload());
      document.getElementById("nav-profile").addEventListener("click", () => alert("Profile page not implemented yet."));
      document.getElementById("nav-about").addEventListener("click", () => alert("About page not implemented yet."));
  }

  // --- 2. DATA HANDLING (API Calls) ---
  async function loadClaimedPosts() {
      try {
          // FIX: Fetch claimed posts WHERE THE AUTHOR IS THE CURRENT USER
          const response = await window.iFindAPI.Post.getAllPosts({
              post_type: 'claimed',
              userId: currentUser.id,
              authorId: currentUser.id // This is the new filter
          });

          if (!response.success) throw new Error("Failed to fetch claimed posts");
          
          const postsWithComments = await Promise.all(response.data.map(async (post) => {
              const commentsResponse = await window.iFindAPI.Comment.getCommentsForPost(post.post_id);
              post.comments = commentsResponse.success ? commentsResponse.data : [];
              return post;
          }));

          claimedPosts = postsWithComments;
          displayClaimedPosts(claimedPosts);
      } catch (error) {
          console.error("Error loading claimed posts:", error);
          claimedFeed.innerHTML = "<p>Could not load claimed posts. Please try again later.</p>";
      }
  }

  // ... (rest of the file remains the same) ...
  
  window.deletePost = async (postId) => {
      if (confirm("Are you sure you want to delete this post?")) {
          try {
              const response = await window.iFindAPI.Post.deletePost(postId);
              if (response.success) { await loadClaimedPosts(); } 
              else { alert("Error deleting post: " + (response.error || "Unknown error")); }
          } catch (error) { alert("An error occurred while deleting the post."); }
      }
  }

  window.toggleLike = async (postId) => {
      const post = claimedPosts.find(p => p.post_id === postId);
      if (!post) return;
      try {
          const response = post.has_liked
              ? await window.iFindAPI.Like.removeLike(postId, currentUser.id)
              : await window.iFindAPI.Like.addLike(postId, currentUser.id);
          if (response.success) { await loadClaimedPosts(); } 
          else { console.error("Failed to toggle like:", response.error); }
      } catch (error) { console.error("Error toggling like:", error); }
  };

  window.handleCommentSubmit = async (postId, button) => {
      const input = button.previousElementSibling;
      const commentText = input.value.trim();
      if (!commentText) return;
      const commentData = { post_id: postId, user_id: currentUser.id, comment_text: commentText };
      try {
          const response = await window.iFindAPI.Comment.addComment(commentData);
          if (response.success) { await loadClaimedPosts(); } 
          else { alert("Error adding comment: " + (response.error || "Unknown error")); }
      } catch (error) { alert("An error occurred while commenting."); }
  }

  // --- 3. UI RENDERING ---
  function displayClaimedPosts(postsToDisplay) {
      claimedFeed.innerHTML = '';
      if (!postsToDisplay || postsToDisplay.length === 0) {
          emptyState.style.display = 'block';
      } else {
          emptyState.style.display = 'none';
          postsToDisplay.forEach(post => {
              claimedFeed.appendChild(createPostElement(post));
          });
      }
  }

  function createPostElement(post) {
      const postElement = document.createElement('div');
      postElement.className = `post ${post.post_type}`;
      postElement.dataset.postId = post.post_id;

      const postDate = new Date(post.date_posted).toLocaleDateString();
      const timeString = `${postDate} ${post.date_last_edited ? `(Edited)` : ''}`;

      const authorInitials = (post.author_name || 'A').split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
      const authorAvatarHtml = getAvatarHtml(post.author_avatar_id, authorInitials);
      
      const commentsHtml = (post.comments || []).map(c => {
          const commenterInitials = (c.author_name || 'A').split(" ").map(n=>n[0]).join("").toUpperCase().substring(0,2);
          return `<div class="comment"><div class="comment-avatar"><div class="default-avatar">${commenterInitials}</div></div><div class="comment-bubble"><div class="comment-author">${c.author_name}</div><div class="comment-text">${c.comment_text}</div></div></div>`
      }).join('');
      
      postElement.innerHTML = `
          <div class="post-header">
              <div class="post-user">
                  <div class="profile-pic">${authorAvatarHtml}</div>
                  <div class="post-user-info">
                      <div class="post-user-name">${post.author_name}</div>
                      <div class="post-user-meta">${post.author_type}</div>
                      <div class="post-time">${timeString}</div>
                  </div>
              </div>
              <div class="post-options" onclick="this.querySelector('.post-options-dropdown').style.display = 'block'">
                  <i class="fas fa-ellipsis-h"></i>
                  <div class="post-options-dropdown" style="display:none;" onmouseleave="this.style.display='none'">
                      <button class="dropdown-item" onclick="deletePost(${post.post_id})"><i class="fas fa-trash"></i> Delete</button>
                  </div>
              </div>
          </div>
          <div class="post-content">
              <div class="post-text">
                  <span class="post-tag ${post.post_type}">${post.post_type}</span> ${post.description} — <strong>${post.campus}</strong>
              </div>
              ${post.image_path ? `<div class="post-image-container"><img src="${post.image_path}" class="post-image"></div>` : ''}
          </div>
          <div class="post-actions">
              <div class="post-action like-btn ${post.has_liked ? 'liked' : ''}" onclick="toggleLike(${post.post_id})">
                  <i class="${post.has_liked ? 'fas' : 'far'} fa-heart"></i>
                  <span>Heart (${post.like_count || 0})</span>
              </div>
              <div class="post-action" onclick="this.closest('.post').querySelector('.comments-list').style.display='block'">
                  <i class="far fa-comment"></i>
                  <span>Comment (${(post.comments || []).length})</span>
              </div>
          </div>
          <div class="post-comments">
              <div class="comments-list" style="display:none;">${commentsHtml}</div>
              <div class="comment-input">
                  <div class="comment-input-avatar">${getAvatarHtml(currentUser.avatarId, currentUser.initials)}</div>
                  <input type="text" class="comment-text" placeholder="Write a comment...">
                  <button class="send-comment" onclick="handleCommentSubmit(${post.post_id}, this)"><i class="fas fa-paper-plane"></i></button>
              </div>
          </div>`;
      return postElement;
  }

  // --- 4. MISC UI FUNCTIONS ---
  function handleLogout() {
      if (confirm("Are you sure you want to log out?")) {
          localStorage.clear();
          window.location.href = 'index.html';
      }
  }

  initializeApp();
});