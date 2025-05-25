 // DOM Elements
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        const addPostBtn = document.getElementById('add-post-btn');
        const postModal = document.getElementById('post-modal');
        const filterModal = document.getElementById('filter-modal');
        const closeModal = document.getElementById('close-modal');
        const closeFilterModal = document.getElementById('close-filter-modal');
        const cancelPost = document.getElementById('cancel-post');
        const postForm = document.getElementById('post-form');
        const feed = document.getElementById('feed');
        const emptyState = document.getElementById('empty-state');
        const fileInput = document.getElementById('post-image');
        const fileName = document.getElementById('file-name');
        const filterBtn = document.getElementById('filter-btn');
        const searchInput = document.getElementById('search-input');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const profilePicNav = document.getElementById('profile-pic-nav');
        const navProfile = document.getElementById('nav-profile');

        // Store all posts for filtering
        let allPosts = [];
        let currentFilters = {
            types: [],
            locations: []
        };

        // Navigation - Go to Profile
        profilePicNav.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });

        navProfile.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });

        // Mobile sidebar toggle
        hamburgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Modal functions
        function openPostModal() {
            postModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closePostModal() {
            postModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            postForm.reset();
            fileName.textContent = '';
        }

        function openFilterModal() {
            filterModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeFilterModalFunc() {
            filterModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Event listeners for modals
        addPostBtn.addEventListener('click', openPostModal);
        closeModal.addEventListener('click', closePostModal);
        cancelPost.addEventListener('click', closePostModal);
        filterBtn.addEventListener('click', openFilterModal);
        closeFilterModal.addEventListener('click', closeFilterModalFunc);

        // Close modals when clicking outside
        postModal.addEventListener('click', function(event) {
            if (event.target === postModal) {
                closePostModal();
            }
        });

        filterModal.addEventListener('click', function(event) {
            if (event.target === filterModal) {
                closeFilterModalFunc();
            }
        });

        // File input handler
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                fileName.textContent = file.name;
            } else {
                fileName.textContent = '';
            }
        });

        // Search functionality
        searchInput.addEventListener('input', function() {
            filterPosts();
        });

        // Filter functionality
        clearFiltersBtn.addEventListener('click', function() {
            document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
        });

        applyFiltersBtn.addEventListener('click', function() {
            // Get selected types
            currentFilters.types = [];
            document.querySelectorAll('.filter-checkbox[data-type]').forEach(checkbox => {
                if (checkbox.checked) {
                    currentFilters.types.push(checkbox.dataset.type);
                }
            });

            // Get selected locations
            currentFilters.locations = [];
            document.querySelectorAll('.filter-checkbox[data-location]').forEach(checkbox => {
                if (checkbox.checked) {
                    currentFilters.locations.push(checkbox.dataset.location);
                }
            });

            filterPosts();
            closeFilterModalFunc();
        });

        // Filter posts function
        function filterPosts() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredPosts = allPosts.filter(post => {
                const matchesSearch = post.description.toLowerCase().includes(searchTerm) ||
                                    post.location.toLowerCase().includes(searchTerm);
                const matchesType = currentFilters.types.length === 0 || currentFilters.types.includes(post.type);
                const matchesLocation = currentFilters.locations.length === 0 || currentFilters.locations.includes(post.location);
                
                return matchesSearch && matchesType && matchesLocation;
            });

            displayPosts(filteredPosts);
        }

        // Display posts function
        function displayPosts(posts) {
            const postsContainer = document.getElementById('feed');
            
            // Clear current posts (except empty state)
            const existingPosts = postsContainer.querySelectorAll('.post');
            existingPosts.forEach(post => post.remove());

            if (posts.length === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                posts.forEach((post, index) => {
                    const postElement = createPostElement(post, index);
                    postsContainer.appendChild(postElement);
                });
            }
        }

        // Create post element function 
        function createPostElement(postData, index) {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.dataset.type = postData.type;
            postElement.dataset.location = postData.location;
            
            const imageHTML = postData.image ? 
                `<img src="${postData.image}" alt="${postData.type} item" class="post-image">` : '';

            const avatarHTML = `
                <div class="profile-pic">
                    <img src="assets/avatars/${postData.userInitials.toLowerCase()}.png" alt="${postData.userName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="default-avatar" style="display: none;">${postData.userInitials}</div>
                </div>
            `;

            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-user">
                        ${avatarHTML}
                        <div class="post-user-info">
                            <div class="post-user-name">${postData.userName}</div>
                            <div class="post-user-meta">${postData.userHandle}<br>${postData.userRole}</div>
                        </div>
                    </div>
                    <div class="post-options" onclick="togglePostOptions(this)">
                        <i class="fas fa-ellipsis-h"></i>
                        <div class="post-options-dropdown">
                            <div class="dropdown-item">
                                <i class="fas fa-edit"></i>
                                <span>Edit</span>
                            </div>
                            <div class="dropdown-item">
                                <i class="fas fa-check"></i>
                                <span>Claimed</span>
                            </div>
                            <div class="dropdown-item">
                                <i class="fas fa-trash"></i>
                                <span>Delete</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-text">
                        <span class="post-tag ${postData.type}">${postData.type.charAt(0).toUpperCase() + postData.type.slice(1)}</span>
                        ${postData.description} — ${postData.location}
                    </div>
                    ${imageHTML}
                </div>
                <div class="post-actions">
                    <div class="post-action">
                        <i class="far fa-heart"></i>
                        <span>Heart</span>
                    </div>
                    <div class="post-action">
                        <i class="far fa-comment"></i>
                        <span>COMMENT</span>
                    </div>
                    <div class="post-action">
                        <i class="fas fa-share"></i>
                        <span>SHARE</span>
                    </div>
                </div>
                <div class="post-comments">
                    <div class="comment-input">
                        <div class="profile-pic">
                            <img src="assets/default-avatar.png" alt="Your Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="default-avatar" style="display: none;">AP</div>
                        </div>
                        <input type="text" class="comment-text" placeholder="Write your comment...">
                        <button class="send-comment">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;

            return postElement;
        }

        // Toggle post options dropdown
        function togglePostOptions(element) {
            const dropdown = element.querySelector('.post-options-dropdown');
            const isVisible = dropdown.style.display === 'block';
            
            // Hide all other dropdowns
            document.querySelectorAll('.post-options-dropdown').forEach(d => {
                d.style.display = 'none';
            });
            
            // Toggle current dropdown
            dropdown.style.display = isVisible ? 'none' : 'block';
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.post-options')) {
                document.querySelectorAll('.post-options-dropdown').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });

        // Form submission
        postForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const postType = document.getElementById('post-type').value;
            const postLocation = document.getElementById('post-location').value;
            const postDescription = document.getElementById('post-description').value;
            const postImage = document.getElementById('post-image').files[0];

            const newPost = {
                type: postType,
                location: postLocation,
                description: postDescription,
                image: postImage ? URL.createObjectURL(postImage) : null,
                userName: 'You',
                userHandle: '@user',
                userRole: 'STUDENT',
                userInitials: 'AP',
                timestamp: new Date()
            };

            // Add to posts array
            allPosts.unshift(newPost);
            
            // Refresh display
            filterPosts();

            closePostModal();
        });