const SUPABASE_URL = "https://paotmlgoayixvwozvohp.supabase.co";
        const SUPABASE_ANON_KEY = "sb_publishable_XX-Ofl8fQ1JL7n6Ei6kFdw_sb5bT-xk";

        const supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );

        let postsLoading = false;

        async function getCurrentUser() {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error) {
                console.error("Unable to get current user:", error);
                return null;
            }
            return user;
        }

        async function getCurrentProfile() {
            const user = await getCurrentUser();
            if (!user) return null;

            const { data: profile, error } = await supabaseClient
                .from("profiles")
                .select("username, is_platformadmin")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Unable to load profile:", error);
                return null;
            }
            return profile;
        }

        async function updateLoginUI() {
            const user = await getCurrentUser();
            const loggedInElements = document.querySelectorAll(".loggedInShow");
            const loggedOutElements = document.querySelectorAll(".loggedInHide");
            const usernameDisplay = document.getElementById("sidebarUsername");
            const statusDisplay = document.getElementById("sidebarStatus");

            if (user) {
                loggedInElements.forEach(element => element.style.display = "");
                loggedOutElements.forEach(element => element.style.display = "none");

                const profile = await getCurrentProfile();
                const username = profile?.username || "User";

                if (usernameDisplay) usernameDisplay.textContent = username;
                if (statusDisplay) statusDisplay.textContent = "Logged In";
                document.title = "SupaSocial | Logged In";
            } else {
                loggedInElements.forEach(element => element.style.display = "none");
                loggedOutElements.forEach(element => element.style.display = "");

                if (usernameDisplay) usernameDisplay.textContent = "Guest";
                if (statusDisplay) statusDisplay.textContent = "Logged Out";
                document.title = "SupaSocial | Logged Out";
            }
        }

        function scrollPostsToBottom() {
            const contentArea = document.getElementById("content");
            if (!contentArea) return;

            requestAnimationFrame(() => {
                contentArea.scrollTop = contentArea.scrollHeight;
            });
        }

        async function loadPosts() {
            if (postsLoading) return;
            postsLoading = true;

            const contentArea = document.getElementById("content");
            if (!contentArea) {
                console.error("Content area was not found.");
                postsLoading = false;
                return;
            }

            contentArea.querySelectorAll(".post").forEach(post => post.remove());

            const { data: posts, error } = await supabaseClient
                .from("posts")
                .select(`
                    id,
                    user_id,
                    title,
                    content,
                    created_at,
                    profiles ( username )
                `)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Unable to load posts:", error);
                const errorElement = document.createElement("article");
                errorElement.className = "post";
                errorElement.innerHTML = `
                    <div class="post_avatar">!</div>
                    <div class="post_body">
                        <div class="post_header">
                            <span class="post_user">SupaSocial</span>
                            <span class="post_date">Error</span>
                        </div>
                        <div class="post_content">
                            Unable to load posts.<br>${escapeHTML(error.message)}
                        </div>
                    </div>
                `;
                contentArea.appendChild(errorElement);
                postsLoading = false;
                return;
            }

            if (!posts || posts.length === 0) {
                const emptyElement = document.createElement("article");
                emptyElement.className = "post";
                emptyElement.innerHTML = `
                    <div class="post_avatar"><img src="CDN/Supabase64.png" width="24"></div>
                    <div class="post_body">
                        <div class="post_header">
                            <span class="post_user">SupaSocial</span>
                            <span class="post_date">Now</span>
                        </div>
                        <div class="post_content">No posts yet.</div>
                    </div>
                `;
                contentArea.appendChild(emptyElement);
                postsLoading = false;
                return;
            }

            const profile = await getCurrentProfile();
            const is_platformadmin = profile?.is_platformadmin === true;

            posts.forEach(post => {
                const postElement = document.createElement("article");
                postElement.className = "post";
                postElement.id = `post-${post.id}`;

                const username = post.profiles?.username || "Anonymous";
                const postDate = new Date(post.created_at).toLocaleString();
                const message = post.content ?? post.title ?? "";
                const initial = username.charAt(0).toUpperCase();

                postElement.innerHTML = `
                    <div class="post_avatar"><img src="CDN/User64.png" width="24"></div>
                    <div class="post_body">
                        <div class="post_header">
                            <span class="post_user">${escapeHTML(username)}</span>
                            <span class="post_date">${escapeHTML(postDate)}</span>
                            ${is_platformadmin ? `
                                <button class="delete_post" type="button" title="Delete post" onclick="deletePost('${escapeHTML(post.id)}')">
                                    Delete
                                </button>
                            ` : ""}
                        </div>
                        <div class="post_content">${escapeHTML(message)}</div>
                    </div>
                `;
                contentArea.appendChild(postElement);
            });

            postsLoading = false;
            scrollPostsToBottom();
        }

        async function sendPost() {
            const input = document.getElementById("messageInput");
            if (!input) return;

            const text = input.value.trim();
            if (!text) return;

            const user = await getCurrentUser();
            if (!user) {
                alert("You must be signed in to create a post.");
                return;
            }

            const { error } = await supabaseClient.from("posts").insert({
                user_id: user.id,
                content: text,
                title: text,
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error("Unable to create post:", error);
                alert("Unable to create post:\n\n" + error.message);
                return;
            }

            input.value = "";
            await loadPosts();
            scrollPostsToBottom();
        }

        async function deletePost(postId) {

            const profile = await getCurrentProfile();
            if (!profile?.is_platformadmin) {
                alert("You do not have permission to delete posts.");
                return;
            }

            const { error } = await supabaseClient.from("posts").delete().eq("id", postId);
            if (error) {
                console.error("Unable to delete post:", error);
                alert("Unable to delete post:\n\n" + error.message);
                return;
            }

            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) postElement.remove();
        }

        function escapeHTML(value) {
            const div = document.createElement("div");
            div.textContent = String(value ?? "");
            return div.innerHTML;
        }

        async function logout() {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error("Logout failed:", error);
                alert("Unable to log out:\n\n" + error.message);
                return;
            }
            window.location.href = "Auth/Signin/";
        }

        document.addEventListener("DOMContentLoaded", async function () {
            await updateLoginUI();
            await loadPosts();

            const postButton = document.querySelector(".message_button");
            if (postButton) {
                postButton.addEventListener("click", sendPost);
            }

            const messageInput = document.getElementById("messageInput");
            if (messageInput) {
                messageInput.addEventListener("keydown", function (event) {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendPost();
                    }
                });
            }
        });

        supabaseClient.auth.onAuthStateChange(async function () {
            await updateLoginUI();
        });