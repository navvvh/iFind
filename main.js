// Get user data from localStorage
const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}

// Create currentUser object using data from localStorage or fallback to defaults
const currentUser = {
  id: 1,
  name: storedUser.username || "Ang Pogi",
  username: storedUser.username ? `@${storedUser.username}` : "@angpogi",
  email: storedUser.email || "user@example.com",
  role: storedUser.role || "STUDENT", // Now uses the stored role
  contact: "fb.com/username",
  avatar: null,
}


// Initialize posts array
let posts = []

// DOM Elements
const feedContainer = document.getElementById("feed-container")
const addPostBtn = document.getElementById("add-post-btn")
const addPostModal = document.getElementById("add-post-modal")
const closeModalBtn = document.getElementById("close-modal")
const cancelPostBtn = document.getElementById("cancel-post")
const postForm = document.getElementById("post-form")
const postImageInput = document.getElementById("post-image")
const fileNameDisplay = document.getElementById("file-name")
const searchInput = document.getElementById("search-input")
const filterBtn = document.getElementById("filter-btn")
const filterModal = document.getElementById("filter-modal")
const closeFilterModalBtn = document.getElementById("close-filter-modal")
const applyFiltersBtn = document.getElementById("apply-filters")
const clearFiltersBtn = document.getElementById("clear-filters")
const filterCheckboxes = document.querySelectorAll(".filter-checkbox")
const headerProfilePic = document.getElementById("header-profile-pic")

// Navigation elements
const profileNav = document.getElementById("profile-nav")
const feedNav = document.getElementById("feed-nav")
const aboutNav = document.getElementById("about-nav")
const logoutNav = document.getElementById("logout-nav")

// Current view state
let currentView = "feed" // Can be "feed" or "profile"

// Helper function to add background blur effect for modals
function addBackgroundBlur() {
  const overlay = document.createElement("div")
  overlay.className = "modal-backdrop"
  overlay.style.position = "fixed"
  overlay.style.top = "0"
  overlay.style.left = "0"
  overlay.style.width = "100%"
  overlay.style.height = "100%"
  overlay.style.backgroundColor = "rgba(10, 31, 68, 0.5)" // Reduced opacity from 0.7 to 0.5
  overlay.style.backdropFilter = "blur(2px)" // Reduced blur from 4px to 2px
  overlay.style.zIndex = "999"
  document.body.appendChild(overlay)
  return overlay
}

// Helper function to remove background blur
function removeBackgroundBlur(overlay) {
  if (overlay) {
    overlay.remove()
  }
}

// Initialize the app
function init() {
  renderPosts()
  setupEventListeners()
  renderProfilePic()
}

// Render profile picture
function renderProfilePic() {
  if (headerProfilePic) {
    if (currentUser.avatar) {
      // If user has uploaded a profile picture
      headerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="Profile">`
    } else {
      // Default profile picture (initials)
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      headerProfilePic.innerHTML = `
                        <div class="default-avatar">
                            ${initials}
                        </div>
                    `
    }
  }
}

// Render all posts
function renderPosts(filteredPosts = null) {
  // Clear the feed container
  feedContainer.innerHTML = ""

  // Use filtered posts if provided, otherwise use all posts
  const postsToRender = filteredPosts || posts

  // Only render posts if there are any
  if (postsToRender.length > 0) {
    // Sort posts by timestamp (newest first)
    postsToRender.sort((a, b) => b.timestamp - a.timestamp)

    // Render each post
    postsToRender.forEach((post) => {
      const postElement = createPostElement(post)
      feedContainer.appendChild(postElement)
    })
  } else {
    // If there are no posts, show a message
    feedContainer.innerHTML = `
      <div class="no-posts">
        <p>No posts to display. Create a new post to get started!</p>
      </div>
    `
  }
}

// Create a post element
function createPostElement(post) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.id = post.id
  postElement.dataset.type = post.type
  postElement.dataset.location = post.location

  // Format the timestamp
  const formattedDate = formatDate(post.timestamp)

  // Determine user avatar HTML
  let userAvatarHTML
  if (post.user.avatar) {
    userAvatarHTML = `<img src="${post.user.avatar}" alt="${post.user.name}">`
  } else {
    const initials = post.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
    userAvatarHTML = `<div class="default-avatar">${initials}</div>`
  }

  // Create the post HTML
  postElement.innerHTML = `
    <div class="post-header">
        <div class="post-user">
            <div class="profile-pic">
                ${userAvatarHTML}
            </div>
            <div class="post-user-info">
                <div class="post-user-name">${post.user.name}</div>
                <div class="post-user-meta">
                    ${post.user.username} · ${formattedDate}
                </div>
            </div>
        </div>
        <div class="post-options" data-post-id="${post.id}">
            <i class="fas fa-chevron-down"></i>
        </div>
    </div>
    <div class="post-content">
        <div class="post-text">
            <span class="post-tag ${post.type}">${post.type.toUpperCase()}</span>
            ${post.description} - ${post.location}
        </div>
        <img src="${post.image}" alt="Post image" class="post-image">
    </div>
    <div class="post-actions">
        <div class="post-action comment-action">
            <i class="far fa-comment"></i>
            <span>${post.comments.length}</span>
        </div>
        <div class="post-action share-action">
            <i class="fas fa-share"></i>
            <span>Share</span>
        </div>
    </div>
    <div class="post-comments">
        ${renderComments(post.comments)}
        <div class="comment-input">
            <div class="profile-pic">
                ${
                  currentUser.avatar
                    ? `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
                    : `<div class="default-avatar">${currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}</div>`
                }
            </div>
            <input type="text" placeholder="Write your comment..." class="comment-text">
            <button class="send-comment">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
`

  // Add event listeners to the post
  const commentInput = postElement.querySelector(".comment-text")
  const sendCommentBtn = postElement.querySelector(".send-comment")

  sendCommentBtn.addEventListener("click", () => {
    addComment(post.id, commentInput.value)
    commentInput.value = ""
  })

  commentInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addComment(post.id, commentInput.value)
      commentInput.value = ""
    }
  })

  const postOptions = postElement.querySelector(".post-options")

  postOptions.addEventListener("click", (e) => {
    e.stopPropagation() // Prevent triggering the post click event

    // Remove any existing post options menu
    const existingMenu = document.querySelector(".post-options-menu")
    if (existingMenu) {
      existingMenu.remove()
    }

    // Create the options menu
    const optionsMenu = document.createElement("div")
    optionsMenu.className = "post-options-menu"
    optionsMenu.innerHTML = `
      <div class="option-item edit-post">
        <i class="fas fa-edit"></i>
        <span>Edit Post</span>
      </div>
      <div class="option-item mark-claimed">
        <i class="fas fa-check-circle"></i>
        <span>Mark as 'Claimed'</span>
      </div>
      <div class="option-item delete-post">
        <i class="fas fa-trash"></i>
        <span>Delete Post</span>
      </div>
    `

    // Position the menu
    const rect = postOptions.getBoundingClientRect()
    optionsMenu.style.position = "absolute"
    optionsMenu.style.top = `${rect.bottom + window.scrollY}px`
    optionsMenu.style.right = `${window.innerWidth - rect.right}px`
    optionsMenu.style.zIndex = "1000"

    // Add to document
    document.body.appendChild(optionsMenu)

    // Add event listeners for menu options
    const editPostBtn = optionsMenu.querySelector(".edit-post")
    const markClaimedBtn = optionsMenu.querySelector(".mark-claimed")
    const deletePostBtn = optionsMenu.querySelector(".delete-post")

    editPostBtn.addEventListener("click", () => {
      editPost(post.id)
      optionsMenu.remove()
    })

    markClaimedBtn.addEventListener("click", () => {
      markPostAsClaimed(post.id)
      optionsMenu.remove()
    })

    deletePostBtn.addEventListener("click", () => {
      deletePost(post.id)
      optionsMenu.remove()
    })

    // Close menu when clicking outside
    document.addEventListener("click", function closeMenu(e) {
      if (!optionsMenu.contains(e.target) && e.target !== postOptions) {
        optionsMenu.remove()
        document.removeEventListener("click", closeMenu)
      }
    })
  })

  // Make the post clickable to view full post
  postElement.addEventListener("click", (e) => {
    // Don't trigger if clicking on interactive elements
    if (
      e.target.closest(".post-options") ||
      e.target.closest(".post-action") ||
      e.target.closest(".comment-input") ||
      e.target.closest(".comment")
    ) {
      return
    }
    showFullPost(post.id)
  })

  return postElement
}

// Mark post as claimed
function markPostAsClaimed(postId) {
  const post = posts.find((p) => p.id == postId)
  if (!post) return

  // Create confirmation modal
  const confirmModal = document.createElement("div")
  confirmModal.className = "modal"
  confirmModal.id = "confirm-claim-modal"

  confirmModal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <div class="modal-title">Mark as Claimed</div>
        <button class="close-modal" id="close-confirm-modal">&times;</button>
      </div>
      <div style="padding: 20px 0;">
        <p>Are you sure you want to mark this post as claimed?</p>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="cancel-claim">Cancel</button>
        <button type="button" class="btn btn-primary" id="confirm-claim">Mark as Claimed</button>
      </div>
    </div>
  `

  document.body.appendChild(confirmModal)

  // Add background blur
  const overlay = addBackgroundBlur()
  confirmModal.style.display = "flex"

  // Add event listeners
  const closeConfirmModalBtn = document.getElementById("close-confirm-modal")
  const cancelClaimBtn = document.getElementById("cancel-claim")
  const confirmClaimBtn = document.getElementById("confirm-claim")

  const closeModal = () => {
    confirmModal.remove()
    removeBackgroundBlur(overlay)
  }

  closeConfirmModalBtn.addEventListener("click", closeModal)
  cancelClaimBtn.addEventListener("click", closeModal)

  confirmClaimBtn.addEventListener("click", () => {
    // Update the post type to claimed
    post.type = "claimed"
    post.claimed = true

    // Re-render posts
    renderPosts()

    // Close the modal
    closeModal()
  })

  // Close when clicking outside
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal()
    }
  })
}

// Render comments for a post
function renderComments(comments) {
  if (comments.length === 0) return ""

  let commentsHTML = ""
  comments.forEach((comment) => {
    // Determine comment user avatar HTML
    let commentUserAvatarHTML
    if (comment.user.avatar) {
      commentUserAvatarHTML = `<img src="${comment.user.avatar}" alt="${comment.user.name}">`
    } else {
      const initials = comment.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      commentUserAvatarHTML = `<div class="default-avatar">${initials}</div>`
    }

    commentsHTML += `
                    <div class="comment" data-id="${comment.id}">
                        <div class="profile-pic">
                            ${commentUserAvatarHTML}
                        </div>
                        <div class="comment-content">
                            <span class="comment-user">${comment.user.name}</span>
                            ${comment.text}
                        </div>
                    </div>
                `
  })

  return commentsHTML
}

// Add a comment to a post
function addComment(postId, commentText) {
  if (!commentText.trim()) return

  const post = posts.find((p) => p.id == postId)
  if (!post) return

  const newComment = {
    id: Date.now(),
    user: {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
    },
    text: commentText,
  }

  post.comments.push(newComment)
  renderPosts()
}

// Format date for display
function formatDate(date) {
  // Convert string date to Date object if needed
  if (typeof date === "string") {
    date = new Date(date)
  }

  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return "Just now"
  }
}

// Add a new post
function addNewPost(type, description, location, imageFile) {
  return new Promise((resolve) => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPost = {
          id: Date.now(),
          user: {
            id: currentUser.id,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
          type,
          description,
          image: e.target.result,
          location,
          timestamp: new Date(),
          comments: [],
          likes: 0,
          claimed: false,
        }

        // Add the post to the beginning of the array
        posts = [newPost, ...posts]
        renderPosts()
        resolve()
      }
      reader.readAsDataURL(imageFile)
    } else {
      // Use a default image if none provided
      const newPost = {
        id: Date.now(),
        user: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
        type,
        description,
        image: "https://via.placeholder.com/500x300?text=No+Image",
        location,
        timestamp: new Date(),
        comments: [],
        likes: 0,
        claimed: false,
      }

      // Add the post to the beginning of the array
      posts = [newPost, ...posts]
      renderPosts()
      resolve()
    }
  })
}

// Filter posts based on search and filter criteria
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase()
  const typeFilters = Array.from(document.querySelectorAll(".filter-checkbox[data-type]:checked")).map(
    (checkbox) => checkbox.dataset.type,
  )

  const campusFilters = Array.from(document.querySelectorAll(".filter-checkbox[data-campus]:checked")).map(
    (checkbox) => checkbox.dataset.campus,
  )

  let filteredPosts = posts

  // Filter by search term
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.description.toLowerCase().includes(searchTerm) ||
        post.location.toLowerCase().includes(searchTerm) ||
        post.user.name.toLowerCase().includes(searchTerm),
    )
  }

  // Filter by type
  if (typeFilters.length > 0) {
    filteredPosts = filteredPosts.filter((post) => typeFilters.includes(post.type))
  }

  // Filter by campus
  if (campusFilters.length > 0) {
    filteredPosts = filteredPosts.filter((post) => {
      const location = post.location.toLowerCase()
      return campusFilters.some((campus) => {
        if (campus === "main") return location.includes("main")
        if (campus === "annex") return location.includes("annex") && !location.includes("ii")
        if (campus === "annex2") return location.includes("annex ii")
        return false
      })
    })
  }

  renderPosts(filteredPosts)
  filterModal.style.display = "none"
}

// Clear all filters
function clearFilters() {
  filterCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })
  searchInput.value = ""
  renderPosts()
  filterModal.style.display = "none"
}

// Show profile view with completely different layout
function showProfileView() {
  // Check if profile page already exists
  const existingProfilePage = document.getElementById("profile-page")
  if (existingProfilePage) {
    // Profile page already exists, just update the content

    // Update user avatar in top nav
    const profileNavAvatar = document.getElementById("profile-nav-avatar")
    if (profileNavAvatar) {
      if (currentUser.avatar) {
        profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
      } else {
        const initials = currentUser.name
          .split(" ")
          .map((n) => n[0])
          .join("")
        profileNavAvatar.innerHTML = `<div class="default-avatar-nav">${initials}</div>`
      }
    }

    // Update user avatar in sidebar
    const profileAvatarLarge = document.querySelector(".profile-avatar-large")
    if (profileAvatarLarge) {
      if (currentUser.avatar) {
        profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
      } else {
        const initials = currentUser.name
          .split(" ")
          .map((n) => n[0])
          .join("")
        profileAvatarLarge.innerHTML = `<div class="default-avatar-large">${initials}</div>`
      }
    }

    // Update profile info
    const profileNameLarge = document.querySelector(".profile-name-large")
    if (profileNameLarge) {
      profileNameLarge.textContent = currentUser.name
    }

    const profileUsernameLarge = document.querySelector(".profile-username-large")
    if (profileUsernameLarge) {
      profileUsernameLarge.textContent = currentUser.username
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

    // Update posts
    const userPosts = posts.filter((post) => post.user.id === currentUser.id)
    const profilePostsContainer = document.getElementById("profile-posts")
    if (profilePostsContainer) {
      // Clear existing posts
      profilePostsContainer.innerHTML = ""

      if (userPosts.length > 0) {
        userPosts.forEach((post) => {
          const postElement = createPostElement(post)
          profilePostsContainer.appendChild(postElement)
        })
      } else {
        profilePostsContainer.innerHTML = `
          <div class="no-posts">
            <p>You haven't created any posts yet.</p>
          </div>
        `
      }
    }

    return // Exit function early since we've updated the existing profile page
  }
  // Update current view state
  currentView = "profile"

  // Hide the main app layout
  document.querySelector(".sidebar").style.display = "none"
  document.querySelector(".main-content").style.display = "none"

  // Create profile page container
  const profilePage = document.createElement("div")
  profilePage.id = "profile-page"
  profilePage.className = "profile-page"

  // Get user avatar HTML for top nav
  let userNavAvatarHTML
  if (currentUser.avatar) {
    userNavAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
  } else {
    const initials = currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
    userNavAvatarHTML = `<div class="default-avatar-nav">${initials}</div>`
  }

  // Get user avatar HTML for sidebar
  let userSidebarAvatarHTML
  if (currentUser.avatar) {
    userSidebarAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
  } else {
    const initials = currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
    userSidebarAvatarHTML = `<div class="default-avatar-large">${initials}</div>`
  }

  
  // Create profile page HTML
profilePage.innerHTML = `
  <!-- Top Navigation Bar -->
  <div class="profile-nav">
    <div class="profile-nav-left" id="menu-toggle">
      <i class="fas fa-bars"></i>
    </div>
    <div class="profile-nav-center">
      <img src="findme.png" alt="iFind Logo" class="ifindlogo">
    </div>
    <div class="profile-nav-right" id="profile-nav-avatar">
      ${userNavAvatarHTML}
    </div>
  </div>

  <!-- Profile Content -->
  <div class="profile-content">
    <!-- Profile Sidebar -->
    <div class="profile-sidebar">
      <div class="profile-avatar-large">
        ${userSidebarAvatarHTML}
      </div>
      <h1 class="profile-name-large">${currentUser.name}</h1>
      <div class="profile-username-large">${currentUser.username}</div>
      <div class="profile-role-large">${currentUser.role}</div>
      
      <div class="profile-divider"></div>
      
      <div class="profile-contact-label">CONTACT</div>
      <div class="profile-contact-value">
        <a href="https://${currentUser.contact}" target="_blank">${currentUser.contact}</a>
      </div>
      
      <button class="profile-edit-btn" id="edit-profile-btn">
        <i class="fas fa-pencil-alt"></i> Edit Profile
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="profile-main">
      <h2 class="profile-section-title">RECENT POSTS</h2>
      <div class="profile-posts" id="profile-posts">
        <!-- User posts will be rendered here -->
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  <div class="mobile-menu" id="mobile-menu">
    <div class="mobile-menu-header">
      <div class="logo">
        <img class="lolo" src="findme.png" alt="iFind Logo">
      </div>
      <button class="mobile-menu-close" id="close-menu">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="mobile-menu-items">
      <a href="#" class="mobile-menu-item" id="menu-feed">
        <i class="fas fa-stream"></i>
        <span>Feed</span>
      </a>
      <a href="#" class="mobile-menu-item" id="menu-profile">
        <i class="fas fa-user"></i>
        <span>Profile</span>
      </a>
      <a href="#" class="mobile-menu-item" id="menu-about">
        <i class="fas fa-info-circle"></i>
        <span>About iFind</span>
      </a>
      <a href="#" class="mobile-menu-item" id="menu-logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Log Out</span>
      </a>
    </div>
  </div>
  <div class="mobile-menu-overlay" id="menu-overlay"></div>
`


  // Add profile page to body
  document.body.appendChild(profilePage)

  // Get user posts
  const userPosts = posts.filter((post) => post.user.id === currentUser.id)

  // Render user posts
  const profilePostsContainer = document.getElementById("profile-posts")
  if (profilePostsContainer) {
    // Clear existing posts
    profilePostsContainer.innerHTML = ""

    if (userPosts.length > 0) {
      userPosts.forEach((post) => {
        const postElement = createPostElement(post)
        profilePostsContainer.appendChild(postElement)
      })
    } else {
      profilePostsContainer.innerHTML = `
        <div class="no-posts">
          <p>You haven't created any posts yet.</p>
        </div>
      `
    }
  }

  // Add event listeners for profile page
  const menuToggle = document.getElementById("menu-toggle")
  const mobileMenu = document.getElementById("mobile-menu")
  const menuOverlay = document.getElementById("menu-overlay")
  const closeMenu = document.getElementById("close-menu")
  const menuFeed = document.getElementById("menu-feed")
  const menuProfile = document.getElementById("menu-profile")
  const menuAbout = document.getElementById("menu-about")
  const menuLogout = document.getElementById("menu-logout")
  const editProfileBtn = document.getElementById("edit-profile-btn")

  // Toggle mobile menu
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active")
    menuOverlay.classList.add("active")
  })

  // Close mobile menu
  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("active")
    menuOverlay.classList.remove("active")
  })

  // Close menu when clicking overlay
  menuOverlay.addEventListener("click", () => {
    mobileMenu.classList.remove("active")
    menuOverlay.classList.remove("active")
  })

  // Menu navigation
  menuFeed.addEventListener("click", () => {
    showFeedView()
  })

  menuProfile.addEventListener("click", () => {
    // Already on profile, just close menu
    mobileMenu.classList.remove("active")
    menuOverlay.classList.remove("active")
  })

  menuAbout.addEventListener("click", () => {
    alert("About page is not implemented in this demo")
  })

  menuLogout.addEventListener("click", () => {
    // Clear user data and redirect to login page
    localStorage.removeItem("mockUser")
    window.location.href = "index.html"
  })

  // Edit profile button
  editProfileBtn.addEventListener("click", showEditProfileModal)
}

// Show feed view
function showFeedView() {
  // Update current view state
  currentView = "feed"

  // Remove profile page if it exists
  const profilePage = document.getElementById("profile-page")
  if (profilePage) {
    profilePage.remove()
  }

  // Show the main app layout
  document.querySelector(".sidebar").style.display = "flex"
  document.querySelector(".main-content").style.display = "flex"

  // Update active nav item
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"))
  feedNav.classList.add("active")

  // Render posts
  renderPosts()
}

// Show edit profile modal
function showEditProfileModal() {
  // Create modal if it doesn't exist
  let profileEditModal = document.getElementById("profile-edit-modal")

  if (!profileEditModal) {
    profileEditModal = document.createElement("div")
    profileEditModal.id = "profile-edit-modal"
    profileEditModal.className = "modal"

    // Get user avatar HTML
    let userAvatarHTML
    if (currentUser.avatar) {
      userAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
    } else {
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      userAvatarHTML = `<div class="default-avatar">${initials}</div>`
    }

    profileEditModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Edit Profile</div>
          <button class="close-modal" id="close-edit-profile-modal">&times;</button>
        </div>
        <form class="profile-edit-form" id="profile-edit-form">
          <div class="profile-edit-avatar">
            ${userAvatarHTML}
          </div>
          <div class="form-group">
            <label for="edit-name">Name</label>
            <input type="text" id="edit-name" value="${currentUser.name}" required>
          </div>
          <div class="form-group">
            <label for="edit-username">Username</label>
            <input type="text" id="edit-username" value="${currentUser.username.replace("@", "")}" required>
          </div>
          <div class="form-group">
            <label for="edit-role">Role</label>
            <input type="text" id="edit-role" value="${currentUser.role}" required>
          </div>
          <div class="form-group">
            <label for="edit-contact">Contact</label>
            <input type="text" id="edit-contact" value="${currentUser.contact}" required>
          </div>
          <div class="form-group">
            <label>Profile Picture</label>
            <div class="file-input-container">
              <label class="file-input-label" for="edit-profile-image">Choose Image</label>
              <input type="file" id="edit-profile-image" class="file-input" accept="image/*">
            </div>
            <div class="file-name" id="edit-profile-file-name"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-edit-profile">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `

    document.body.appendChild(profileEditModal)

    // Add event listeners
    const closeEditProfileModalBtn = document.getElementById("close-edit-profile-modal")
    const cancelEditProfileBtn = document.getElementById("cancel-edit-profile")
    const profileEditForm = document.getElementById("profile-edit-form")
    const profileImageInput = document.getElementById("edit-profile-image")
    const profileFileNameDisplay = document.getElementById("edit-profile-file-name")

    closeEditProfileModalBtn.addEventListener("click", () => {
      profileEditModal.style.display = "none"
    })

    cancelEditProfileBtn.addEventListener("click", () => {
      profileEditModal.style.display = "none"
    })

    profileEditForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Update user data
      currentUser.name = document.getElementById("edit-name").value
      currentUser.username = "@" + document.getElementById("edit-username").value.replace("@", "")
      currentUser.role = document.getElementById("edit-role").value
      currentUser.contact = document.getElementById("edit-contact").value

      const imageFile = profileImageInput.files[0]
      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          currentUser.avatar = e.target.result

          // Update localStorage
          const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
          storedUser.avatar = currentUser.avatar
          localStorage.setItem("mockUser", JSON.stringify(storedUser))

          // Update UI
          renderProfilePic()

          // Update posts and comments
          posts.forEach((post) => {
            if (post.user.id === currentUser.id) {
              post.user.name = currentUser.name
              post.user.username = currentUser.username
              post.user.avatar = currentUser.avatar
            }
            post.comments.forEach((comment) => {
              if (comment.user.id === currentUser.id) {
                comment.user.name = currentUser.name
                comment.user.avatar = currentUser.avatar
              }
            })
          })

          // Update the existing profile view instead of recreating it
          if (currentView === "profile") {
            // Update profile avatar in the top nav
            const profileNavAvatar = document.getElementById("profile-nav-avatar")
            if (profileNavAvatar) {
              if (currentUser.avatar) {
                profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
              } else {
                const initials = currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                profileNavAvatar.innerHTML = `<div class="default-avatar-nav">${initials}</div>`
              }
            }

            // Update profile avatar in the sidebar
            const profileAvatarLarge = document.querySelector(".profile-avatar-large")
            if (profileAvatarLarge) {
              if (currentUser.avatar) {
                profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
              } else {
                const initials = currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                profileAvatarLarge.innerHTML = `<div class="default-avatar-large">${initials}</div>`
              }
            }

            // Update profile name, username, role, and contact
            const profileNameLarge = document.querySelector(".profile-name-large")
            if (profileNameLarge) {
              profileNameLarge.textContent = currentUser.name
            }

            const profileUsernameLarge = document.querySelector(".profile-username-large")
            if (profileUsernameLarge) {
              profileUsernameLarge.textContent = currentUser.username
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
          }

          // Close the modal and remove the overlay
          profileEditModal.style.display = "none"
          const overlay = document.querySelector(".modal-backdrop")
          if (overlay) {
            removeBackgroundBlur(overlay)
          }
        }
        reader.readAsDataURL(imageFile)
      } else {
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
        storedUser.username = currentUser.username.replace("@", "")
        localStorage.setItem("mockUser", JSON.stringify(storedUser))

        // Update posts and comments
        posts.forEach((post) => {
          if (post.user.id === currentUser.id) {
            post.user.name = currentUser.name
            post.user.username = currentUser.username
          }
          post.comments.forEach((comment) => {
            if (comment.user.id === currentUser.id) {
              comment.user.name = currentUser.name
            }
          })
        })

        // Update the existing profile view instead of recreating it
        if (currentView === "profile") {
          // Update profile avatar in the top nav
          const profileNavAvatar = document.getElementById("profile-nav-avatar")
          if (profileNavAvatar) {
            if (currentUser.avatar) {
              profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
            } else {
              const initials = currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              profileNavAvatar.innerHTML = `<div class="default-avatar-nav">${initials}</div>`
            }
          }

          // Update profile avatar in the sidebar
          const profileAvatarLarge = document.querySelector(".profile-avatar-large")
          if (profileAvatarLarge) {
            if (currentUser.avatar) {
              profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
            } else {
              const initials = currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
              profileAvatarLarge.innerHTML = `<div class="default-avatar-large">${initials}</div>`
            }
          }

          // Update profile name, username, role, and contact
          const profileNameLarge = document.querySelector(".profile-name-large")
          if (profileNameLarge) {
            profileNameLarge.textContent = currentUser.name
          }

          const profileUsernameLarge = document.querySelector(".profile-username-large")
          if (profileUsernameLarge) {
            profileUsernameLarge.textContent = currentUser.username
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
        }

        // Close the modal and remove the overlay
        profileEditModal.style.display = "none"
        const overlay = document.querySelector(".modal-backdrop")
        if (overlay) {
          removeBackgroundBlur(overlay)
        }
      }
    })

    profileImageInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        profileFileNameDisplay.textContent = e.target.files[0].name
      } else {
        profileFileNameDisplay.textContent = ""
      }
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === profileEditModal) {
        profileEditModal.style.display = "none"
      }
    })
  }

  // Add background blur
  const overlay = addBackgroundBlur()
  profileEditModal.style.display = "flex"

  // Update event listeners to remove blur
  const closeEditProfileModalBtn = document.getElementById("close-edit-profile-modal")
  const cancelEditProfileBtn = document.getElementById("cancel-edit-profile")

  const closeModal = () => {
    profileEditModal.style.display = "none"
    removeBackgroundBlur(overlay)
  }

  closeEditProfileModalBtn.addEventListener("click", closeModal, { once: true })
  cancelEditProfileBtn.addEventListener("click", closeModal, { once: true })

  // Close when clicking outside
  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) {
        closeModal()
      }
    },
    { once: true },
  )
}

// Show profile modal
function showProfileModal() {
  // Create modal if it doesn't exist
  let profileModal = document.getElementById("profile-modal")

  if (!profileModal) {
    profileModal = document.createElement("div")
    profileModal.id = "profile-modal"
    profileModal.className = "modal"

    profileModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">Profile Settings</div>
                            <button class="close-modal" id="close-profile-modal">&times;</button>
                        </div>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div class="profile-pic" style="width: 80px; height: 80px; margin: 0 auto;">
                                ${
                                  currentUser.avatar
                                    ? `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
                                    : `<div class="default-avatar" style="font-size: 24px;">
                                        ${currentUser.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                    </div>`
                                }
                            </div>
                            <div style="margin-top: 10px; font-weight: bold;">${currentUser.name}</div>
                            <div style="color: #65676b;">${currentUser.username}</div>
                        </div>
                        <div class="form-group">
                            <label>Profile Picture</label>
                            <div class="file-input-container">
                                <label class="file-input-label" for="profile-image">Choose Image</label>
                                <input type="file" id="profile-image" class="file-input" accept="image/*">
                            </div>
                            <div class="file-name" id="profile-file-name"></div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-profile">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-profile">Save Changes</button>
                        </div>
                    </div>
                `

    document.body.appendChild(profileModal)

    // Add event listeners
    const closeProfileModalBtn = document.getElementById("close-profile-modal")
    const cancelProfileBtn = document.getElementById("cancel-profile")
    const saveProfileBtn = document.getElementById("save-profile")
    const profileImageInput = document.getElementById("profile-image")
    const profileFileNameDisplay = document.getElementById("profile-file-name")

    closeProfileModalBtn.addEventListener("click", () => {
      profileModal.style.display = "none"
    })

    cancelProfileBtn.addEventListener("click", () => {
      profileModal.style.display = "none"
    })

    saveProfileBtn.addEventListener("click", () => {
      const imageFile = profileImageInput.files[0]
      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          currentUser.avatar = e.target.result
          renderProfilePic()

          // Update avatar in all posts and comments
          posts.forEach((post) => {
            if (post.user.id === currentUser.id) {
              post.user.avatar = currentUser.avatar
            }
            post.comments.forEach((comment) => {
              if (comment.user.id === currentUser.id) {
                comment.user.avatar = currentUser.avatar
              }
            })
          })

          // If in profile view, refresh it
          if (currentView === "profile") {
            showProfileView()
          } else {
            renderPosts()
          }

          // Close the modal and remove the overlay
          profileModal.style.display = "none"
          const overlay = document.querySelector(".modal-backdrop")
          if (overlay) {
            removeBackgroundBlur(overlay)
          }
        }
        reader.readAsDataURL(imageFile)
      } else {
        // Close the modal and remove the overlay
        profileModal.style.display = "none"
        const overlay = document.querySelector(".modal-backdrop")
        if (overlay) {
          removeBackgroundBlur(overlay)
        }
      }
    })

    profileImageInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        profileFileNameDisplay.textContent = e.target.files[0].name
      } else {
        profileFileNameDisplay.textContent = ""
      }
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        profileModal.style.display = "none"
      }
    })
  }

  // Add background blur
  const overlay = addBackgroundBlur()
  profileModal.style.display = "flex"

  // Update event listeners to remove blur
  const closeProfileModalBtn = document.getElementById("close-profile-modal")
  const cancelProfileBtn = document.getElementById("cancel-profile")

  const closeModal = () => {
    profileModal.style.display = "none"
    removeBackgroundBlur(overlay)
  }

  closeProfileModalBtn.addEventListener("click", closeModal, { once: true })
  cancelProfileBtn.addEventListener("click", closeModal, { once: true })

  // Close when clicking outside
  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) {
        closeModal()
      }
    },
    { once: true },
  )
}

// Function to edit a post
function editPost(postId) {
  const post = posts.find((p) => p.id == postId)
  if (!post) return

  // Create edit post modal if it doesn't exist
  let editPostModal = document.getElementById("edit-post-modal")

  if (!editPostModal) {
    editPostModal = document.createElement("div")
    editPostModal.id = "edit-post-modal"
    editPostModal.className = "modal"

    editPostModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Edit Post</div>
          <button class="close-modal" id="close-edit-modal">&times;</button>
        </div>
        <form class="modal-form" id="edit-post-form">
          <div class="form-group">
            <label for="edit-post-type">Type</label>
            <select id="edit-post-type" required>
              <option value="found">Found</option>
              <option value="lost">Lost</option>
              <option value="claimed">Claimed</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-post-location">Location</label>
            <select id="edit-post-location" required>
              <option value="Main Building">Main Building</option>
              <option value="Annex Building">Annex Building</option>
              <option value="Annex II Building">Annex II Building</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-post-description">Description</label>
            <textarea id="edit-post-description" placeholder="Describe the item..." required></textarea>
          </div>
          <input type="hidden" id="edit-post-id">
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-edit-post">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `

    document.body.appendChild(editPostModal)

    // Add event listeners
    const closeEditModalBtn = document.getElementById("close-edit-modal")
    const cancelEditPostBtn = document.getElementById("cancel-edit-post")
    const editPostForm = document.getElementById("edit-post-form")

    closeEditModalBtn.addEventListener("click", () => {
      editPostModal.style.display = "none"
    })

    cancelEditPostBtn.addEventListener("click", () => {
      editPostModal.style.display = "none"
    })

    editPostForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const postId = document.getElementById("edit-post-id").value
      const type = document.getElementById("edit-post-type").value
      const description = document.getElementById("edit-post-description").value
      const location = document.getElementById("edit-post-location").value

      // Find the post and update it
      const post = posts.find((p) => p.id == postId)
      if (post) {
        post.type = type
        post.description = description
        post.location = location

        // Re-render posts
        renderPosts()
      }

      // Close the modal and remove the overlay
      editPostModal.style.display = "none"
      const overlay = document.querySelector(".modal-backdrop")
      if (overlay) {
        removeBackgroundBlur(overlay)
      }
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === editPostModal) {
        editPostModal.style.display = "none"
      }
    })
  }

  // Set form values
  document.getElementById("edit-post-type").value = post.type
  document.getElementById("edit-post-location").value = post.location
  document.getElementById("edit-post-description").value = post.description
  document.getElementById("edit-post-id").value = post.id

  // Add background blur
  const overlay = addBackgroundBlur()
  editPostModal.style.display = "flex"

  // Remove overlay when modal is closed
  const closeModal = () => {
    editPostModal.style.display = "none"
    removeBackgroundBlur(overlay)
  }

  document.getElementById("close-edit-modal").addEventListener("click", closeModal, { once: true })
  document.getElementById("cancel-edit-post").addEventListener("click", closeModal, { once: true })

  // Close when clicking outside
  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) {
        closeModal()
      }
    },
    { once: true },
  )
}

// Function to delete a post
function deletePost(postId) {
  // Create confirmation modal
  const confirmModal = document.createElement("div")
  confirmModal.className = "modal"
  confirmModal.id = "confirm-delete-modal"

  confirmModal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <div class="modal-title">Confirm Delete</div>
        <button class="close-modal" id="close-confirm-modal">&times;</button>
      </div>
      <div style="padding: 20px 0;">
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="cancel-delete">Cancel</button>
        <button type="button" class="btn btn-primary" style="background-color: #dc3545;" id="confirm-delete">Delete</button>
      </div>
    </div>
  `

  document.body.appendChild(confirmModal)

  // Add background blur
  const overlay = addBackgroundBlur()
  confirmModal.style.display = "flex"

  // Add event listeners
  const closeConfirmModalBtn = document.getElementById("close-confirm-modal")
  const cancelDeleteBtn = document.getElementById("cancel-delete")
  const confirmDeleteBtn = document.getElementById("confirm-delete")

  const closeModal = () => {
    confirmModal.remove()
    removeBackgroundBlur(overlay)
  }

  closeConfirmModalBtn.addEventListener("click", closeModal)
  cancelDeleteBtn.addEventListener("click", closeModal)

  confirmDeleteBtn.addEventListener("click", () => {
    // Remove the post from the array
    posts = posts.filter((post) => post.id != postId)

    // Re-render posts
    renderPosts()

    // Close the modal
    closeModal()
  })

  // Close when clicking outside
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal()
    }
  })
}

// Function to show full post
function showFullPost(postId) {
  const post = posts.find((p) => p.id == postId)
  if (!post) return

  const fullPostModal = document.getElementById("full-post-modal")
  const fullPostContent = document.getElementById("full-post-content")
  const closeFullPostModal = document.getElementById("close-full-post-modal")

  // Create a clone of the post element
  const postElement = createPostElement(post)
  postElement.classList.add("full-post-view")

  // Clear previous content and add the post
  fullPostContent.innerHTML = ""
  fullPostContent.appendChild(postElement)

  // Add background blur
  const overlay = addBackgroundBlur()
  fullPostModal.style.display = "flex"

  // Add event listener to close button
  const closeModal = () => {
    fullPostModal.style.display = "none"
    removeBackgroundBlur(overlay)
  }

  closeFullPostModal.addEventListener("click", closeModal, { once: true })

  // Close when clicking outside
  overlay.addEventListener(
    "click",
    (e) => {
      if (e.target === overlay) {
        closeModal()
      }
    },
    { once: true },
  )
}

// Setup event listeners
function setupEventListeners() {
  // Add post button
  addPostBtn.addEventListener("click", () => {
    const overlay = addBackgroundBlur()
    addPostModal.style.display = "flex"

    // Remove overlay when modal is closed
    const closeModal = () => {
      addPostModal.style.display = "none"
      postForm.reset()
      fileNameDisplay.textContent = ""
      removeBackgroundBlur(overlay)
    }

    closeModalBtn.addEventListener("click", closeModal, { once: true })
    cancelPostBtn.addEventListener("click", closeModal, { once: true })

    // Close when clicking outside
    overlay.addEventListener(
      "click",
      (e) => {
        if (e.target === overlay) {
          closeModal()
        }
      },
      { once: true },
    )
  })

  // Post form submission
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const type = document.getElementById("post-type").value
    const description = document.getElementById("post-description").value
    const location = document.getElementById("post-location").value
    const imageFile = postImageInput.files[0]

    await addNewPost(type, description, location, imageFile)

    addPostModal.style.display = "none"
    postForm.reset()
    fileNameDisplay.textContent = ""

    // Remove any background blur
    const overlay = document.querySelector(".modal-backdrop")
    if (overlay) {
      removeBackgroundBlur(overlay)
    }
  })

  // Display file name when selected
  postImageInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      fileNameDisplay.textContent = e.target.files[0].name
    } else {
      fileNameDisplay.textContent = ""
    }
  })

  // Filter button
  filterBtn.addEventListener("click", () => {
    const overlay = addBackgroundBlur()
    filterModal.style.display = "flex"

    // Remove overlay when modal is closed
    const closeModal = () => {
      filterModal.style.display = "none"
      removeBackgroundBlur(overlay)
    }

    closeFilterModalBtn.addEventListener("click", closeModal, { once: true })

    // Close when clicking outside
    overlay.addEventListener(
      "click",
      (e) => {
        if (e.target === overlay) {
          closeModal()
        }
      },
      { once: true },
    )
  })

  // Apply filters
  applyFiltersBtn.addEventListener("click", () => {
    filterPosts()
    const overlay = document.querySelector(".modal-backdrop")
    if (overlay) {
      removeBackgroundBlur(overlay)
    }
  })

  // Clear filters
  clearFiltersBtn.addEventListener("click", () => {
    clearFilters()
    const overlay = document.querySelector(".modal-backdrop")
    if (overlay) {
      removeBackgroundBlur(overlay)
    }
  })

  // Search functionality
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      filterPosts()
    }
  })

  // Navigation
  profileNav.addEventListener("click", () => {
    // Show profile view
    showProfileView()
  })

  feedNav.addEventListener("click", () => {
    // Show feed view
    showFeedView()
  })

  aboutNav.addEventListener("click", () => {
    alert("About page is not implemented in this demo")
  })

  logoutNav.addEventListener("click", () => {
    // Clear user data and redirect to login page
    localStorage.removeItem("mockUser")
    window.location.href = "index.html"
  })
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init)
