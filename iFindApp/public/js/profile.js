// API URL
const API_URL = "http://localhost:3001/api"

// Current user data
let currentUser = null

// DOM Elements
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")
const editProfileBtn = document.getElementById("edit-profile-btn")
const editProfileModal = document.getElementById("edit-profile-modal")
const closeEditModalBtn = document.getElementById("close-edit-modal")
const cancelEditProfileBtn = document.getElementById("cancel-edit-profile")
const profileEditForm = document.getElementById("profile-edit-form")
const profileImageInput = document.getElementById("edit-profile-image")
const profileFileNameDisplay = document.getElementById("edit-profile-file-name")
const navFeed = document.getElementById("nav-feed")
const navClaimed = document.getElementById("nav-claimed")

// Get current user data from localStorage
function getCurrentUserData() {
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  return {
    id: ifindUserData.id || userProfile.id || mockUser.id || 1,
    name:
      userProfile.name ||
      ifindUserData.name ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "Ang Pogi",
    username:
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "angpogi",
    email:
      userProfile.email ||
      ifindUserData.email ||
      mockUser.email ||
      userData.email ||
      sessionData.email ||
      "user@example.com",
    role: userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role || "STUDENT",
    avatar: userProfile.avatar || mockUser.avatar || null,
    avatarId: userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId || null,
    avatarEmoji: userProfile.avatarEmoji || ifindUserData.avatar || null,
    contact:
      userProfile.contact ||
      `fb.com/${(userProfile.username || ifindUserData.name?.toLowerCase().replace(/\s+/g, "") || mockUser.username || userData.username || sessionData.username || "username").toLowerCase()}`,
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  }
}

// Load user posts from API
async function loadUserPostsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/posts`)
    const data = await response.json()

    if (data.success) {
      // Filter posts by current user
      const userPosts = data.data
        .filter((post) => post.user_id === currentUser.id)
        .map((post) => ({
          id: post.id.toString(),
          type: post.post_type.toLowerCase(),
          location: post.campus,
          description: post.description,
          image: post.image_path,
          userName: post.user_name || currentUser.name,
          userHandle: `@${post.username || currentUser.username}`,
          userRole: post.user_type || currentUser.role,
          userInitials: currentUser.name
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
          avatar: currentUser.avatar,
          avatarId: currentUser.avatarId,
          avatarEmoji: currentUser.avatarEmoji,
        }))

      // Load comments for each post
      for (const post of userPosts) {
        try {
          const commentsResponse = await fetch(`${API_URL}/comments/post/${post.id}`)
          const commentsData = await commentsResponse.json()

          if (commentsData.success) {
            post.comments = commentsData.data.map((comment) => ({
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

      displayUserPosts(userPosts)
    } else {
      console.error("Failed to load posts:", data.error)
      // Fallback to localStorage
      loadUserPostsFromStorage()
    }
  } catch (error) {
    console.error("Error loading posts from API:", error)
    // Fallback to localStorage
    loadUserPostsFromStorage()
  }
}

// Fallback to localStorage
function loadUserPostsFromStorage() {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const userPosts = allPosts.filter((post) => post.userId === "current_user")
  displayUserPosts(userPosts)
}

// Display user posts in profile
function displayUserPosts(posts) {
  const profilePostsContainer = document.getElementById("profile-posts")
  profilePostsContainer.innerHTML = ""

  if (posts.length === 0) {
    profilePostsContainer.innerHTML = `
      <div class="no-posts">
        <p>You haven't posted anything yet.</p>
      </div>
    `
    return
  }

  posts.forEach((post) => {
    const postElement = createProfilePostElement(post)
    profilePostsContainer.appendChild(postElement)
  })
}

// Create profile post element
function createProfilePostElement(postData) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.postId = postData.id

  // Enhanced avatar display
  let avatarHTML = ""
  if (postData.avatar) {
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    avatarHTML = `<div class="default-avatar" style="font-size: 20px;">${postData.avatarEmoji}</div>`
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
    const emoji = avatarEmojis[postData.avatarId - 1] || "👤"
    avatarHTML = `<div class="default-avatar" style="font-size: 20px;">${emoji}</div>`
  } else {
    avatarHTML = `<div class="default-avatar">${postData.userInitials}</div>`
  }

  // Create image HTML
  let imageHTML = ""
  if (postData.image) {
    imageHTML = `
      <div class="post-image-container loading" id="profile-image-container-${postData.id}">
        <img src="${postData.image}" 
             alt="${postData.type} item" 
             class="post-image"
             onload="handleProfileImageLoad(this, '${postData.id}')"
             onerror="handleProfileImageError(this, '${postData.id}')">
      </div>
    `
  }

  // Create comments HTML
  let commentsHTML = ""
  const commentCount = (postData.comments && postData.comments.length) || 0
  if (postData.comments && postData.comments.length > 0) {
    commentsHTML = `
      <div class="comments-list" style="display: none;">
        ${postData.comments
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
          .join("")}
      </div>
    `
  }

  // Get current user for comment input avatar
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
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)}</div>`
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
      <div class="post-action">
        <i class="fas fa-share"></i>
        <span>SHARE</span>
      </div>
    </div>
    <div class="post-comments">
      ${commentsHTML}
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

// Delete post using API
async function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        loadUserPostsFromAPI()
        alert("Post deleted successfully!")
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

// Mark as claimed using API
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
      loadUserPostsFromAPI()
      alert("Item marked as claimed!")
    } else {
      console.error("Failed to mark as claimed:", data.error)
      alert("Failed to mark as claimed: " + data.error)
    }
  } catch (error) {
    console.error("Error marking as claimed:", error)
    alert("An error occurred while marking the item as claimed.")
  }
}

function editPost(postId) {
  localStorage.setItem("editPostId", postId)
  window.location.href = "main.html?edit=" + postId
}

// Update profile display
function updateProfileDisplay() {
  const profileNavAvatar = document.getElementById("profile-nav-avatar")
  if (profileNavAvatar) {
    if (currentUser.avatar) {
      profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav" style="font-size: 20px;">${currentUser.avatarEmoji}</div>`
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
      const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav" style="font-size: 20px;">${emoji}</div>`
    } else {
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav">${initials}</div>`
    }
  }

  const profileAvatarLarge = document.querySelector(".profile-avatar-large")
  if (profileAvatarLarge) {
    if (currentUser.avatar) {
      profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 60px;">${currentUser.avatarEmoji}</div>`
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
      const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 60px;">${emoji}</div>`
    } else {
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large">${initials}</div>`
    }
  }

  const profileNameLarge = document.querySelector(".profile-name-large")
  if (profileNameLarge) {
    profileNameLarge.textContent = currentUser.name
  }

  const profileUsernameLarge = document.querySelector(".profile-username-large")
  if (profileUsernameLarge) {
    const username = currentUser.username.startsWith("@") ? currentUser.username : "@" + currentUser.username
    profileUsernameLarge.textContent = username
  }

  const profileRoleLarge = document.querySelector(".profile-role-large")
  if (profileRoleLarge) {
    profileRoleLarge.textContent = currentUser.role
  }

  const profileContactValue = document.querySelector(".profile-contact-value a")
  if (profileContactValue) {
    profileContactValue.textContent = currentUser.contact
    profileContactValue.href = `https://${currentUser.contact}`
  }

  // Update edit form values
  if (document.getElementById("edit-name")) {
    document.getElementById("edit-name").value = currentUser.name
  }
  if (document.getElementById("edit-username")) {
    document.getElementById("edit-username").value = currentUser.username.replace("@", "")
  }
  if (document.getElementById("edit-contact")) {
    document.getElementById("edit-contact").value = currentUser.contact
  }

  const profileEditAvatar = document.querySelector(".profile-edit-avatar")
  if (profileEditAvatar) {
    if (currentUser.avatar) {
      profileEditAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 40px;">${currentUser.avatarEmoji}</div>`
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
      const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 40px;">${emoji}</div>`
    } else {
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileEditAvatar.innerHTML = `<div class="default-avatar">${initials}</div>`
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

// Global functions for profile image handling
window.handleProfileImageLoad = (img, postId) => {
  const container = document.getElementById(`profile-image-container-${postId}`)
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

window.handleProfileImageError = (img, postId) => {
  const container = document.getElementById(`profile-image-container-${postId}`)
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

// Setup event listeners
function setupEventListeners() {
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      editProfileModal.classList.add("active")
      document.body.style.overflow = "hidden"
    })
  }

  function closeModal() {
    editProfileModal.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", closeModal)
  }
  if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener("click", closeModal)
  }

  if (editProfileModal) {
    editProfileModal.addEventListener("click", (e) => {
      if (e.target === editProfileModal) {
        closeModal()
      }
    })
  }

  // Profile form submission with API integration
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const newName = document.getElementById("edit-name").value.trim()
      const newUsername = document.getElementById("edit-username").value.replace("@", "").trim()
      const newContact = document.getElementById("edit-contact").value.trim()

      // Validation
      if (!newName) {
        alert("Name is required")
        return
      }

      if (!newUsername) {
        alert("Username is required")
        return
      }

      if (!newContact) {
        alert("Contact is required")
        return
      }

      try {
        // Update user in database
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: newName,
            username: newUsername,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Update localStorage
          const updatedUserData = {
            ...currentUser,
            name: newName,
            username: newUsername,
            contact: newContact,
          }

          localStorage.setItem("ifindUserData", JSON.stringify(updatedUserData))
          localStorage.setItem(
            "userProfile",
            JSON.stringify({
              ...JSON.parse(localStorage.getItem("userProfile") || "{}"),
              name: newName,
              username: `@${newUsername}`,
              contact: newContact,
            }),
          )

          // Update current user object
          currentUser = getCurrentUserData()
          updateProfileDisplay()
          loadUserPostsFromAPI()
          closeModal()
          alert("Profile updated successfully!")
        } else {
          alert("Failed to update profile: " + data.error)
        }
      } catch (error) {
        console.error("Error updating profile:", error)
        alert("An error occurred while updating your profile.")
      }
    })
  }

  // Profile image input handler
  if (profileImageInput) {
    profileImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]

      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file.")
          e.target.value = ""
          profileFileNameDisplay.textContent = ""
          return
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB.")
          e.target.value = ""
          profileFileNameDisplay.textContent = ""
          return
        }

        profileFileNameDisplay.textContent = file.name

        const reader = new FileReader()
        reader.onload = (e) => {
          const profileEditAvatar = document.querySelector(".profile-edit-avatar")
          if (profileEditAvatar) {
            profileEditAvatar.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
          }
        }
        reader.readAsDataURL(file)
      } else {
        profileFileNameDisplay.textContent = ""
        updateProfileDisplay()
      }
    })
  }
}

// Navigation
if (hamburgerMenu) {
  hamburgerMenu.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })
}

if (navFeed) {
  navFeed.addEventListener("click", () => {
    window.location.href = "main.html"
  })
}

if (navClaimed) {
  navClaimed.addEventListener("click", () => {
    window.location.href = "claim.html"
  })
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  }
})

// Toggle post options dropdown
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  dropdown.style.display = isVisible ? "none" : "block"
}

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".post-options")) {
    document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  }
})

// Toggle comments visibility
function toggleComments(postId, element) {
  const post = document.querySelector(`[data-post-id="${postId}"]`)
  if (!post) return

  const commentsList = post.querySelector(".comments-list")
  const commentInput = post.querySelector(".comment-input")

  if (commentsList) {
    const isHidden = commentsList.style.display === "none"
    commentsList.style.display = isHidden ? "block" : "none"

    if (isHidden) {
      element.classList.add("active")
      setTimeout(() => {
        const input = commentInput?.querySelector(".comment-text")
        if (input) input.focus()
      }, 100)
    } else {
      element.classList.remove("active")
    }
  }
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
      // Refresh the posts to show the new comment
      loadUserPostsFromAPI()
    } else {
      console.error("Failed to add comment:", data.error)
      alert("Failed to add comment: " + data.error)
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    alert("An error occurred while adding your comment.")
  }
}

function toggleHeart(postId, element) {
  // For now, just update the UI locally
  // You can implement like functionality in the API later
  const icon = element.querySelector("i")
  const span = element.querySelector("span")

  if (icon.classList.contains("far")) {
    icon.classList.remove("far")
    icon.classList.add("fas")
    icon.style.color = "#dc3545"
    span.style.color = "#dc3545"
    element.classList.add("liked")
  } else {
    icon.classList.remove("fas")
    icon.classList.add("far")
    icon.style.color = ""
    span.style.color = ""
    element.classList.remove("liked")
  }
}

// Initialize profile page
function init() {
  currentUser = getCurrentUserData()

  // Check if user has completed setup
  if (!currentUser.completedSetup) {
    window.location.href = "setup.html"
    return
  }

  updateProfileDisplay()
  setupEventListeners()
  loadUserPostsFromAPI()
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init)
