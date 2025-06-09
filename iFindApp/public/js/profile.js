document.addEventListener("DOMContentLoaded", () => {
  // ... (Global State and DOM elements are the same)
  let currentUser = {};
  let userDetails = {};
  let userPosts = [];
  let editingPostId = null;

  const profilePostsContainer = document.getElementById("profile-posts");
  const sidebar = document.getElementById("sidebar");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const editProfileModal = document.getElementById("edit-profile-modal");
  const editProfileForm = document.getElementById("profile-edit-form");
  const editPostModal = document.getElementById("edit-post-modal");
  const editPostForm = document.getElementById("edit-post-form");

  const AVATAR_EMOJIS = ["👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "🧑‍🎨", "👨‍🔬", "👩‍🔬", "👨‍🎨"];

  async function initializeApp() {
      currentUser = getCurrentUserFromStorage();
      if (!currentUser.id) {
          alert("Could not identify user. Please log in again.");
          window.location.href = 'index.html';
          return;
      }

      await Promise.all([
          loadUserProfile(),
          loadUserPosts()
      ]);

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
  
  async function loadUserProfile() {
      try {
          const response = await window.iFindAPI.User.getUserById(currentUser.id);
          if (!response.success) throw new Error("Failed to fetch user profile");
          userDetails = response.data;
          populateProfileUI(userDetails);
      } catch (error) {
          console.error("Error loading user profile:", error);
          // This alert shows when the API call fails.
          alert("Could not load your profile data. Please check the console for errors.");
      }
  }

  async function loadUserPosts() {
      try {
          const response = await window.iFindAPI.Post.getAllPosts({
              authorId: currentUser.id,
              userId: currentUser.id
          });
          if (!response.success) throw new Error("Failed to fetch user posts");

          const postsWithComments = await Promise.all(response.data.map(async (post) => {
              const commentsResponse = await window.iFindAPI.Comment.getCommentsForPost(post.post_id);
              post.comments = commentsResponse.success ? commentsResponse.data : [];
              return post;
          }));

          userPosts = postsWithComments;
          displayPosts(userPosts);
      } catch (error) {
          console.error("Error loading user posts:", error);
      }
  }

  // START OF FIX: This function now safely handles missing (null) data.
  function populateProfileUI(user) {
      // Safely get initials, providing a fallback.
      const initials = user.full_name ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
      const avatarHtml = getAvatarHtml(user.avatar_id, initials);
      
      document.querySelector('.profile-avatar-large').innerHTML = avatarHtml.replace('font-size: 20px', 'font-size: 64px');
      document.querySelector('.profile-name-large').innerText = user.full_name || "Unknown User";
      document.querySelector('.profile-username-large').innerText = user.username ? `@${user.username}` : "No username";
      document.querySelector('.profile-role-large').innerText = user.user_type || "No Role";
      
      const contactLink = document.querySelector('.profile-contact-value a');
      contactLink.innerText = user.contact_url || "Not set";
      contactLink.href = user.contact_url ? `https://${user.contact_url}` : '#';

      document.getElementById('profile-nav-avatar').innerHTML = avatarHtml.replace('font-size: 20px', 'font-size: 18px');
  }
  // END OF FIX

  // ... (The rest of the file is correct and unchanged)
  function displayPosts(posts) {
      profilePostsContainer.innerHTML = '';
      if (!posts || posts.length === 0) {
          profilePostsContainer.innerHTML = '<div class="no-posts"><p>You haven\'t made any posts yet.</p></div>';
          return;
      }
      posts.forEach(post => {
          profilePostsContainer.appendChild(createPostElement(post));
      });
  }

  function attachEventListeners() {
      hamburgerMenu.addEventListener("click", () => sidebar.classList.toggle("active"));
      document.addEventListener("click", (e) => {
          if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
              sidebar.classList.remove("active");
          }
      });

      document.getElementById("nav-feed").addEventListener("click", () => window.location.href = 'main.html');
      document.getElementById("nav-claimed").addEventListener("click", () => window.location.href = 'claim.html');
      document.getElementById("nav-profile").addEventListener("click", () => window.location.reload());
      document.getElementById("nav-logout").addEventListener("click", handleLogout);
      document.getElementById("nav-about").addEventListener("click", () => window.location.href = 'about.html');

      document.getElementById("edit-profile-btn").addEventListener("click", openEditProfileModal);
      document.getElementById("close-edit-profile-modal").addEventListener("click", closeEditProfileModal);
      document.getElementById("cancel-edit-profile").addEventListener("click", closeEditProfileModal);
      editProfileForm.addEventListener("submit", handleProfileUpdate);

      document.getElementById("close-edit-post-modal").addEventListener("click", closeEditPostModal);
      document.getElementById("cancel-edit-post").addEventListener("click", closeEditPostModal);
      editPostForm.addEventListener("submit", handleEditPostSubmit);
  }

  window.toggleLike = async (postId) => {
      const post = userPosts.find(p => p.post_id === postId);
      if (!post) return;
      try {
          const response = post.has_liked
              ? await window.iFindAPI.Like.removeLike(postId, currentUser.id)
              : await window.iFindAPI.Like.addLike(postId, currentUser.id);

          if (response.success) await loadUserPosts();
          else console.error("Failed to toggle like:", response.error);
      } catch (error) { console.error("Error toggling like:", error); }
  };

  window.handleCommentSubmit = async (postId, button) => {
      const input = button.previousElementSibling;
      const commentText = input.value.trim();
      if (!commentText) return;
      const commentData = { post_id: postId, user_id: currentUser.id, comment_text: commentText };
      try {
          const response = await window.iFindAPI.Comment.addComment(commentData);
          if (response.success) await loadUserPosts();
          else alert("Error adding comment: " + (response.error || "Unknown error"));
      } catch (error) { alert("An error occurred while commenting."); }
  }

  window.markAsClaimed = async (postId) => {
      const post = userPosts.find(p => p.post_id === postId);
      if (!post) return;
      const postData = { description: post.description, campus: post.campus, post_type: 'claimed' };
      try {
          const response = await window.iFindAPI.Post.updatePost(postId, postData);
          if (response.success) await loadUserPosts();
          else alert("Error marking as claimed: " + (response.error || "Unknown error"));
      } catch (error) { alert("An error occurred while updating the post."); }
  }

  window.deletePost = async (postId) => {
      if (confirm("Are you sure you want to delete this post?")) {
          try {
              const response = await window.iFindAPI.Post.deletePost(postId);
              if (response.success) await loadUserPosts();
              else alert("Error deleting post: " + (response.error || "Unknown error"));
          } catch (error) { alert("An error occurred while deleting the post."); }
      }
  }

  function openEditProfileModal() {
      const initials = userDetails.full_name ? userDetails.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??";
      document.querySelector("#edit-profile-modal .default-avatar").innerHTML = getAvatarHtml(userDetails.avatar_id, initials).replace('font-size: 20px', 'font-size: 48px');
      document.getElementById("edit-name").value = userDetails.full_name || '';
      document.getElementById("edit-username").value = userDetails.username || '';
      document.getElementById("edit-contact").value = userDetails.contact_url || '';
      editProfileModal.style.display = 'flex';
  }

  function closeEditProfileModal() { editProfileModal.style.display = 'none'; }
  
  window.openEditPostModal = (postId) => {
      editingPostId = postId;
      const post = userPosts.find(p => p.post_id === postId);
      if (!post) return;
      document.getElementById("edit-type").value = post.post_type;
      document.getElementById("edit-location").value = post.campus;
      document.getElementById("edit-description").value = post.description;
      editPostModal.style.display = 'flex';
  }

  function closeEditPostModal() {
      editPostModal.style.display = 'none';
      editingPostId = null;
  }

  async function handleProfileUpdate(event) {
      event.preventDefault();
      const updatedData = {
          full_name: document.getElementById("edit-name").value,
          username: document.getElementById("edit-username").value,
          contact_url: document.getElementById("edit-contact").value,
      };
      try {
          const response = await window.iFindAPI.User.updateUser(currentUser.id, updatedData);
          if (response.success) {
              const localData = JSON.parse(localStorage.getItem("ifindUserData"));
              localData.name = updatedData.full_name;
              localStorage.setItem("ifindUserData", JSON.stringify(localData));
              alert("Profile updated successfully!");
              closeEditProfileModal();
              window.location.reload();
          } else { throw new Error(response.error || "Failed to update profile"); }
      } catch (error) { alert(`Error: ${error.message}`); }
  }
  
  async function handleEditPostSubmit(event) {
      event.preventDefault();
      if (!editingPostId) return;
      const postData = {
          description: document.getElementById("edit-description").value,
          campus: document.getElementById("edit-location").value,
          post_type: document.getElementById("edit-type").value,
      };
      try {
          const response = await window.iFindAPI.Post.updatePost(editingPostId, postData);
          if (response.success) {
              closeEditPostModal();
              await loadUserPosts();
          } else { alert("Error updating post: " + (response.error || "Unknown error")); }
      } catch (error) { alert("An error occurred while updating."); }
  }

  function handleLogout() {
      if (confirm("Are you sure you want to log out?")) {
          localStorage.clear();
          window.location.href = 'index.html';
      }
  }

  function getAvatarHtml(avatarId, initials) {
      const index = parseInt(avatarId) - 1;
      if (avatarId && index >= 0 && index < AVATAR_EMOJIS.length) {
          return `<div class="default-avatar" style="font-size: 20px;">${AVATAR_EMOJIS[index]}</div>`;
      }
      return `<div class="default-avatar">${initials}</div>`;
  }

  function createPostElement(post) {
      const postElement = document.createElement('div');
      postElement.className = `post ${post.post_type}`;
      postElement.dataset.postId = post.post_id;
      
      const postDate = new Date(post.date_posted).toLocaleDateString();
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
                      <div class="post-time">${postDate}</div>
                  </div>
              </div>
              <div class="post-options" onclick="this.querySelector('.post-options-dropdown').style.display = 'block'">
                  <i class="fas fa-ellipsis-h"></i>
                  <div class="post-options-dropdown" style="display:none;" onmouseleave="this.style.display='none'">
                      <button class="dropdown-item" onclick="openEditPostModal(${post.post_id})"><i class="fas fa-edit"></i> Edit</button>
                      <button class="dropdown-item" onclick="markAsClaimed(${post.post_id})"><i class="fas fa-check"></i> Mark as Claimed</button>
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

  initializeApp();
});