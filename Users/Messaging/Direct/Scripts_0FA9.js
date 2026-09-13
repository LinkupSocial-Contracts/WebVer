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

async function getCurrentUser()
{
    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error)
    {
        console.error(
            "Could not get current user:",
            error
        );

        return null;
    }

    return data.user;
}


// ==========================================
// LOAD USERS INTO DM LIST
// ==========================================

async function loadDMList()
{
    const dmList =
        document.getElementById("dm-list");

    dmList.innerHTML = "";


    const {
        data: users,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("id, username")
            .neq("id", currentUser.id)
            .order("username");


    if (error)
    {
        console.error(
            "Failed to load users:",
            error
        );

        dmList.innerHTML =
            "<p>Unable to load users.</p>";

        return;
    }


    if (!users || users.length === 0)
    {
        dmList.innerHTML =
            "<p>No users available.</p>";

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


        button
            .querySelector("strong")
            .textContent = user.username;


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


    document
        .getElementById("dmUsername")
        .textContent = user.username;


    document
        .getElementById("messageInput")
        .placeholder =
            "Message " + user.username;


    // Highlight selected conversation

    document
        .querySelectorAll(".dm-item")
        .forEach(item =>
        {
            item.classList.remove("active");
        });


    const buttons =
        document.querySelectorAll(".dm-item");


    buttons.forEach(button =>
    {
        const username =
            button.querySelector("strong");

        if (
            username &&
            username.textContent === user.username
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
    if (!selectedUser)
    {
        return;
    }


    const content =
        document.getElementById("content");


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


    const article =
        document.createElement("article");

    article.className = "post";


    const isMine =
        message.sender_id === currentUser.id;


    const username =
        isMine
            ? "You"
            : selectedUser.username;


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


    content.appendChild(article);

    users.forEach((user, index) =>
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
            <span>Start a conversation</span>
        </div>
    `;

    button
        .querySelector("strong")
        .textContent = user.username;

    button.addEventListener(
        "click",
        () =>
        {
            openDM(user);
        }
    );

    dmList.appendChild(button);


    // Automatically open the first user
    if (index === 0)
    {
        openDM(user);
    }
});
}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage()
{
    if (!selectedUser)
    {
        return;
    }


    const input =
        document.getElementById(
            "messageInput"
        );


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
                sender_id: currentUser.id,
                recipient_id: selectedUser.id,
                content: message
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


    // Add message immediately

    displayMessage(data);

    scrollMessagesToBottom();
}


// ==========================================
// ENTER TO SEND
// ==========================================

document
    .getElementById("messageInput")
    .addEventListener(
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


// ==========================================
// SEND BUTTON
// ==========================================

document
    .getElementById("sendMessageButton")
    .addEventListener(
        "click",
        sendMessage
    );


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


                if (!selectedUser)
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


                // Don't display our own message twice
                // because sendMessage() already displayed it.

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
        document.getElementById("content");

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

    div.textContent = value;

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

    setupRealtime();
}


initializeDMs();