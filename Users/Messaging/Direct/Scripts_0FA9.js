const SUPABASE_URL =
    "https://paotmlgoayixvwozvohp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_XX-Ofl8fQ1JL7n6Ei6kFdw_sb5bT-xk";

const supabaseClient =
    window.supabase.createClient(
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


// ==========================================
// STATE
// ==========================================

let currentUser = null;
let selectedUser = null;


// ==========================================
// GET CURRENT USER
// ==========================================

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

        document.addEventListener("DOMContentLoaded", async function () {
            await updateLoginUI();
        });

        supabaseClient.auth.onAuthStateChange(async function () {
            await updateLoginUI();
        });


// ==========================================
// LOAD USERS INTO DM LIST
// ==========================================

async function loadDMList()
{
    const dmList =
        document.getElementById("dm-list");

    if (!dmList)
    {
        console.error("DM list element not found.");
        return;
    }

    dmList.innerHTML = `
        <div class="dm-list-header">
            <strong>Direct Messages</strong>
        </div>

        <p>Loading users...</p>
    `;


    const {
        data: users,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("id, username")
            .neq("id", currentUser.id)
            .order("username", {
                ascending: true
            });


    if (error)
    {
        console.error(
            "Failed to load users:",
            error
        );

        dmList.innerHTML = `
            <div class="dm-list-header">
                <strong>Direct Messages</strong>
            </div>

            <p>Unable to load users.</p>
        `;

        return;
    }


    dmList.innerHTML = `
        <div class="dm-list-header">
            <strong>Direct Messages</strong>
        </div>
    `;


    if (!users || users.length === 0)
    {
        dmList.innerHTML += `
            <p>No users available.</p>
        `;

        return;
    }


    users.forEach(user =>
    {
        const button =
            document.createElement("button");

        button.className = "dm-item";


        button.innerHTML = `
            <div class="dm-avatar">
                <img
                    src="../../../CDN/User64.png"
                    width="40"
                >
            </div>

            <div class="dm-info">
                <strong></strong>

                <span>
                    Start a conversation
                </span>
            </div>
        `;


        const username =
            button.querySelector("strong");

        if (username)
        {
            username.textContent =
                user.username;
        }


        button.addEventListener(
            "click",
            () =>
            {
                openDM(user);
            }
        );


        dmList.appendChild(button);
    });
}


// ==========================================
// OPEN DM
// ==========================================

async function openDM(user)
{
    selectedUser = user;


    const username =
        document.getElementById("dmUsername");

    if (username)
    {
        username.textContent =
            user.username;
    }


    const input =
        document.getElementById("messageInput");

    if (input)
    {
        input.placeholder =
            "Message " + user.username;
    }


    // Remove active state
    document
        .querySelectorAll(".dm-item")
        .forEach(item =>
        {
            item.classList.remove("active");
        });


    // Find selected user
    document
        .querySelectorAll(".dm-item")
        .forEach(button =>
        {
            const usernameElement =
                button.querySelector("strong");

            if (
                usernameElement &&
                usernameElement.textContent ===
                    user.username
            )
            {
                button.classList.add("active");
            }
        });


    await loadMessages();
}


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages()
{
    if (!currentUser || !selectedUser)
    {
        return;
    }


    const content =
        document.getElementById("content");

    if (!content)
    {
        console.error(
            "Content element not found."
        );

        return;
    }


    // Clear old messages ONCE
    content.innerHTML = "";


    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from("direct_messages")
            .select(`
                id,
                sender_id,
                recipient_id,
                content,
                created_at
            `)
            .or(
                `and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.${currentUser.id})`
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error)
    {
        console.error(
            "Failed to load messages:",
            error
        );

        content.innerHTML =
            "<p>Unable to load messages.</p>";

        return;
    }


    if (!messages || messages.length === 0)
    {
        content.innerHTML = `
            <div class="dm-empty">
                No messages yet.
            </div>
        `;

        return;
    }


    // Display EVERY message
    messages.forEach(message =>
    {
        displayMessage(message);
    });


    scrollMessagesToBottom();
}


// ==========================================
// DISPLAY MESSAGE
// ==========================================

function displayMessage(message)
{
    const content =
        document.getElementById("content");

    if (!content)
    {
        console.error(
            "Content element not found."
        );

        return;
    }


    const article =
        document.createElement("article");

    article.className = "post";


    const isMine =
        message.sender_id ===
        currentUser.id;


    let username =
        "Unknown User";


    if (isMine)
    {
        username = "You";
    }
    else if (selectedUser)
    {
        username =
            selectedUser.username;
    }


    const date =
        new Date(
            message.created_at
        ).toLocaleString();


    article.innerHTML = `
        <div class="post_avatar">
            <img
                src="../../../CDN/User64.png"
                width="40"
            >
        </div>

        <div class="post_body">

            <div class="post_header">

                <span class="post_user">
                    ${escapeHTML(username)}
                </span>

                <span class="post_date">
                    ${escapeHTML(date)}
                </span>

            </div>

            <div class="post_content">
                ${escapeHTML(message.content)}
            </div>

        </div>
    `;


    // IMPORTANT:
    // Only append the message.
    // Do NOT clear content here.
    content.appendChild(article);
}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage()
{
    if (!currentUser)
    {
        return;
    }


    if (!selectedUser)
    {
        return;
    }


    const input =
        document.getElementById(
            "messageInput"
        );

    if (!input)
    {
        console.error(
            "Message input not found."
        );

        return;
    }


    const message =
        input.value.trim();


    if (!message)
    {
        return;
    }


    input.disabled = true;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("direct_messages")
            .insert({
                sender_id:
                    currentUser.id,

                recipient_id:
                    selectedUser.id,

                content:
                    message
            })
            .select()
            .single();


    input.disabled = false;


    if (error)
    {
        console.error(
            "Failed to send message:",
            error
        );

        alert(
            "Unable to send message."
        );

        return;
    }


    input.value = "";


    /*
        Display immediately.

        The realtime handler below ignores
        our own messages, so this will not
        create a duplicate.
    */

    displayMessage(data);

    scrollMessagesToBottom();
}


// ==========================================
// ENTER TO SEND
// ==========================================

function setupMessageInput()
{
    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input)
    {
        console.error(
            "Message input not found."
        );

        return;
    }


    input.addEventListener(
        "keydown",
        function(event)
        {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            )
            {
                event.preventDefault();

                sendMessage();
            }
        }
    );
}


// ==========================================
// SEND BUTTON
// ==========================================

function setupSendButton()
{
    const button =
        document.getElementById(
            "sendMessageButton"
        );


    if (!button)
    {
        console.error(
            "Send button not found."
        );

        return;
    }


    button.addEventListener(
        "click",
        sendMessage
    );
}


// ==========================================
// REALTIME
// ==========================================

function setupRealtime()
{
    supabaseClient
        .channel("direct-messages")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "direct_messages"
            },
            payload =>
            {
                const message =
                    payload.new;


                if (
                    !currentUser ||
                    !selectedUser
                )
                {
                    return;
                }


                const belongsToCurrentDM =
                    (
                        message.sender_id ===
                            currentUser.id &&

                        message.recipient_id ===
                            selectedUser.id
                    )
                    ||
                    (
                        message.sender_id ===
                            selectedUser.id &&

                        message.recipient_id ===
                            currentUser.id
                    );


                if (!belongsToCurrentDM)
                {
                    return;
                }


                /*
                    sendMessage() already displays
                    our own message.

                    Therefore only display messages
                    coming FROM the other user.
                */

                if (
                    message.sender_id ===
                    currentUser.id
                )
                {
                    return;
                }


                displayMessage(message);

                scrollMessagesToBottom();
            }
        )
        .subscribe();
}


// ==========================================
// SCROLL
// ==========================================

function scrollMessagesToBottom()
{
    const content =
        document.getElementById(
            "content"
        );


    if (!content)
    {
        return;
    }


    content.scrollTop =
        content.scrollHeight;
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value)
{
    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ==========================================
// INITIALIZE
// ==========================================

async function initializeDMs()
{
    currentUser =
        await getCurrentUser();


    if (!currentUser)
    {
        console.log(
            "User is not logged in."
        );

        return;
    }


    console.log(
        "Logged in as:",
        currentUser.id
    );


    await loadDMList();


    setupMessageInput();

    setupSendButton();

    setupRealtime();
}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () =>
    {
        initializeDMs();
    }
);