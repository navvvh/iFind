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
    const postModal = document.getElementById("post-modal");
    const postForm = document.getElementById("post-form");
    const editModal = document.getElementById("edit-modal");
    const editForm = document.getElementById("edit-form");

    const AVATAR_EMOJIS = ["👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍🏫", "👩‍🏫", "👨‍💻", "👩‍💻", "🧑‍🎨", "👨‍🔬", "👩‍🔬", "👨‍🎨"];

    // --- 1. INITIALIZATION ---
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

    function getCurrentUserFromStorage() {
        const data = JSON.parse(localStorage.getItem("ifindUserData")) || {};
        if (!data.name) return {};
        return {
            id: data.id,
            name: data.name,
            initials: data.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
            avatarId: data.avatarId,
            completedSetup: data.completedSetup || false,
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

    // UPDATED: Added full navigation
    function attachEventListeners() {
        document.getElementById("add-post-btn").addEventListener("click", () => openPostModal());
        document.getElementById("close-modal").addEventListener("click", () => closePostModal());
        postForm.addEventListener("submit", handlePostSubmit);
        document.getElementById("close-edit-modal").addEventListener("click", () => closeEditModal());
        editForm.addEventListener("submit", handleEditSubmit);
        searchInput.addEventListener("input", () => displayPosts(filterPosts()));
        document.getElementById("nav-logout").addEventListener("click", handleLogout);
        
        // --- Sidebar Navigation ---
        document.getElementById("nav-feed").addEventListener("click", () => window.location.reload());
        document.getElementById("nav-claimed").addEventListener("click", () => window.location.href = 'claim.html');
        document.getElementById("nav-profile").addEventListener("click", () => alert("Profile page not implemented yet."));
        document.getElementById("nav-about").addEventListener("click", () => alert("About page not implemented yet."));
    }

    // --- 2. DATA HANDLING (API Calls) ---
    async function loadPosts() {
        try {
            // Main feed fetches 'lost' and 'found' posts by default (no post_type specified)
            const postsResponse = await window.iFindAPI.Post.getAllPosts({ userId: currentUser.id });
            if (!postsResponse.success) throw new Error("Failed to fetch posts");
            
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
  
    async function handlePostSubmit(event) {
        event.preventDefault();
        const postData = {
            user_id: currentUser.id,
            description: document.getElementById("post-description").value,
            campus: document.getElementById("post-location").value,
            post_type: document.getElementById("post-type").value,
        };
        try {
            const response = await window.iFindAPI.Post.createPost(postData);
            if (response.success) { closePostModal(); await loadPosts(); } 
            else { alert("Error creating post: " + (response.error || "Unknown error")); }
        } catch (error) { alert("An error occurred. Please try again."); }
    }
  
    async function handleEditSubmit(event) {
        event.preventDefault();
        if (!editingPostId) return;
        const postData = {
            description: document.getElementById("edit-description").value,
            campus: document.getElementById("edit-location").value,
            post_type: document.getElementById("edit-type").value,
        };
        try {
            const response = await window.iFindAPI.Post.updatePost(editingPostId, postData);
            if (response.success) { closeEditModal(); await loadPosts(); } 
            else { alert("Error updating post: " + (response.error || "Unknown error")); }
        } catch (error) { alert("An error occurred while updating. Please try again."); }
    }

    window.deletePost = async (postId) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await window.iFindAPI.Post.deletePost(postId);
                if(response.success) { await loadPosts(); } 
                else { alert("Error deleting post: " + (response.error || "Unknown error")); }
            } catch (error) { alert("An error occurred while deleting the post."); }
        }
    }
  
    window.handleCommentSubmit = async (postId, button) => {
        const input = button.previousElementSibling;
        const commentText = input.value.trim();
        if (!commentText) return;
        const commentData = { post_id: postId, user_id: currentUser.id, comment_text: commentText };
        try {
            const response = await window.iFindAPI.Comment.addComment(commentData);
            if (response.success) { input.value = ''; await loadPosts(); } 
            else { alert("Error adding comment: " + (response.error || "Unknown error")); }
        } catch (error) { alert("An error occurred while commenting."); }
    }
  
    window.markAsClaimed = async (postId) => {
        const post = allPosts.find(p => p.post_id === postId);
        if (!post) return;
        const postData = { description: post.description, campus: post.campus, post_type: 'claimed' };
        try {
            const response = await window.iFindAPI.Post.updatePost(postId, postData);
            if (response.success) { await loadPosts(); } 
            else { alert("Error marking as claimed: " + (response.error || "Unknown error")); }
        } catch (error) { alert("An error occurred while updating the post."); }
    }
    
    window.toggleLike = async (postId) => {
        const post = allPosts.find(p => p.post_id === postId);
        if (!post) return;
        try {
            const response = post.has_liked
                ? await window.iFindAPI.Like.removeLike(postId, currentUser.id)
                : await window.iFindAPI.Like.addLike(postId, currentUser.id);

            if (response.success) {
                post.has_liked = !post.has_liked;
                post.like_count = post.has_liked ? (post.like_count || 0) + 1 : (post.like_count || 1) - 1;
                const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
                if(postElement) updateLikeButtonUI(postElement, post);
            } else { console.error("Failed to toggle like:", response.error); }
        } catch (error) { console.error("Error toggling like:", error); }
    };

    // --- 3. UI RENDERING & INTERACTIONS ---
    function updateLikeButtonUI(postElement, post) {
        const likeButton = postElement.querySelector('.like-btn');
        const heartIcon = likeButton.querySelector('i');
        const likeText = likeButton.querySelector('span');
        if (post.has_liked) {
            likeButton.classList.add('liked');
            heartIcon.className = 'fas fa-heart';
        } else {
            likeButton.classList.remove('liked');
            heartIcon.className = 'far fa-heart';
        }
        likeText.textContent = `Heart (${post.like_count || 0})`;
    }

    function filterPosts() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) return allPosts;
        return allPosts.filter(post => 
            (post.description && post.description.toLowerCase().includes(searchTerm)) ||
            (post.campus && post.campus.toLowerCase().includes(searchTerm))
        );
    }

    function displayPosts(postsToDisplay) {
        feed.innerHTML = '';
        if (!postsToDisplay || postsToDisplay.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            postsToDisplay.forEach(post => {
                feed.appendChild(createPostElement(post));
            });
        }
    }

    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = `post ${post.post_type === 'claimed' ? 'claimed' : ''}`;
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
                        <button class="dropdown-item" onclick="openEditModal(${post.post_id})"><i class="fas fa-edit"></i> Edit</button>
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
                <div class="post-action">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
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

    // --- 4. MODAL & MISC UI FUNCTIONS ---
    function openPostModal() { postModal.style.display = 'flex'; }
    function closePostModal() { postModal.style.display = 'none'; postForm.reset(); }
    window.openEditModal = (postId) => {
        editingPostId = postId;
        const post = allPosts.find(p => p.post_id === postId);
        if (!post) return;
        document.getElementById("edit-type").value = post.post_type;
        document.getElementById("edit-location").value = post.campus;
        document.getElementById("edit-description").value = post.description;
        editModal.style.display = 'flex';
    }
    function closeEditModal() { editModal.style.display = 'none'; editForm.reset(); editingPostId = null; }
    function handleLogout() {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    }

    initializeApp();
});