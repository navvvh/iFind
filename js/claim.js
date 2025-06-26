
const state = {
  allPosts: [],
  claimedPosts: [],
  unreadNotifications: 0,
  currentDeletePostId: null,
  currentDeleteCommentData: null,
}



// Main UI Elements
const elements = {
  hamburgerMenu: document.getElementById("hamburger-menu"),
  sidebar: document.getElementById("sidebar"),
  claimedFeed: document.getElementById("claimed-feed"),
  emptyState: document.getElementById("empty-state"),

  // Navigation Elements
  navProfile: document.getElementById("nav-profile"),
  navFeed: document.getElementById("nav-feed"),
  navAbout: document.getElementById("nav-about"),
  navClaimed: document.getElementById("nav-claimed"),
  navLogout: document.getElementById("nav-logout"),

  // Notification Elements
  notificationBell: document.getElementById("notification-bell"),
  notificationDropdown: document.getElementById("notification-dropdown"),
  announcementIcon: document.getElementById("announcement-icon"),
  announcementDropdown: document.getElementById("announcement-dropdown"),
  markAllRead: document.getElementById("mark-all-read"),
  notificationCount: document.getElementById("notification-count"),
}



/**
 * Get current user data from various localStorage sources
 * @returns {Object} User data object
 */
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
      `fb.com/${(
        userProfile.username ||
          ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
          mockUser.username ||
          userData.username ||
          sessionData.username ||
          "user"
      ).toLowerCase()}`,
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  }

  // Generate user initials
  user.initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  // Ensure username has @ prefix
  if (!user.username.startsWith("@")) {
    user.username = "@" + user.username
  }

  return user
}


function initializeUserAvatar() {
  const currentUser = getCurrentUser()
  const hamburgerProfilePic = elements.hamburgerMenu?.querySelector(".profile-pic")

  if (hamburgerProfilePic) {
    if (currentUser.avatar) {
      hamburgerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
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
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
    } else {
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`
    }
  }
}



function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("userPosts")
  if (storedPosts) {
    state.allPosts = JSON.parse(storedPosts)
    // Filter only claimed posts
    state.claimedPosts = state.allPosts.filter((post) => post.type === "claimed")
    displayClaimedPosts()
  }
}

/**
 * Format timestamp for posts
 * @param {Date|string} timestamp - Post timestamp
 * @returns {string} Formatted time string
 */
function formatPostTime(timestamp) {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - postTime) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays}d ago`

  return postTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: postTime.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Display claimed posts in the feed
 */
function displayClaimedPosts() {
  if (!elements.claimedFeed) return

  const existingPosts = elements.claimedFeed.querySelectorAll(".post")
  existingPosts.forEach((post) => post.remove())

  if (state.claimedPosts.length === 0) {
    if (elements.emptyState) elements.emptyState.style.display = "block"
  } else {
    if (elements.emptyState) elements.emptyState.style.display = "none"
    state.claimedPosts.forEach((post, index) => {
      const postElement = createPostElement(post, index)
      elements.claimedFeed.appendChild(postElement)
    })
  }
}

/**
 * Create avatar HTML based on user data
 * @param {Object} userData - User data object
 * @param {string} [size="normal"] - Avatar size (normal or small)
 * @returns {string} Avatar HTML
 */
function createAvatarHTML(userData, size = "normal") {
  const fontSize = size === "small" ? "12px" : "16px"

  if (userData.avatar) {
    return `<img src="${userData.avatar}" alt="${userData.name || userData.author}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (userData.avatarEmoji && userData.avatarEmoji !== "👤") {
    return `<div class="default-avatar" style="font-size: ${fontSize};">${userData.avatarEmoji}</div>`
  } else if (userData.avatarId) {
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
    const avatarIndex = Number.parseInt(userData.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    return `<div class="default-avatar" style="font-size: ${fontSize};">${emoji}</div>`
  } else {
    const initials =
      userData.userInitials ||
      userData.authorInitials ||
      (userData.name || userData.author)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    return `<div class="default-avatar" style="font-size: ${fontSize};">${initials}</div>`
  }
}

/**
 * Create post element
 * @param {Object} postData - Post data
 * @param {number} index - Post index
 * @returns {HTMLElement} Post element
 */
function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  // Create avatar HTML
  const avatarHTML = createAvatarHTML(postData)

  // Create image HTML if post has an image
  let imageHTML = ""
  if (postData.image) {
    imageHTML = `
      <div class="post-image-container loading" id="claim-image-container-${postData.id}" onclick="openImageViewModal('${postData.image}')">
        <img src="${postData.image}" 
             alt="${postData.type} item" 
             class="post-image"
             onload="handleClaimImageLoad(this, '${postData.id}')"
             onerror="handleClaimImageError(this, '${postData.id}')">
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

            // Check if comment is from current user
            if (comment.authorHandle === currentUser.username || comment.author === currentUser.name) {
              commentAvatarHTML = createAvatarHTML(currentUser, "small")
            } else {
              commentAvatarHTML = createAvatarHTML(comment, "small")
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
  const currentUserAvatarHTML = createAvatarHTML(currentUser, "small")

  // Create post HTML
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
        <i class="${postData.liked ? "fas" : "far"} fa-heart" ${postData.liked ? 'style="color: #dc2626;"' : ""}></i>
        <span ${postData.liked ? 'style="color: #dc2626;"' : ""}>HEART</span>
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

/**
 * Update existing comments with new user avatar data
 * @param {Object} newUserData - Updated user data
 */
function updateExistingCommentsAvatar(newUserData) {
  let postsUpdated = false

  state.allPosts.forEach((post) => {
    if (post.comments && post.comments.length > 0) {
      post.comments.forEach((comment) => {
        // Update comments made by the current user
        if (comment.authorHandle === newUserData.username || comment.author === newUserData.name) {
          comment.author = newUserData.name
          comment.authorHandle = newUserData.username
          comment.authorInitials = newUserData.initials
          comment.avatar = newUserData.avatar
          comment.avatarId = newUserData.avatarId
          comment.avatarEmoji = newUserData.avatarEmoji
          postsUpdated = true
        }
      })
    }
  })

  if (postsUpdated) {
    localStorage.setItem("userPosts", JSON.stringify(state.allPosts))
    loadPostsFromStorage() // Refresh display
  }
}



/**
 * Handle image load event
 * @param {HTMLImageElement} img - Image element
 * @param {string} postId - Post ID
 */
window.handleClaimImageLoad = (img, postId) => {
  const container = document.getElementById(`claim-image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")

    // Apply appropriate class based on image dimensions
    const aspectRatio = img.naturalWidth / img.naturalHeight
    if (aspectRatio > 2) {
      container.classList.add("wide-image")
    } else if (aspectRatio < 0.75) {
      container.classList.add("tall-image")
    }
  }
}

/**
 * Handle image error event
 * @param {HTMLImageElement} img - Image element
 * @param {string} postId - Post ID
 */
window.handleClaimImageError = (img, postId) => {
  const container = document.getElementById(`claim-image-container-${postId}`)
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

/**
 * Open image view modal
 * @param {string} imageUrl - Image URL
 */
function openImageViewModal(imageUrl) {
  // Create modal if it doesn't exist
  if (!document.getElementById("image-view-modal")) {
    const modalHTML = `
      <div class="modal" id="image-view-modal">
        <div class="modal-content image-view-modal-content">
          <div class="modal-header">
            <h3 class="modal-title"></h3>
            <button class="close-modal" id="close-image-view-modal">&times;</button>
          </div>
          <div class="modal-body image-view-body" id="image-view-body">
            <img id="image-view-img" src="/placeholder.svg" alt="Full size image">
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", modalHTML)

    // Add event listener for close button
    document.getElementById("close-image-view-modal").addEventListener("click", () => {
      document.getElementById("image-view-modal").classList.remove("active")
      document.body.style.overflow = "auto"
    })

    // Close modal when clicking outside content
    document.getElementById("image-view-modal").addEventListener("click", (e) => {
      if (e.target.id === "image-view-modal") {
        document.getElementById("image-view-modal").classList.remove("active")
        document.body.style.overflow = "auto"
      }
    })
  }

  // Set image source and show modal
  document.getElementById("image-view-img").src = imageUrl
  document.getElementById("image-view-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}

// Make function available globally
window.openImageViewModal = openImageViewModal

/**
 * Inject CSS for image handling
 */
function injectImageHandlingCSS() {
  // Check if style element already exists
  let styleElement = document.getElementById("claim-image-fixes")

  // If it doesn't exist, create it
  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = "claim-image-fixes"
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = `
    .post-image-container {
      width: 100%;
      max-height: 400px;
      overflow: hidden;
      border-radius: 12px;
      background-color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-top: 16px;
      cursor: pointer;
      border: 2px solid var(--border-color, #e2e8f0);
    }
    
    .post-image {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: cover;
      transition: transform 0.2s ease;
      border-radius: 10px;
    }
    
    .post-image-container:hover .post-image {
      transform: scale(1.02);
    }
    
    .post-image-container.loading {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      min-height: 200px;
    }
    
    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .post-image-container.wide-image {
      max-height: 300px;
    }

    .post-image-container.tall-image {
      max-height: 500px;
    }

    .image-view-modal-content {
      width: auto;
      max-width: 95vw;
      max-height: 95vh;
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
    }

    .image-view-body img {
      max-width: 55vw;
      max-height: 55vh;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
  `
}


/**
 * Toggle heart/like on a post
 * @param {string} postId - Post ID
 * @param {HTMLElement} element - Heart button element
 */
function toggleHeart(postId, element) {
  const post = state.allPosts.find((p) => p.id === postId)
  if (!post) return

  const icon = element.querySelector("i")
  const span = element.querySelector("span")

  if (!post.liked) {
    post.liked = true
    post.likeCount = (post.likeCount || 0) + 1
    icon.classList.remove("far")
    icon.classList.add("fas")
    icon.style.color = "#dc2626"
    span.style.color = "#dc2626"
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

  localStorage.setItem("userPosts", JSON.stringify(state.allPosts))
  syncLikeStateAcrossPages(postId, post.liked, post.likeCount)
}

/**
 * Sync like state across pages
 * @param {string} postId - Post ID
 * @param {boolean} liked - Liked state
 * @param {number} likeCount - Like count
 */
function syncLikeStateAcrossPages(postId, liked, likeCount) {
  const likeEvent = new CustomEvent("likeStateChanged", {
    detail: { postId, liked, likeCount },
  })
  window.dispatchEvent(likeEvent)

  localStorage.setItem(
    "lastLikeUpdate",
    JSON.stringify({
      postId,
      liked,
      likeCount,
      timestamp: Date.now(),
    }),
  )
}

/**
 * Toggle comments visibility
 * @param {string} postId - Post ID
 * @param {HTMLElement} element - Comment button element
 */
function toggleComments(postId, element) {
  const post = document.querySelector(`[data-post-id="${postId}"]`)
  if (!post) return

  const commentsList = post.querySelector(".comments-list")
  const commentInput = post.querySelector(".comment-input .comment-text")

  if (commentsList) {
    const isHidden = commentsList.style.display === "none"
    commentsList.style.display = isHidden ? "block" : "none"

    if (isHidden) {
      element.classList.add("active")
      setTimeout(() => {
        if (commentInput) commentInput.focus()
      }, 100)
    } else {
      element.classList.remove("active")
    }
  }
}

/**
 * Submit a comment on a post
 * @param {string} postId - Post ID
 * @param {string} commentText - Comment text
 * @param {HTMLInputElement} commentInput - Comment input element
 */
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  const post = state.allPosts.find((p) => p.id === postId)
  if (!post) return

  if (!post.comments) post.comments = []

  const currentUser = getCurrentUser()
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
  }

  post.comments.push(newComment)
  localStorage.setItem("userPosts", JSON.stringify(state.allPosts))

  commentInput.value = ""
  addNotification("comment", "Comment Added!", "You commented on this claimed post")

  // Refresh the display to update comment count
  loadPostsFromStorage()
}

/**
 * Handle comment keypress (Enter to submit)
 * @param {KeyboardEvent} event - Keypress event
 * @param {string} postId - Post ID
 * @param {HTMLInputElement} input - Input element
 */
function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault()
    submitComment(postId, input.value, input)
  }
}

/**
 * Handle comment submit button click
 * @param {string} postId - Post ID
 * @param {HTMLButtonElement} button - Submit button
 */
function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling
  submitComment(postId, input.value, input)
}

/**
 * Share a post
 * @param {string} postId - Post ID
 */
function sharePost(postId) {
  const post = state.allPosts.find((p) => p.id === postId)
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

/**
 * Fallback share function (copy to clipboard)
 * @param {string} text - Text to share
 */
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
        background: #059669;
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

/**
 * Toggle post options dropdown
 * @param {HTMLElement} element - Options element
 */
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  dropdown.style.display = isVisible ? "none" : "block"
}

// Make functions available globally
window.toggleHeart = toggleHeart
window.toggleComments = toggleComments
window.handleCommentKeypress = handleCommentKeypress
window.handleCommentSubmit = handleCommentSubmit
window.sharePost = sharePost
window.togglePostOptions = togglePostOptions


/**
 * Delete a post
 * @param {string} postId - Post ID
 */
function deletePost(postId) {
  state.currentDeletePostId = postId

  // Create delete post modal if it doesn't exist
  if (!document.getElementById("delete-post-modal")) {
    const deletePostModalHTML = `
      <div class="modal" id="delete-post-modal">
        <div class="modal-content delete-modal-content">
          <button class="delete-x-btn" id="delete-post-x-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-modal-body">
            <div class="delete-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            
            <div class="delete-message">
              <p>Are you sure you want to delete this post?</p>
            </div>
            
            <div class="delete-actions">
              <button class="delete-btn delete-cancel-btn" id="delete-post-cancel-btn">
                Cancel
              </button>
              <button class="delete-btn delete-confirm-btn" id="delete-post-ok-btn">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", deletePostModalHTML)

    // Add event listeners for delete post modal
    document.getElementById("delete-post-ok-btn").addEventListener("click", () => {
      if (state.currentDeletePostId) {
        state.allPosts = state.allPosts.filter((post) => post.id !== state.currentDeletePostId)
        localStorage.setItem("userPosts", JSON.stringify(state.allPosts))
        loadPostsFromStorage()
        addNotification("delete", "Post Deleted!", "Your claimed post has been deleted successfully")
      }
      closeDeletePostModal()
    })

    document.getElementById("delete-post-cancel-btn").addEventListener("click", closeDeletePostModal)
    document.getElementById("delete-post-x-btn").addEventListener("click", closeDeletePostModal)

    document.getElementById("delete-post-modal").addEventListener("click", (e) => {
      if (e.target.id === "delete-post-modal") closeDeletePostModal()
    })
  }

  document.getElementById("delete-post-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}


function closeDeletePostModal() {
  document.getElementById("delete-post-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  state.currentDeletePostId = null
}

/**
 * Delete a comment
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 */
function deleteComment(postId, commentId) {
  state.currentDeleteCommentData = { postId, commentId }

  // Create delete comment modal if it doesn't exist
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
              <button class="delete-btn delete-cancel-btn" id="delete-comment-cancel-btn">
                Cancel
              </button>
              <button class="delete-btn delete-confirm-btn" id="delete-comment-ok-btn">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", deleteCommentModalHTML)

    // Add event listeners for delete comment modal
    document.getElementById("delete-comment-ok-btn").addEventListener("click", () => {
      if (state.currentDeleteCommentData) {
        const post = state.allPosts.find((p) => p.id === state.currentDeleteCommentData.postId)
        if (post && post.comments) {
          const commentIndex = post.comments.findIndex((c) => c.id === state.currentDeleteCommentData.commentId)
          if (commentIndex !== -1) {
            post.comments.splice(commentIndex, 1)
            localStorage.setItem("userPosts", JSON.stringify(state.allPosts))
            loadPostsFromStorage()
            addNotification("delete", "Comment Deleted!", "Your comment has been deleted successfully")
          }
        }
      }
      closeDeleteCommentModal()
    })

    document.getElementById("delete-comment-cancel-btn").addEventListener("click", closeDeleteCommentModal)
    document.getElementById("delete-comment-x-btn").addEventListener("click", closeDeleteCommentModal)

    document.getElementById("delete-comment-modal").addEventListener("click", (e) => {
      if (e.target.id === "delete-comment-modal") closeDeleteCommentModal()
    })
  }

  document.getElementById("delete-comment-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}

/**
 * Close delete comment modal
 */
function closeDeleteCommentModal() {
  document.getElementById("delete-comment-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  state.currentDeleteCommentData = null
}

/**
 * Edit a post
 * @param {string} postId - Post ID
 */
function editPost(postId) {
  // Redirect to main page with edit mode
  localStorage.setItem("editPostId", postId)
  window.location.href = "main.html"
}

// Make functions available globally
window.deletePost = deletePost
window.deleteComment = deleteComment
window.editPost = editPost



/**
 * Add a new notification
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function addNotification(type, title, message) {
  const notificationList = document.getElementById("notification-list")
  if (!notificationList) return

  const newNotification = document.createElement("div")
  newNotification.className = "notification-item unread"

  let iconClass = "fas fa-info-circle"
  let iconColor = "#1e3a8a"

  switch (type) {
    case "claimed":
      iconClass = "fas fa-check-circle"
      iconColor = "#059669"
      break
    case "found":
      iconClass = "fas fa-search"
      iconColor = "#1e3a8a"
      break
    case "liked":
      iconClass = "fas fa-heart"
      iconColor = "#dc2626"
      break
    case "comment":
      iconClass = "fas fa-comment"
      iconColor = "#1e3a8a"
      break
    case "share":
      iconClass = "fas fa-share"
      iconColor = "#0891b2"
      break
    case "edit":
      iconClass = "fas fa-edit"
      iconColor = "#f59e0b"
      break
    case "delete":
      iconClass = "fas fa-trash"
      iconColor = "#dc2626"
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
  state.unreadNotifications++
  updateNotificationBadge()
}

/**
 * Update notification badge
 */
function updateNotificationBadge() {
  if (elements.notificationCount) {
    if (state.unreadNotifications > 0) {
      elements.notificationCount.textContent = state.unreadNotifications
      elements.notificationCount.style.display = "flex"
    } else {
      elements.notificationCount.style.display = "none"
    }
  }
}


function setupNavigationListeners() {
  if (elements.hamburgerMenu) {
    elements.hamburgerMenu.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        elements.sidebar.classList.toggle("active")
      } else {
        window.location.href = "profile.html"
      }
    })
  }

  if (elements.navProfile) {
    elements.navProfile.addEventListener("click", () => {
      window.location.href = "profile.html"
    })
  }

  if (elements.navFeed) {
    elements.navFeed.addEventListener("click", () => {
      window.location.href = "main.html"
    })
  }

  if (elements.navAbout) {
    elements.navAbout.addEventListener("click", () => {
      window.location.href = "about.html"
    })
  }

  if (elements.navClaimed) {
    elements.navClaimed.addEventListener("click", () => {
      // Already on claimed page
      loadPostsFromStorage()
    })
  }

  if (elements.navLogout) {
    elements.navLogout.addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.clear()
        window.location.href = "login.html"
      }
    })
  }
}

/**
 * Set up notification event listeners
 */
function setupNotificationListeners() {
  // Notification Bell functionality
  if (elements.notificationBell) {
    elements.notificationBell.addEventListener("click", (e) => {
      e.stopPropagation()
      elements.notificationDropdown.classList.toggle("active")
      if (elements.announcementDropdown) elements.announcementDropdown.classList.remove("active")
    })
  }

  // Announcement Icon functionality
  if (elements.announcementIcon) {
    elements.announcementIcon.addEventListener("click", (e) => {
      e.stopPropagation()
      elements.announcementDropdown.classList.toggle("active")
      if (elements.notificationDropdown) elements.notificationDropdown.classList.remove("active")
    })
  }

  // Mark all notifications as read
  if (elements.markAllRead) {
    elements.markAllRead.addEventListener("click", () => {
      const unreadItems = document.querySelectorAll(".notification-item.unread")
      unreadItems.forEach((item) => {
        item.classList.remove("unread")
      })
      state.unreadNotifications = 0
      updateNotificationBadge()
    })
  }
}


function setupDocumentListeners() {
  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 768) {
      if (
        elements.sidebar &&
        elements.hamburgerMenu &&
        !elements.sidebar.contains(event.target) &&
        !elements.hamburgerMenu.contains(event.target)
      ) {
        elements.sidebar.classList.remove("active")
      }
    }
  })

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (elements.notificationBell && !elements.notificationBell.contains(e.target)) {
      if (elements.notificationDropdown) elements.notificationDropdown.classList.remove("active")
    }
    if (elements.announcementIcon && !elements.announcementIcon.contains(e.target)) {
      if (elements.announcementDropdown) elements.announcementDropdown.classList.remove("active")
    }
    if (!e.target.closest(".post-options")) {
      document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
        dropdown.style.display = "none"
      })
    }
  })

  // Add event listeners for like synchronization
  window.addEventListener("likeStateChanged", (e) => {
    const { postId, liked, likeCount } = e.detail

    const postElement = document.querySelector(`[data-post-id="${postId}"]`)
    if (postElement) {
      const heartButton = postElement.querySelector('.post-action[onclick*="toggleHeart"]')
      if (heartButton) {
        const icon = heartButton.querySelector("i")
        const span = heartButton.querySelector("span")

        if (liked) {
          icon.classList.remove("far")
          icon.classList.add("fas")
          icon.style.color = "#dc2626"
          span.style.color = "#dc2626"
          heartButton.classList.add("liked")
        } else {
          icon.classList.remove("fas")
          icon.classList.add("far")
          icon.style.color = ""
          span.style.color = ""
          heartButton.classList.remove("liked")
        }
      }
    }
  })

  // Listen for storage events
  window.addEventListener("storage", (e) => {
    if (e.key === "lastLikeUpdate") {
      const updateData = JSON.parse(e.newValue)
      if (updateData) {
        window.dispatchEvent(
          new CustomEvent("likeStateChanged", {
            detail: updateData,
          }),
        )
      }
    } else if (e.key === "userPosts") {
      loadPostsFromStorage()
    } else if (e.key === "userProfile" || e.key === "ifindUserData") {
      const currentUser = getCurrentUser()
      updateExistingCommentsAvatar(currentUser)
      initializeUserAvatar()
      loadPostsFromStorage()
    }
  })
}


function initializePage() {
  const currentUser = getCurrentUser()
  if (!currentUser.completedSetup) {
    window.location.href = "setup.html"
    return
  }

  initializeUserAvatar()
  loadPostsFromStorage()
  updateNotificationBadge()
  injectImageHandlingCSS()

  setupNavigationListeners()
  setupNotificationListeners()
  setupDocumentListeners()
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePage)
