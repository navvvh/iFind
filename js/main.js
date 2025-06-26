// ===================== DOM Elements =====================
const hamburgerMenu = document.getElementById("hamburger-menu");
const sidebar = document.getElementById("sidebar");
const filterModal = document.getElementById("filter-modal");
const closeFilterModal = document.getElementById("close-filter-modal");
const feed = document.getElementById("feed");
const emptyState = document.getElementById("empty-state");
const filterBtn = document.getElementById("filter-btn");
const searchInput = document.getElementById("search-input");
const clearFiltersBtn = document.getElementById("clear-filters");
const applyFiltersBtn = document.getElementById("apply-filters");
const navProfile = document.getElementById("nav-profile");
const navAbout = document.getElementById("nav-about");
const navClaimed = document.getElementById("nav-claimed");
const navLogout = document.getElementById("nav-logout");

// Add Post Modal Elements
const addPostBtn = document.getElementById("add-post-btn");
const postModal = document.getElementById("post-modal");
const closeModal = document.getElementById("close-modal");
const cancelPost = document.getElementById("cancel-post");
const postForm = document.getElementById("post-form");
const postImage = document.getElementById("post-image");
const fileName = document.getElementById("file-name");
const imagePreview = document.getElementById("image-preview");

// Edit Post Modal Elements
const editModal = document.getElementById("edit-modal");
const closeEditModal = document.getElementById("close-edit-modal");
const cancelEdit = document.getElementById("cancel-edit");
const editForm = document.getElementById("edit-form");
const editImage = document.getElementById("edit-image");
const editFileName = document.getElementById("edit-file-name");
const editImagePreview = document.getElementById("edit-image-preview");
const currentImage = document.getElementById("current-image");

// Delete Confirmation Modal Elements
const deleteModal = document.getElementById("delete-modal");
const deleteOkBtn = document.getElementById("delete-ok-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");
const deleteXBtn = document.getElementById("delete-x-btn");
let currentDeletePostId = null;
let currentEditPostId = null;
let currentDeleteCommentData = null;

// Logout Modal Elements
let logoutModal = null;
let logoutConfirmBtn = null;
let logoutCancelBtn = null;
let logoutXBtn = null;

// Notification and Announcement Elements
const notificationBell = document.getElementById("notification-bell");
const notificationDropdown = document.getElementById("notification-dropdown");
const announcementIcon = document.getElementById("announcement-icon");
const announcementDropdown = document.getElementById("announcement-dropdown");
const markAllRead = document.getElementById("mark-all-read");
const notificationCount = document.getElementById("notification-count");

// ===================== State =====================
let allPosts = [];
const currentFilters = { types: [], locations: [] };
let unreadNotifications = 0;

// ===================== Utility Functions =====================

// Logout Modal
function createLogoutModal() {
  logoutModal = document.createElement("div");
  logoutModal.id = "logout-modal";
  logoutModal.className = "logout-modal";
  logoutModal.innerHTML = `
    <div class="logout-modal-content">
      <button class="logout-x-btn" id="logout-x-btn">
        <i class="fas fa-times"></i>
      </button>
      <div class="logout-modal-body">
        <div class="logout-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <div class="logout-message">
          <p>Are you sure you want to logout?</p>
        </div>
        <div class="logout-actions">
          <button class="logout-btn logout-cancel-btn" id="logout-cancel-btn">Cancel</button>
          <button class="logout-btn logout-confirm-btn" id="logout-confirm-btn">Confirm</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(logoutModal);
  logoutConfirmBtn = document.getElementById("logout-confirm-btn");
  logoutCancelBtn = document.getElementById("logout-cancel-btn");
  logoutXBtn = document.getElementById("logout-x-btn");
  logoutConfirmBtn.addEventListener("click", () => {
    closeLogoutModal();
    performLogout();
  });
  logoutCancelBtn.addEventListener("click", closeLogoutModal);
  logoutXBtn.addEventListener("click", closeLogoutModal);
  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) closeLogoutModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && logoutModal && logoutModal.classList.contains("active")) closeLogoutModal();
  });
}
function openLogoutModal() {
  if (!logoutModal) createLogoutModal();
  logoutModal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeLogoutModal() {
  if (logoutModal) {
    logoutModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}
function performLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Storage
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("userPosts");
  if (storedPosts) {
    allPosts = JSON.parse(storedPosts);
    filterPosts();
  }
}
function savePostsToStorage() {
  localStorage.setItem("userPosts", JSON.stringify(allPosts));
}

// User
function getCurrentUser() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {};
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {};
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {};
  const user = {
    name: userProfile.name || ifindUserData.name || mockUser.username || userData.username || sessionData.username || "You",
    username: userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "user",
    email: userProfile.email || mockUser.email || userData.email || sessionData.email || "",
    role: userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role || "STUDENT",
    avatar: userProfile.avatar || mockUser.avatar || null,
    avatarId: userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId || null,
    avatarEmoji: userProfile.avatarEmoji || ifindUserData.avatar || null,
    contact: userProfile.contact ||
      `fb.com/${(userProfile.username || ifindUserData.name?.toLowerCase().replace(/\s+/g, "") || mockUser.username || userData.username || sessionData.username || "user").toLowerCase()}`,
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  };
  user.initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  if (!user.username.startsWith("@")) user.username = "@" + user.username;
  return user;
}
function initializeUserAvatar() {
  const currentUser = getCurrentUser();
  const hamburgerProfilePic = hamburgerMenu.querySelector(".profile-pic");
  if (hamburgerProfilePic) {
    if (currentUser.avatar) {
      hamburgerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`;
    } else if (currentUser.avatarId) {
      const avatarEmojis = ["👨‍💼","👩‍💼","👨‍🎓","👩‍🎓","👨‍🏫","👩‍🏫","👨‍💻","👩‍💻","👨‍🔬","👩‍🔬","👨‍🎨","👩‍🎨"];
      const avatarIndex = Number.parseInt(currentUser.avatarId) - 1;
      const emoji = avatarEmojis[avatarIndex] || "👤";
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`;
    } else {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`;
    }
  }
}

// Time Formatting
function formatPostTime(timestamp) {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postTime) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return postTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: postTime.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}


function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post" // Remove tilt-in-top-1 from here
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  // Enhanced avatar display
  let avatarHTML = ""
  if (postData.avatar) {
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    avatarHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${postData.avatarEmoji}</div>`
  } else if (postData.avatarId) {
    const avatarEmojis = [
      "👨‍💼",
      "👩‍💼",
      "👨‍🎓",
      "👩‍🎓",
      "👨‍🏫",
      "👩‍🏫",
      "👨‍💻",
      "👩‍💻",
      "👨‍🔬",
      "👩‍🔬",
      "👨‍🎨",
      "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(postData.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    avatarHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
  } else {
    avatarHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${postData.userInitials}</div>`
  }

  // Create image HTML
  let imageHTML = ""
  if (postData.image) {
    imageHTML = `
      <div class="post-image-container loading" id="image-container-${postData.id}">
        <img src="${postData.image}" 
             alt="${postData.type} item" 
             class="post-image"
             onload="handleImageLoad(this, '${postData.id}')"
             onerror="handleImageError(this, '${postData.id}')">
      </div>
    `
  }



  // Create comments HTML
  const commentCount = postData.comments ? postData.comments.length : 0
  const commentsHTML =
    postData.comments && postData.comments.length > 0
      ? postData.comments
          .map((comment) => {
            const currentUser = getCurrentUser()
            let commentAvatarHTML = ""

            if (comment.authorHandle === currentUser.username || comment.author === currentUser.name) {
              if (currentUser.avatar) {
                commentAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
              } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
                commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.avatarEmoji}</div>`
              } else if (currentUser.avatarId) {
                const avatarEmojis = [
                  "👨‍💼",
                  "👩‍💼",
                  "👨‍🎓",
                  "👩‍🎓",
                  "👨‍🏫",
                  "👩‍🏫",
                  "👨‍💻",
                  "👩‍💻",
                  "👨‍🔬",
                  "👩‍🔬",
                  "👨‍🎨",
                  "👩‍🎨",
                ]
                const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
                const emoji = avatarEmojis[avatarIndex] || "👤"
                commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${emoji}</div>`
              } else {
                commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.initials}</div>`
              }
            } else {
              if (comment.avatar) {
                commentAvatarHTML = `<img src="${comment.avatar}" alt="${comment.author}" style="width: 100%; height: 100%; object-fit: cover;">`
              } else if (comment.avatarEmoji && comment.avatarEmoji !== "👤") {
                commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.avatarEmoji}</div>`
              } else {
                commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}</div>`
              }
            }

            return `
          <div class="comment">
            <div class="comment-avatar">
              ${commentAvatarHTML}
            </div>
            <div class="comment-bubble">
              <div class="comment-author">${comment.author}</div>
              <div class="comment-text">${comment.text}</div>
              <button class="delete-comment" onclick="deleteComment('${postData.id}', '${comment.id}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="comment-time">${formatPostTime(comment.timestamp)}</div>
        `
          })
          .join("")
      : ""

  // Get current user for comment input avatar
  const currentUser = getCurrentUser()
  let currentUserAvatarHTML = ""
  if (currentUser.avatar) {
    currentUserAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.avatarEmoji}</div>`
  } else if (currentUser.avatarId) {
    const avatarEmojis = [
      "👨‍💼",
      "👩‍💼",
      "👨‍🎓",
      "👩‍🎓",
      "👨‍🏫",
      "👩‍🏫",
      "👨‍💻",
      "👩‍💻",
      "👨‍🔬",
      "👩‍🔬",
      "👨‍🎨",
      "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${emoji}</div>`
  } else {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.initials}</div>`
  }

  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-user">
        <div class="profile-pic">
          ${avatarHTML}
        </div>
        <div class="post-user-info">
          <div class="post-user-name-time">
            <div class="post-user-name">${postData.userName}</div>
            <div class="post-time">${formatPostTime(postData.timestamp)}</div>
          </div>
          <div class="post-user-meta">${postData.userHandle}<br>${postData.userRole}</div>
        </div>
      </div>
      <div class="post-options" onclick="togglePostOptions(this)">
        <i class="fas fa-ellipsis-h"></i>
        <div class="post-options-dropdown">
          <div class="dropdown-item" onclick="editPost('${postData.id}')">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </div>
          <div class="dropdown-item" onclick="markAsClaimed('${postData.id}')">
            <i class="fas fa-check"></i>
            <span>Claimed</span>
          </div>
          <div class="dropdown-item" onclick="deletePost('${postData.id}')">
            <i class="fas fa-trash"></i>
            <span>Delete</span>
          </div>
        </div>
      </div>
    </div>
    <div class="post-content">
      <div class="post-text">
        <span class="post-tag ${postData.type}">${postData.type.charAt(0).toUpperCase() + postData.type.slice(1)}</span>
        ${postData.description.replace(/<[^>]*>/g, "")} — <strong>${postData.location}</strong>
      </div>
      ${imageHTML}
    </div>
    <div class="post-actions">
      <div class="post-action ${postData.liked ? "liked" : ""}" onclick="toggleHeart('${postData.id}', this)">
        <i class="${postData.liked ? "fas" : "far"} fa-heart" ${postData.liked ? 'style="color: #ef4444;"' : ""}></i>
        <span ${postData.liked ? 'style="color: #ef4444;"' : ""}>Heart</span>
      </div>
      <div class="post-action" onclick="toggleComments('${postData.id}', this)">
        <i class="far fa-comment"></i>
        <span>COMMENT${commentCount > 0 ? ` (${commentCount})` : ""}</span>
      </div>
      <div class="post-action" onclick="sharePost('${postData.id}')">
        <i class="fas fa-share"></i>
        <span>SHARE</span>
      </div>
    </div>
    <div class="post-comments">
      <div class="comments-list" style="display: none;">
        ${commentsHTML}
      </div>
      <div class="comment-input">
        <div class="comment-input-avatar">
          ${currentUserAvatarHTML}
        </div>
        <input type="text" class="comment-text" placeholder="Write your comment..." onkeypress="handleCommentKeypress(event, '${postData.id}', this)">
        <button class="send-comment" onclick="handleCommentSubmit('${postData.id}', this)">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `

  return postElement
}

// ===================== Image Handling =====================
window.handleImageLoad = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`);
  if (container) {
    container.classList.remove("loading");
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    if (aspectRatio > 2) container.classList.add("wide-image");
    else if (aspectRatio < 0.75) container.classList.add("tall-image");
    container.addEventListener("click", () => openImageViewer(img.src));
    container.style.cursor = "pointer";
  }
};
window.handleImageError = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`);
  if (container) {
    container.classList.remove("loading");
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <i class="fas fa-image" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Image could not be loaded</p>
      </div>
    `;
  }
};
function openImageViewer(imageUrl) {
  let imageViewerModal = document.getElementById("image-viewer-modal");
  if (!imageViewerModal) {
    imageViewerModal = document.createElement("div");
    imageViewerModal.id = "image-viewer-modal";
    imageViewerModal.className = "modal";
    imageViewerModal.innerHTML = `
      <div class="modal-content image-view-modal-content">
        <div class="modal-header">
          <button class="close-modal" id="close-image-viewer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="image-view-body">
          <img id="full-size-image" src="/placeholder.svg" alt="Full size image">
        </div>
      </div>
    `;
    document.body.appendChild(imageViewerModal);
    document.getElementById("close-image-viewer").addEventListener("click", closeImageViewer);
    imageViewerModal.addEventListener("click", (e) => {
      if (e.target === imageViewerModal) closeImageViewer();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && imageViewerModal.classList.contains("active")) closeImageViewer();
    });
  }
  const fullSizeImage = document.getElementById("full-size-image");
  fullSizeImage.src = imageUrl;
  imageViewerModal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeImageViewer() {
  const imageViewerModal = document.getElementById("image-viewer-modal");
  if (imageViewerModal) {
    imageViewerModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}


function displayPosts(posts) {
  feed.innerHTML = "";
  if (posts.length === 0) {
    emptyState.style.display = "block";
    feed.appendChild(emptyState);
  } else {
    emptyState.style.display = "none";
    posts.forEach((post, index) => {
      const postElement = createPostElement(post, index);
      feed.appendChild(postElement);
    });
  }
}
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      post.description.toLowerCase().includes(searchTerm) || post.location.toLowerCase().includes(searchTerm);
    const matchesType = currentFilters.types.length === 0 || currentFilters.types.includes(post.type);
    const matchesLocation = currentFilters.locations.length === 0 || currentFilters.locations.includes(post.location);
    return matchesSearch && matchesType && matchesLocation;
  });
  displayPosts(filteredPosts);
}

// ===================== Post Actions =====================
function toggleHeart(postId, element) {
  const post = allPosts.find((p) => p.id === postId);
  if (!post) return;
  const icon = element.querySelector("i");
  const span = element.querySelector("span");
  if (!post.liked) {
    post.liked = true;
    post.likeCount = (post.likeCount || 0) + 1;
    icon.classList.remove("far");
    icon.classList.add("fas");
    icon.style.color = "#ef4444";
    span.style.color = "#ef4444";
    element.classList.add("liked");
    addNotification("liked", "Post Liked!", "You liked this post");
  } else {
    post.liked = false;
    post.likeCount = Math.max((post.likeCount || 1) - 1, 0);
    icon.classList.remove("fas");
    icon.classList.add("far");
    icon.style.color = "";
    span.style.color = "";
    element.classList.remove("liked");
  }
  savePostsToStorage();
  syncLikeStateAcrossPages(postId, post.liked, post.likeCount);
}
function syncLikeStateAcrossPages(postId, liked, likeCount) {
  const likeEvent = new CustomEvent("likeStateChanged", {
    detail: { postId, liked, likeCount },
  });
  window.dispatchEvent(likeEvent);
  localStorage.setItem(
    "lastLikeUpdate",
    JSON.stringify({ postId, liked, likeCount, timestamp: Date.now() }),
  );
}
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return;
  const post = allPosts.find((p) => p.id === postId);
  if (!post) return;
  if (!post.comments) post.comments = [];
  const currentUser = getCurrentUser();
  const newComment = {
    id: Date.now().toString(),
    text: commentText.trim(),
    author: currentUser.name,
    authorHandle: currentUser.username,
    authorInitials: currentUser.initials,
    avatar: currentUser.avatar,
    avatarId: currentUser.avatarId,
    avatarEmoji: currentUser.avatarEmoji,
    timestamp: new Date(),
  };
  post.comments.push(newComment);
  savePostsToStorage();
  commentInput.value = "";
  addNotification("comment", "Comment Added!", "You commented on this post");
  filterPosts();
}
function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault();
    submitComment(postId, input.value, input);
  }
}
function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling;
  submitComment(postId, input.value, input);
}
function sharePost(postId) {
  const post = allPosts.find((p) => p.id === postId);
  if (!post) return;
  const shareText = `Check out this ${post.type} item: ${post.description} - ${post.location}`;
  if (navigator.share) {
    navigator
      .share({
        title: `iFind - ${post.type.charAt(0).toUpperCase() + post.type.slice(1)} Item`,
        text: shareText,
        url: window.location.href,
      })
      .then(() => addNotification("share", "Post Shared!", "You shared this post"))
      .catch((err) => {
        console.log("Error sharing:", err);
        fallbackShare(shareText);
      });
  } else {
    fallbackShare(shareText);
  }
}
function fallbackShare(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      addNotification("share", "Link Copied!", "Post link copied to clipboard");
      const shareMsg = document.createElement("div");
      shareMsg.textContent = "Link copied to clipboard!";
      shareMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #059669;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 500;
      `;
      document.body.appendChild(shareMsg);
      setTimeout(() => {
        document.body.removeChild(shareMsg);
      }, 2000);
    })
    .catch((err) => {
      console.log("Could not copy text: ", err);
      addNotification("share", "Share Failed", "Could not copy link to clipboard");
    });
}
function toggleComments(postId, element) {
  const post = document.querySelector(`[data-post-id="${postId}"]`);
  if (!post) return;
  const commentsList = post.querySelector(".comments-list");
  const commentInput = post.querySelector(".comment-input .comment-text");
  if (commentsList) {
    const isHidden = commentsList.style.display === "none";
    commentsList.style.display = isHidden ? "block" : "none";
    if (isHidden) {
      element.classList.add("active");
      setTimeout(() => {
        if (commentInput) commentInput.focus();
      }, 100);
    } else {
      element.classList.remove("active");
    }
  }
}
function deletePost(postId) {
  currentDeletePostId = postId;
  deleteModal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function markAsClaimed(postId) {
  const post = allPosts.find((p) => p.id === postId);
  if (post) {
    post.type = "claimed";
    savePostsToStorage();
    filterPosts();
    addNotification("claimed", "Item Claimed!", "Your item has been marked as claimed");
  }
}
function editPost(postId) {
  currentEditPostId = postId;
  const post = allPosts.find((p) => p.id === postId);
  if (!post) return;
  document.getElementById("edit-type").value = post.type;
  document.getElementById("edit-location").value = post.location;
  document.getElementById("edit-description").value = post.description;
  if (post.image) {
    currentImage.innerHTML = `<img src="${post.image}" alt="Current image" style="width: 100%; height: 100%; object-fit: contain;">`;
    currentImage.style.display = "block";
  } else {
    currentImage.style.display = "none";
  }
  editModal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown");
  const isVisible = dropdown.style.display === "block";
  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none";
  });
  dropdown.style.display = isVisible ? "none" : "block";
}

// ===================== Notifications =====================
function addNotification(type, title, message) {
  const notificationList = document.getElementById("notification-list");
  const newNotification = document.createElement("div");
  newNotification.className = "notification-item unread";
  let iconClass = "fas fa-info-circle";
  let iconColor = "#1e3a8a";
  switch (type) {
    case "claimed": iconClass = "fas fa-check-circle"; iconColor = "#059669"; break;
    case "found": iconClass = "fas fa-search"; iconColor = "#1e3a8a"; break;
    case "liked": iconClass = "fas fa-heart"; iconColor = "#ef4444"; break;
    case "comment": iconClass = "fas fa-comment"; iconColor = "#1e3a8a"; break;
    case "share": iconClass = "fas fa-share"; iconColor = "#0891b2"; break;
    case "edit": iconClass = "fas fa-edit"; iconColor = "#f59e0b"; break;
    case "delete": iconClass = "fas fa-trash"; iconColor = "#ef4444"; break;
  }
  newNotification.innerHTML = `
    <div class="notification-icon-small">
      <i class="${iconClass}" style="color: ${iconColor};"></i>
    </div>
    <div class="notification-content">
      <p><strong>${title}</strong></p>
      <p>${message}</p>
      <span class="notification-time">Just now</span>
    </div>
  `;
  notificationList.insertBefore(newNotification, notificationList.firstChild);
  unreadNotifications++;
  updateNotificationBadge();
}
function updateNotificationBadge() {
  if (unreadNotifications > 0) {
    notificationCount.textContent = unreadNotifications;
    notificationCount.style.display = "flex";
  } else {
    notificationCount.style.display = "none";
  }
}


function closePostModal() {
  postModal.classList.remove("active");
  document.body.style.overflow = "auto";
  postForm.reset();
  fileName.textContent = "";
  imagePreview.style.display = "none";
  imagePreview.innerHTML = "";
  const modalContent = postModal.querySelector(".modal-content");
  modalContent.classList.remove("bounce-in-top");
}
function closeEditModalFunc() {
  editModal.classList.remove("active");
  document.body.style.overflow = "auto";
  editForm.reset();
  editFileName.textContent = "";
  editImagePreview.style.display = "none";
  editImagePreview.innerHTML = "";
  currentImage.style.display = "none";
  currentEditPostId = null;
}
function closeFilterModalFunc() {
  filterModal.classList.remove("active");
  document.body.style.overflow = "auto";
}
function closeDeleteModal() {
  deleteModal.classList.remove("active");
  document.body.style.overflow = "auto";
  currentDeletePostId = null;
}



// Add Post Modal
addPostBtn.addEventListener("click", () => {
  postModal.classList.add("active");
  document.body.style.overflow = "hidden";
  const modalContent = postModal.querySelector(".modal-content");
  modalContent.classList.add("bounce-in-top");
});
closeModal.addEventListener("click", closePostModal);
cancelPost.addEventListener("click", closePostModal);

// Edit Post Modal
closeEditModal.addEventListener("click", closeEditModalFunc);
cancelEdit.addEventListener("click", closeEditModalFunc);

// Delete Modal
deleteOkBtn.addEventListener("click", () => {
  if (currentDeletePostId) {
    allPosts = allPosts.filter((post) => post.id !== currentDeletePostId);
    savePostsToStorage();
    filterPosts();
    addNotification("delete", "Post Deleted!", "Your post has been deleted successfully");
  }
  closeDeleteModal();
});
deleteCancelBtn.addEventListener("click", closeDeleteModal);
deleteXBtn.addEventListener("click", closeDeleteModal);

// Filter Modal
filterBtn.addEventListener("click", () => {
  filterModal.classList.add("active");
  document.body.style.overflow = "hidden";
});
closeFilterModal.addEventListener("click", closeFilterModalFunc);

// Modal click outside handlers
postModal.addEventListener("click", (e) => e.target === postModal && closePostModal());
editModal.addEventListener("click", (e) => e.target === editModal && closeEditModalFunc());
filterModal.addEventListener("click", (e) => e.target === filterModal && closeFilterModalFunc());
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

// Image upload handlers
postImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      fileName.textContent = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      e.target.value = "";
      fileName.textContent = "";
      return;
    }
    fileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: auto; max-height: 300px; object-fit: contain; border-radius: 8px;">`;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    fileName.textContent = "";
    imagePreview.style.display = "none";
  }
});
editImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      editFileName.textContent = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      e.target.value = "";
      editFileName.textContent = "";
      return;
    }
    editFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      editImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: auto; max-height: 300px; object-fit: contain; border-radius: 8px;">`;
      editImagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    editFileName.textContent = "";
    editImagePreview.style.display = "none";
  }
});

// Form submissions
postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById("post-type").value;
  const location = document.getElementById("post-location").value;
  const description = document.getElementById("post-description").value.trim();
  const imageFile = postImage.files[0];
  if (!type || !location || !description) {
    alert("Please fill in all required fields.");
    return;
  }
  const currentUser = getCurrentUser();
  const newPost = {
    id: Date.now().toString(),
    type: type,
    location: location,
    description: cleanPostDescription(description),
    userName: currentUser.name,
    userHandle: currentUser.username,
    userRole: currentUser.role,
    userInitials: currentUser.initials,
    avatar: currentUser.avatar,
    avatarId: currentUser.avatarId,
    avatarEmoji: currentUser.avatarEmoji,
    userId: "current_user",
    timestamp: new Date(),
    liked: false,
    likeCount: 0,
    comments: [],
    image: null,
  };
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newPost.image = e.target.result;
      allPosts.unshift(newPost);
      savePostsToStorage();
      filterPosts();
      setTimeout(() => {
        const newPostElement = document.querySelector(`[data-post-id="${newPost.id}"]`);
        if (newPostElement) newPostElement.classList.add("tilt-in-top-1");
      }, 50);
      closePostModal();
      addNotification("found", "Post Created!", "Your post has been created successfully");
    };
    reader.readAsDataURL(imageFile);
  } else {
    allPosts.unshift(newPost);
    savePostsToStorage();
    filterPosts();
    setTimeout(() => {
      const newPostElement = document.querySelector(`[data-post-id="${newPost.id}"]`);
      if (newPostElement) newPostElement.classList.add("tilt-in-top-1");
    }, 50);
    closePostModal();
    addNotification("found", "Post Created!", "Your post has been created successfully");
  }
});
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentEditPostId) return;
  const type = document.getElementById("edit-type").value;
  const location = document.getElementById("edit-location").value;
  const description = document.getElementById("edit-description").value.trim();
  const imageFile = editImage.files[0];
  if (!type || !location || !description) {
    alert("Please fill in all required fields.");
    return;
  }
  const postIndex = allPosts.findIndex((p) => p.id === currentEditPostId);
  if (postIndex === -1) return;
  allPosts[postIndex].type = type;
  allPosts[postIndex].location = location;
  allPosts[postIndex].description = description;
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      allPosts[postIndex].image = e.target.result;
      savePostsToStorage();
      filterPosts();
      closeEditModalFunc();
      addNotification("edit", "Post Updated!", "Your post has been updated successfully");
    };
    reader.readAsDataURL(imageFile);
  } else {
    savePostsToStorage();
    filterPosts();
    closeEditModalFunc();
    addNotification("edit", "Post Updated!", "Your post has been updated successfully");
  }
});

// Search and filter functionality
searchInput.addEventListener("input", filterPosts);
clearFiltersBtn.addEventListener("click", () => {
  document.querySelectorAll(".filter-checkbox").forEach((cb) => (cb.checked = false));
  currentFilters.types = [];
  currentFilters.locations = [];
  filterPosts();
});
applyFiltersBtn.addEventListener("click", () => {
  currentFilters.types = Array.from(document.querySelectorAll(".filter-checkbox[data-type]:checked")).map(
    (cb) => cb.dataset.type,
  );
  currentFilters.locations = Array.from(document.querySelectorAll(".filter-checkbox[data-location]:checked")).map(
    (cb) => cb.dataset.location,
  );
  filterPosts();
  closeFilterModalFunc();
});

// Navigation
hamburgerMenu.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("active");
  } else {
    window.location.href = "profile.html";
  }
});
navProfile.addEventListener("click", () => window.location.href = "profile.html");
navAbout.addEventListener("click", () => window.location.href = "about.html");
navClaimed.addEventListener("click", () => window.location.href = "claim.html");
navLogout.addEventListener("click", (e) => {
  e.preventDefault();
  openLogoutModal();
});

// Notification Bell & Announcements
notificationBell.addEventListener("click", (e) => {
  e.stopPropagation();
  notificationDropdown.classList.toggle("active");
  announcementDropdown.classList.remove("active");
});
announcementIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  announcementDropdown.classList.toggle("active");
  notificationDropdown.classList.remove("active");
});
markAllRead.addEventListener("click", () => {
  const unreadItems = document.querySelectorAll(".notification-item.unread");
  unreadItems.forEach((item) => item.classList.remove("unread"));
  unreadNotifications = 0;
  updateNotificationBadge();
});

// Sidebar and Dropdowns
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active");
    }
  }
});
document.addEventListener("click", (e) => {
  if (!notificationBell.contains(e.target)) notificationDropdown.classList.remove("active");
  if (!announcementIcon.contains(e.target)) announcementDropdown.classList.remove("active");
  if (!e.target.closest(".post-options")) {
    document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
      dropdown.style.display = "none";
    });
  }
});

// Like sync
window.addEventListener("likeStateChanged", (e) => {
  const { postId, liked, likeCount } = e.detail;
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (postElement) {
    const heartButton = postElement.querySelector('.post-action[onclick*="toggleHeart"]');
    if (heartButton) {
      const icon = heartButton.querySelector("i");
      const span = heartButton.querySelector("span");
      if (liked) {
        icon.classList.remove("far");
        icon.classList.add("fas");
        icon.style.color = "#ef4444";
        span.style.color = "#ef4444";
        heartButton.classList.add("liked");
      } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
        icon.style.color = "";
        span.style.color = "";
        heartButton.classList.remove("liked");
      }
    }
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === "lastLikeUpdate") {
    const updateData = JSON.parse(e.newValue);
    if (updateData) {
      window.dispatchEvent(
        new CustomEvent("likeStateChanged", { detail: updateData }),
      );
    }
  } else if (e.key === "userPosts") {
    loadPostsFromStorage();
  } else if (e.key === "userProfile" || e.key === "ifindUserData") {
    initializeUserAvatar();
  }
});


function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get("edit") || localStorage.getItem("editPostId");
  if (editPostId) {
    localStorage.removeItem("editPostId");
    setTimeout(() => {
      editPost(editPostId);
    }, 500);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser.completedSetup) {
    window.location.href = "setup.html";
    return;
  }
  initializeUserAvatar();
  loadPostsFromStorage();
  updateNotificationBadge();
  checkEditMode();
});
function cleanPostDescription(description) {
  if (!description) return "";
  let cleaned = description.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/👤|👨‍💼|👩‍💼|👨‍🎓|👩‍🎓|👨‍🏫|👩‍🏫|👨‍💻|👩‍💻|👨‍🔬|👩‍🔬|👨‍🎨|👩‍🎨/g, "");
  return cleaned.trim();
}

// ===================== Delete Comment Modal =====================
function deleteComment(postId, commentId) {
  currentDeleteCommentData = { postId, commentId };
  if (!document.getElementById("delete-comment-modal")) {
    const deleteCommentModalHTML = `
      <div class="modal" id="delete-comment-modal">
        <div class="modal-content delete-modal-content">
          <button class="delete-x-btn" id="delete-comment-x-btn">
            <i class="fas fa-times"></i>
          </button>
          <div class="delete-modal-body">
            <div class="delete-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div class="delete-message">
              <p>Are you sure you want to delete this comment?</p>
            </div>
            <div class="delete-actions">
              <button class="delete-btn delete-cancel-btn" id="delete-comment-cancel-btn">Cancel</button>
              <button class="delete-btn delete-confirm-btn" id="delete-comment-ok-btn">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", deleteCommentModalHTML);
    document.getElementById("delete-comment-ok-btn").addEventListener("click", () => {
      if (currentDeleteCommentData) {
        const post = allPosts.find((p) => p.id === currentDeleteCommentData.postId);
        if (post && post.comments) {
          const commentIndex = post.comments.findIndex((c) => c.id === currentDeleteCommentData.commentId);
          if (commentIndex !== -1) {
            post.comments.splice(commentIndex, 1);
            savePostsToStorage();
            filterPosts();
            addNotification("delete", "Comment Deleted!", "Your comment has been deleted successfully");
          }
        }
      }
      closeDeleteCommentModal();
    });
    document.getElementById("delete-comment-cancel-btn").addEventListener("click", closeDeleteCommentModal);
    document.getElementById("delete-comment-x-btn").addEventListener("click", closeDeleteCommentModal);
    document.getElementById("delete-comment-modal").addEventListener("click", (e) => {
      if (e.target.id === "delete-comment-modal") closeDeleteCommentModal();
    });
  }
  document.getElementById("delete-comment-modal").classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeDeleteCommentModal() {
  document.getElementById("delete-comment-modal").classList.remove("active");
  document.body.style.overflow = "auto";
  currentDeleteCommentData = null;
}
window.deleteComment = deleteComment;