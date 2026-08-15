const SUPABASE_URL = "https://paotmlgoayixvwozvohp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XX-Ofl8fQ1JL7n6Ei6kFdw_sb5bT-xk";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


async function loadPosts()
{
    const { data, error } = await supabaseClient
        .from("posts")
        .select('id, "user_id", title, user_info_name, content, created_at')
        .order("created_at", { ascending: false });

    if (error)
    {
        console.error("Supabase error:", error);
        return;
    }

    const postsContainer = document.getElementById("content");

    postsContainer.innerHTML = data.map(post => `
        <article class="post" id="${post.user_id}">
            <div class="post_header">
                <span class="post_user">${post.user_info_name}</span>

                <span class="post_date">
                    ${new Date(post.created_at).toLocaleDateString()}
                </span>
            </div>

            <div class="post_content">
                <h2>${post.title}</h2>
                <p>${post.content}</p>
            </div>
        </article>
    `).join("");
}

async function logout()
{
    const { error } = await supabaseClient.auth.signOut();

    if (error)
    {
        console.error("Logout error:", error);
        return;
    }

    console.log("Logged out successfully.");

    window.location.href = "./Authentication/Signin/";
}

function loadPage()
{
    window.location.href = "./index.html";
}


async function OnLoad()
{
    const { data: { session } } =
    await supabaseClient.auth.getSession();

if (session)
{
    const elements =
        document.getElementsByClassName("loggedInShow");

    for (const element of elements)
    {
        element.style.display = "";
    }

    document.title = "Linkup Social | Logged In";
}

else
{
    window.location.href = "./Authentication/Signin/";
}
}


async function initialize()
{
    OnLoad();
    await loadPosts();
}


initialize();