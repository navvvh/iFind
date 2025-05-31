// DOM Elements
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")
const claimedFeed = document.getElementById("claimed-feed")
const emptyState = document.getElementById("empty-state")
const navProfile = document.getElementById("nav-profile")
const navFeed = document.getElementById("nav-feed")
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
let claimedPosts = []

// Notification functionality
let unreadNotifications = 0

// Load posts from localStorage on page load
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("userPosts")
  if (storedPosts) {
    allPosts = JSON.parse(storedPosts)
    // Filter only claimed posts
    claimedPosts = allPosts.filter(post => post.type === "claimed")
    displayClaimedPosts()
  }
}

// Get current user data
function getCurrentUser() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  const user = {
    name:
      userProfile.name || ifindUserData.name || mockUser.username || userData.username || sessionData.username || "You",
    username:
      userProfile.username ||
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
  const currentUser = getCurrentUser()
  const hamburgerProfilePic = hamburgerMenu.querySelector(".profile-pic")

  if (hamburgerProfilePic) {
    if (currentUser.avatar) {
      hamburgerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
    } else if (currentUser.avatarId) {
      const avatarEmojis = [
        "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫",
        "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
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

// Display claimed posts
function displayClaimedPosts() {
  const existingPosts = claimedFeed.querySelectorAll(".post")
  existingPosts.forEach((post) => post.remove())

  if (claimedPosts.length === 0) {
    emptyState.style.display = "block"
  } else {
    emptyState.style.display = "none"
    claimedPosts.forEach((post, index) => {
      const postElement = createPostElement(post, index)
      claimedFeed.appendChild(postElement)
    })
  }
}

// Create post element
function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  // Enhanced avatar display
  let avatarHTML = ""
  if (postData.avatar) {
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    avatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${postData.avatarEmoji}</div>`
  } else if (postData.avatarId) {
    const avatarEmojis = [
      "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫",
      "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
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
  let commentsHTML = ""
  if (postData.comments && postData.comments.length > 0) {
    commentsHTML = `
      <div class="comments-list">
        ${postData.comments
          .map(
            (comment) => `
          <div class="comment">
            <div class="comment-author">
              <strong>${comment.author}</strong>
              <span class="comment-time">${new Date(comment.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  // Get current user for comment input avatar
  const currentUser = getCurrentUser()
  let currentUserAvatarHTML = ""
  if (currentUser.avatar) {
    currentUserAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
  } else if (currentUser.avatarId) {
    const avatarEmojis = [
      "👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫",
      "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎨", "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
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
            ${imageHTML}
        </div>
        <div class="post-actions">
            <div class="post-action ${postData.liked ? "liked" : ""}" onclick="toggleHeart('${postData.id}', this)">
                <i class="${postData.liked ? "fas" : "far"} fa-heart" ${postData.liked ? 'style="color: #dc3545;"' : ""}></i>
                <span ${postData.liked ? 'style="color: #dc3545;"' : ""}>Heart</span>
            </div>
            <div class="post-action">
                <i class="far fa-comment"></i>
                <span>COMMENT</span>
            </div>
            <div class="post-action" onclick="sharePost('${postData.id}')">
                <i class="fas fa-share"></i>
                <span>SHARE</span>
            </div>
        </div>
        <div class="post-comments">
            ${commentsHTML}
            <div class="comment-input">
                <div class="profile-pic">
                    ${currentUserAvatarHTML}
                </div>
                <input type="text" class="comment-text-input" placeholder="Write your comment..." onkeypress="handleCommentKeypress(event, '${postData.id}', this)">
                <button class="send-comment" onclick="handleCommentSubmit('${postData.id}', this)">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `

  return postElement
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

// Heart/Like functionality
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
    addNotification("liked", "Post Liked!", "You liked this claimed post")
  } else {
    post.liked = false
    post.likeCount = Math.max((post.likeCount || 1) - 1, 0)
    icon.classList.remove("fas")
    icon.classList.add("far")
    icon.style.color = ""
    span.style.color = ""
    element.classList.remove("liked")
  }

  localStorage.setItem("userPosts", JSON.stringify(allPosts))
}

// Comment functionality
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  if (!post.comments) post.comments = []

  const currentUser = getCurrentUser()
  const newComment = {
    id: Date.now().toString(),
    text: commentText.trim(),
    author: currentUser.name,
    authorHandle: currentUser.username,
    authorInitials: currentUser.initials,
    timestamp: new Date(),
  }

  post.comments.push(newComment)
  localStorage.setItem("userPosts", JSON.stringify(allPosts))

  commentInput.value = ""
  addNotification("comment", "Comment Added!", "You commented on this claimed post")
  
  // Refresh the display
  loadPostsFromStorage()
}

// Handle comment keypress (Enter to submit)
function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault()
    submitComment(postId, input.value, input)
  }
}

// Handle comment submit button click
function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling
  submitComment(postId, input.value, input)
}

// Share functionality
function sharePost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const shareText = `Check out this claimed item: ${post.description} - ${post.location}`

  if (navigator.share) {
    navigator
      .share({
        title: `iFind - Claimed Item`,
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        addNotification("share", "Post Shared!", "You shared this claimed post")
      })
      .catch((err) => {
        console.log("Error sharing:", err)
        fallbackShare(shareText)
      })
  } else {
    fallbackShare(shareText)
  }
}

// Fallback share function
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

// Post management functions
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this claimed post?")) {
    allPosts = allPosts.filter((post) => post.id !== postId)
    localStorage.setItem("userPosts", JSON.stringify(allPosts))
    loadPostsFromStorage()
    addNotification("delete", "Post Deleted!", "Your claimed post has been deleted successfully")
  }
}

function editPost(postId) {
  // Redirect to main page with edit mode
  localStorage.setItem("editPostId", postId)
  window.location.href = "main.html"
}

// Toggle post options dropdown
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  dropdown.style.display = isVisible ? "none" : "block"
}

// Add new notification function
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

// Update notification badge
function updateNotificationBadge() {
  if (unreadNotifications > 0) {
    notificationCount.textContent = unreadNotifications
    notificationCount.style.display = "flex"
  } else {
    notificationCount.style.display = "none"
  }
}

// Navigation functions
hamburgerMenu.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("active")
  } else {
    window.location.href = "profile.html"
  }
})

navProfile.addEventListener("click", () => {
  window.location.href = "profile.html"
})

navFeed.addEventListener("click", () => {
  window.location.href = "main.html"
})

navAbout.addEventListener("click", () => {
  window.location.href = "about.html"
})

navClaimed.addEventListener("click", () => {
  // Already on claimed page
  loadPostsFromStorage()
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

// Notification Bell functionality
notificationBell.addEventListener("click", (e) => {
  e.stopPropagation()
  notificationDropdown.classList.toggle("active")
  announcementDropdown.classList.remove("active")
})

// Announcement Icon functionality
announcementIcon.addEventListener("click", (e) => {
  e.stopPropagation()
  announcementDropdown.classList.toggle("active")
  notificationDropdown.classList.remove("active")
})

// Mark all notifications as read
markAllRead.addEventListener("click", () => {
  const unreadItems = document.querySelectorAll(".notification-item.unread")
  unreadItems.forEach((item) => {
    item.classList.remove("unread")
  })
  unreadNotifications = 0
  updateNotificationBadge()
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  }
})

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!notificationBell.contains(e.target)) {
    notificationDropdown.classList.remove("active")
  }
  if (!announcementIcon.contains(e.target)) {
    announcementDropdown.classList.remove("active")
  }
  if (!e.target.closest(".post-options")) {
    document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  }
})

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser()
  if (!currentUser.completedSetup) {
    window.location.href = "setup.html"
    return
  }

  initializeUserAvatar()
  loadPostsFromStorage()
  updateNotificationBadge()
})