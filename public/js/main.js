// <<-- SIMULA NG BUONG CODE -->>

// DOM Elements
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")
const addPostBtn = document.getElementById("add-post-btn")
const postModal = document.getElementById("post-modal")
const filterModal = document.getElementById("filter-modal")
const closeModal = document.getElementById("close-modal")
const closeFilterModal = document.getElementById("close-filter-modal")
const cancelPost = document.getElementById("cancel-post")
const postForm = document.getElementById("post-form")
const feed = document.getElementById("feed")
const emptyState = document.getElementById("empty-state")
const fileInput = document.getElementById("post-image")
const fileName = document.getElementById("file-name")
const filterBtn = document.getElementById("filter-btn")
const searchInput = document.getElementById("search-input")
const clearFiltersBtn = document.getElementById("clear-filters")
const applyFiltersBtn = document.getElementById("apply-filters")
const navProfile = document.getElementById("nav-profile")
const navAbout = document.getElementById("nav-about")
const navClaimed = document.getElementById("nav-claimed")
const navLogout = document.getElementById("nav-logout")

// Notification and Announcement Elements
const notificationBell = document.getElementById("notification-bell")
const notificationDropdown = document.getElementById("notification-dropdown")
const announcementIcon = document.getElementById("announcement-icon")
const announcementDropdown = document.getElementById("announcement-dropdown")
const markAllRead = document.getElementById("mark-all-read")
const notificationCount = document.getElementById("notification-count")

// Store all posts for filtering
let allPosts = []
const currentFilters = {
  types: [],
  locations: [],
}

// Track if we're editing a post
let editingPostId = null

// Notification functionality - Start with 0 notifications
let unreadNotifications = 0

// Current user data
let currentUser = null

// API URL
const API_URL = "http://localhost:3001/api"

// Load posts from API
async function loadPostsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/posts`)
    const data = await response.json()

    if (data.success) {
      allPosts = data.data.map((post) => ({
        id: post.id.toString(),
        type: post.post_type.toLowerCase(),
        location: post.campus,
        description: post.description,
        image: post.image_path,
        userName: post.user_name || "Unknown User",
        userHandle: `@${post.username || "unknown"}`,
        userRole: post.user_type || "STUDENT",
        userInitials: (post.user_name || "U")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2),
        timestamp: new Date(post.created_at),
        userId: post.user_id.toString(),
        liked: false,
        likeCount: 0,
        comments: [],
        // Add avatar data
        avatar: null,
        avatarId: null,
        avatarEmoji: null,
      }))

      // Load comments for each post
      await loadCommentsForPosts()
      filterPosts()
    } else {
      console.error("Failed to load posts:", data.error)
      // Fallback to localStorage if API fails
      loadPostsFromStorage()
    }
  } catch (error) {
    console.error("Error loading posts from API:", error)
    // Fallback to localStorage if API fails
    loadPostsFromStorage()
  }
}

// Load comments for all posts
async function loadCommentsForPosts() {
  for (const post of allPosts) {
    try {
      const response = await fetch(`${API_URL}/comments/post/${post.id}`)
      const data = await response.json()

      if (data.success) {
        post.comments = data.data.map((comment) => ({
          id: comment.id.toString(),
          text: comment.comment_text,
          author: comment.user_name || "Unknown User",
          authorHandle: `@${comment.username || "unknown"}`,
          authorInitials: (comment.user_name || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2),
          timestamp: new Date(comment.created_at),
          avatar: null,
          avatarId: null,
          avatarEmoji: null,
        }))
      }
    } catch (error) {
      console.error(`Error loading comments for post ${post.id}:`, error)
      post.comments = []
    }
  }
}

// Fallback to localStorage (keep existing function)
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("userPosts")
  if (storedPosts) {
    allPosts = JSON.parse(storedPosts)
    filterPosts()
  }
}

// Save posts to localStorage (for offline support)
function savePostsToStorage() {
  localStorage.setItem("userPosts", JSON.stringify(allPosts))
}

// Get current user from localStorage
function getCurrentUser() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  const user = {
    id: ifindUserData.id || userProfile.id || mockUser.id || 1,
    name:
      userProfile.name || ifindUserData.name || mockUser.username || userData.username || sessionData.username || "You",
    username:
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "user",
    email: userProfile.email || ifindUserData.email || mockUser.email || userData.email || sessionData.email || "",
    role: userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role || "STUDENT",
    avatar: userProfile.avatar || mockUser.avatar || null,
    avatarId: userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId || null,
    avatarEmoji: userProfile.avatarEmoji || ifindUserData.avatar || null,
    contact:
      userProfile.contact ||
      `fb.com/${(userProfile.username || ifindUserData.name?.toLowerCase().replace(/\s+/g, "") || mockUser.username || userData.username || sessionData.username || "user").toLowerCase()}`,
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  }

  user.initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  if (!user.username.startsWith("@")) {
    user.username = "@" + user.username
  }

  return user
}

// Initialize user avatar
function initializeUserAvatar() {
  currentUser = getCurrentUser()
  const hamburgerProfilePic = hamburgerMenu.querySelector(".profile-pic")

  if (hamburgerProfilePic) {
    if (currentUser.avatar) {
      hamburgerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
    } else if (currentUser.avatarId) {
      const avatarEmojis = [
        "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
      ]
      const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
      const emoji = avatarEmojis[avatarIndex] || "👤"
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
    } else {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`
    }
  }
}

// Format timestamp for posts
function formatPostTime(timestamp) {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - postTime) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return postTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: postTime.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

// Filter posts function
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase()
  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      post.description.toLowerCase().includes(searchTerm) || post.location.toLowerCase().includes(searchTerm)
    const matchesType = currentFilters.types.length === 0 || currentFilters.types.includes(post.type)
    const matchesLocation = currentFilters.locations.length === 0 || currentFilters.locations.includes(post.location)

    return matchesSearch && matchesType && matchesLocation
  })

  displayPosts(filteredPosts)
}

// Display posts function
function displayPosts(posts) {
  const postsContainer = document.getElementById("feed")
  const existingPosts = postsContainer.querySelectorAll(".post")
  existingPosts.forEach((post) => post.remove())

  if (posts.length === 0) {
    emptyState.style.display = "block"
  } else {
    emptyState.style.display = "none"
    posts.forEach((post, index) => {
      const postElement = createPostElement(post, index)
      postsContainer.appendChild(postElement)
    })
  }
}

// =================================================================
// ETO ANG FUNCTION NA INAYOS. TAMA NA ITO NGAYON.
// =================================================================
function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  // Enhanced avatar display (PARA LANG SA HEADER)
  let avatarHTML = ""
  if (postData.avatar) {
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    avatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${postData.avatarEmoji}</div>`
  } else if (postData.avatarId) {
    const avatarEmojis = [
      "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(postData.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    avatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
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
  const commentsHTML = postData.comments && postData.comments.length > 0 ? createCommentsHTML(postData.comments) : ""

  // Get current user for comment input avatar
  let currentUserAvatarHTML = ""
  if (currentUser.avatar) {
    currentUserAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
  } else if (currentUser.avatarId) {
    const avatarEmojis = [
      "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
  } else {
    currentUserAvatarHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`
  }

  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-user">
        <div class="profile-pic">
          ${avatarHTML}
        </div>
        <div class="post-user-info">
          <div class="post-user-name">${postData.userName}</div>
          <div class="post-user-meta">${postData.userHandle}<br>${postData.userRole}</div>
          <div class="post-time">${formatPostTime(postData.timestamp)}</div>
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
        ${postData.description} — <strong>${postData.location}</strong>
      </div>
      <!-- ANG FIX AY GINAWA DITO: Inalis ang sobrang 'avatarHTML' sa loob ng post-content -->
      ${imageHTML}
    </div>
    <div class="post-actions">
      <div class="post-action ${postData.liked ? "liked" : ""}" onclick="toggleHeart('${postData.id}', this)">
        <i class="${postData.liked ? "fas" : "far"} fa-heart" ${postData.liked ? 'style="color: #dc3545;"' : ""}></i>
        <span ${postData.liked ? 'style="color: #dc3545;"' : ""}>Heart</span>
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
// =================================================================
// TAPOS NA ANG PAG-AYOS SA FUNCTION
// =================================================================


// Create comments HTML
function createCommentsHTML(comments) {
  if (!comments || comments.length === 0) return ""

  return comments
    .map((comment) => {
      let commentAvatarHTML = ""

      if (comment.avatar) {
        commentAvatarHTML = `<img src="${comment.avatar}" alt="${comment.author}" style="width: 100%; height: 100%; object-fit: cover;">`
      } else if (comment.avatarEmoji && comment.avatarEmoji !== "👤") {
        commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.avatarEmoji}</div>`
      } else {
        commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.authorInitials}</div>`
      }

      return `
      <div class="comment">
        <div class="comment-avatar">
          ${commentAvatarHTML}
        </div>
        <div class="comment-bubble">
          <div class="comment-author">${comment.author}</div>
          <div class="comment-text">${comment.text}</div>
        </div>
      </div>
      <div class="comment-time">${formatPostTime(comment.timestamp)}</div>
    `
    })
    .join("")
}

// Submit comment using API
async function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id: Number.parseInt(postId),
        user_id: currentUser.id,
        comment_text: commentText.trim(),
      }),
    })

    const data = await response.json()

    if (data.success) {
      commentInput.value = ""
      addNotification("comment", "Comment Added!", "You commented on this post")

      // Refresh comments for this post
      await refreshCommentsForPost(postId)
    } else {
      console.error("Failed to add comment:", data.error)
      alert("Failed to add comment: " + data.error)
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    alert("An error occurred while adding your comment.")
  }
}

// Refresh comments for a specific post
async function refreshCommentsForPost(postId) {
  try {
    const response = await fetch(`${API_URL}/comments/post/${postId}`)
    const data = await response.json()

    if (data.success) {
      // Update the post in allPosts array
      const post = allPosts.find((p) => p.id === postId)
      if (post) {
        post.comments = data.data.map((comment) => ({
          id: comment.id.toString(),
          text: comment.comment_text,
          author: comment.user_name || "Unknown User",
          authorHandle: `@${comment.username || "unknown"}`,
          authorInitials: (comment.user_name || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2),
          timestamp: new Date(comment.created_at),
          avatar: null,
          avatarId: null,
          avatarEmoji: null,
        }))

        // Update the UI
        const postElement = document.querySelector(`[data-post-id="${postId}"]`)
        if (postElement) {
          const commentsList = postElement.querySelector(".comments-list")
          const commentButton = postElement.querySelector('.post-action[onclick*="toggleComments"]')
          const commentSpan = commentButton.querySelector("span")

          commentsList.innerHTML = createCommentsHTML(post.comments)
          commentSpan.textContent = `COMMENT${post.comments.length > 0 ? ` (${post.comments.length})` : ""}`
        }
      }
    }
  } catch (error) {
    console.error("Error refreshing comments:", error)
  }
}

// Delete post using API
async function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local array and update UI
        allPosts = allPosts.filter((post) => post.id !== postId)
        filterPosts()
        addNotification("delete", "Post Deleted!", "Your post has been deleted successfully")
      } else {
        console.error("Failed to delete post:", data.error)
        alert("Failed to delete post: " + data.error)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("An error occurred while deleting your post.")
    }
  }
}

// Mark post as claimed using API
async function markAsClaimed(postId) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_type: "claimed",
      }),
    })

    const data = await response.json()

    if (data.success) {
      // Update local array and UI
      const postIndex = allPosts.findIndex((post) => post.id === postId)
      if (postIndex !== -1) {
        allPosts[postIndex].type = "claimed"
        filterPosts()
        addNotification("claimed", "Item Claimed!", "Your item has been marked as claimed")
      }
    } else {
      console.error("Failed to mark as claimed:", data.error)
      alert("Failed to mark as claimed: " + data.error)
    }
  } catch (error) {
    console.error("Error marking as claimed:", error)
    alert("An error occurred while marking the item as claimed.")
  }
}

// Edit post function
function editPost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  editingPostId = postId

  document.getElementById("post-type").value = post.type
  document.getElementById("post-location").value = post.location
  document.getElementById("post-description").value = post.description

  if (post.image) {
    const imagePreview = document.getElementById("image-preview")
    imagePreview.innerHTML = `<img src="${post.image}" alt="Current image" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`
    imagePreview.style.display = "block"
    fileName.textContent = "Current image"
  }

  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Edit Post"
  if (submitButton) submitButton.textContent = "Update Post"

  openPostModal()
}

// Updated form submission with API
postForm.addEventListener("submit", async (event) => {
  event.preventDefault()

  const postType = document.getElementById("post-type").value
  const postLocation = document.getElementById("post-location").value
  const postDescription = document.getElementById("post-description").value
  const postImage = document.getElementById("post-image").files[0]

  // Handle image upload (for now, we'll use a placeholder)
  let imagePath = null
  if (postImage) {
    // TODO: Implement actual image upload to server
    imagePath = "/images/placeholder.jpg"
  }

  if (editingPostId) {
    // Update existing post
    try {
      const response = await fetch(`${API_URL}/posts/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postDescription.substring(0, 50),
          description: postDescription,
          campus: postLocation,
          post_type: postType,
          image_path: imagePath,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadPostsFromAPI()
        closePostModal()
        addNotification("edit", "Post Updated!", "Your post has been updated successfully")
      } else {
        alert("Failed to update post: " + data.error)
      }
    } catch (error) {
      console.error("Error updating post:", error)
      alert("An error occurred while updating your post.")
    }
  } else {
    // Create new post
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          title: postDescription.substring(0, 50),
          description: postDescription,
          campus: postLocation,
          post_type: postType,
          image_path: imagePath,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadPostsFromAPI()
        closePostModal()
        addNotification("found", "Post Created!", `Your ${postType} item post has been created successfully`)
      } else {
        alert("Failed to create post: " + data.error)
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("An error occurred while creating your post.")
    }
  }
})

// Keep all your existing functions for UI interactions
function openPostModal() {
  postModal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closePostModal() {
  postModal.classList.remove("active")
  document.body.style.overflow = "auto"
  postForm.reset()
  fileName.textContent = ""
  editingPostId = null

  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Create New Post"
  if (submitButton) submitButton.textContent = "Post"

  const imagePreview = document.getElementById("image-preview")
  if (imagePreview) {
    imagePreview.style.display = "none"
    imagePreview.innerHTML = ""
  }
}

function toggleComments(postId, element) {
  const postElement = document.querySelector(`[data-post-id="${postId}"]`)
  const commentsList = postElement.querySelector(".comments-list")
  const commentInput = postElement.querySelector(".comment-input .comment-text")

  if (commentsList.style.display === "none" || !commentsList.style.display) {
    commentsList.style.display = "block"
    element.classList.add("active")
    setTimeout(() => commentInput.focus(), 100)
  } else {
    commentsList.style.display = "none"
    element.classList.remove("active")
  }
}

function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault()
    submitComment(postId, input.value, input)
  }
}

function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling
  submitComment(postId, input.value, input)
}

function toggleHeart(postId, element) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const icon = element.querySelector("i")
  const span = element.querySelector("span")

  if (!post.liked) {
    post.liked = true
    post.likeCount = (post.likeCount || 0) + 1
    icon.classList.remove("far")
    icon.classList.add("fas")
    icon.style.color = "#dc3545"
    span.style.color = "#dc3545"
    element.classList.add("liked")
    addNotification("liked", "Post Liked!", "You liked this post")
  } else {
    post.liked = false
    post.likeCount = Math.max((post.likeCount || 1) - 1, 0)
    icon.classList.remove("fas")
    icon.classList.add("far")
    icon.style.color = ""
    span.style.color = ""
    element.classList.remove("liked")
  }

  savePostsToStorage()
}

function sharePost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const shareText = `Check out this ${post.type} item: ${post.description} - ${post.location}`

  if (navigator.share) {
    navigator
      .share({
        title: `iFind - ${post.type} Item`,
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        addNotification("share", "Post Shared!", "You shared this post")
      })
      .catch((err) => {
        console.log("Error sharing:", err)
        fallbackShare(shareText)
      })
  } else {
    fallbackShare(shareText)
  }
}

function fallbackShare(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      addNotification("share", "Link Copied!", "Post link copied to clipboard")
      const shareMsg = document.createElement("div")
      shareMsg.textContent = "Link copied to clipboard!"
      shareMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #28a745;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
    `
      document.body.appendChild(shareMsg)
      setTimeout(() => {
        document.body.removeChild(shareMsg)
      }, 2000)
    })
    .catch((err) => {
      console.log("Could not copy text: ", err)
      addNotification("share", "Share Failed", "Could not copy link to clipboard")
    })
}

function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  dropdown.style.display = isVisible ? "none" : "block"
}

function addNotification(type, title, message) {
  const notificationList = document.getElementById("notification-list")
  const newNotification = document.createElement("div")
  newNotification.className = "notification-item unread"

  let iconClass = "fas fa-info-circle"
  let iconColor = "#007bff"

  switch (type) {
    case "claimed":
      iconClass = "fas fa-check-circle"
      iconColor = "#28a745"
      break
    case "found":
      iconClass = "fas fa-search"
      iconColor = "#007bff"
      break
    case "liked":
      iconClass = "fas fa-heart"
      iconColor = "#dc3545"
      break
    case "comment":
      iconClass = "fas fa-comment"
      iconColor = "#007bff"
      break
    case "share":
      iconClass = "fas fa-share"
      iconColor = "#17a2b8"
      break
    case "edit":
      iconClass = "fas fa-edit"
      iconColor = "#ffc107"
      break
    case "delete":
      iconClass = "fas fa-trash"
      iconColor = "#dc3545"
      break
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
  `

  notificationList.insertBefore(newNotification, notificationList.firstChild)
  unreadNotifications++
  updateNotificationBadge()
}

function updateNotificationBadge() {
  if (unreadNotifications > 0) {
    notificationCount.textContent = unreadNotifications
    notificationCount.style.display = "flex"
  } else {
    notificationCount.style.display = "none"
  }
}

// Global functions for image handling
window.handleImageLoad = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")
    const aspectRatio = img.naturalWidth / img.naturalHeight
    if (aspectRatio > 2) {
      container.classList.add("wide-image")
    } else if (aspectRatio < 0.75) {
      container.classList.add("tall-image")
    }
  }
}

window.handleImageError = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <i class="fas fa-image" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Image could not be loaded</p>
      </div>
    `
  }
}

// Event listeners for UI elements
hamburgerMenu.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("active")
  } else {
    window.location.href = "profile.html"
  }
})

addPostBtn.addEventListener("click", openPostModal)
closeModal.addEventListener("click", closePostModal)
cancelPost.addEventListener("click", closePostModal)

navProfile.addEventListener("click", () => {
  window.location.href = "profile.html"
})

navAbout.addEventListener("click", () => {
  window.location.href = "about.html"
})

navClaimed.addEventListener("click", () => {
  window.location.href = "claim.html"
})

navLogout.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("userProfile")
    localStorage.removeItem("mockUser")
    localStorage.removeItem("userSession")
    localStorage.removeItem("userPosts")
    localStorage.removeItem("ifindUserData")
    window.location.href = "login.html"
  }
})

// Search functionality
searchInput.addEventListener("input", () => {
  filterPosts()
})

// Filter functionality
clearFiltersBtn.addEventListener("click", () => {
  document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
    checkbox.checked = false
  })
})

applyFiltersBtn.addEventListener("click", () => {
  currentFilters.types = []
  document.querySelectorAll(".filter-checkbox[data-type]").forEach((checkbox) => {
    if (checkbox.checked) {
      currentFilters.types.push(checkbox.dataset.type)
    }
  })

  currentFilters.locations = []
  document.querySelectorAll(".filter-checkbox[data-location]").forEach((checkbox) => {
    if (checkbox.checked) {
      currentFilters.locations.push(checkbox.dataset.location)
    }
  })

  filterPosts()
  document.getElementById("filter-modal").classList.remove("active")
  document.body.style.overflow = "auto"
})

// File input handler
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]
  const imagePreview = document.getElementById("image-preview")

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.")
      event.target.value = ""
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.")
      event.target.value = ""
      return
    }

    fileName.textContent = file.name

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`
      imagePreview.style.display = "block"
    }
    reader.readAsDataURL(file)
  } else {
    fileName.textContent = ""
    imagePreview.style.display = "none"
    imagePreview.innerHTML = ""
  }
})

// Notification functionality
notificationBell.addEventListener("click", (e) => {
  e.stopPropagation()
  notificationDropdown.classList.toggle("active")
  announcementDropdown.classList.remove("active")
})

announcementIcon.addEventListener("click", (e) => {
  e.stopPropagation()
  announcementDropdown.classList.toggle("active")
  notificationDropdown.classList.remove("active")
})

markAllRead.addEventListener("click", () => {
  const unreadItems = document.querySelectorAll(".notification-item.unread")
  unreadItems.forEach((item) => {
    item.classList.remove("unread")
  })
  unreadNotifications = 0
  updateNotificationBadge()
})

// Close dropdowns and modals when clicking outside
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  }

  if (!notificationBell.contains(event.target)) {
    notificationDropdown.classList.remove("active")
  }
  if (!announcementIcon.contains(event.target)) {
    announcementDropdown.classList.remove("active")
  }
  if (!event.target.closest(".post-options")) {
    document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  }
})

postModal.addEventListener("click", (event) => {
  if (event.target === postModal) {
    closePostModal()
  }
})

filterModal.addEventListener("click", (event) => {
  if (event.target === filterModal) {
    document.getElementById("filter-modal").classList.remove("active")
    document.body.style.overflow = "auto"
  }
})

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const currentUserData = getCurrentUser()
  if (!currentUserData.completedSetup) {
    window.location.href = "setup.html"
    return
  }

  initializeUserAvatar()
  loadPostsFromAPI() // Use API instead of localStorage
  updateNotificationBadge()
})

// <<-- HANGGANG DITO LANG ANG CODE -->>