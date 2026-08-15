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
        .select('id, "user_id", title, content, created_at')
        .order("created_at", { ascending: false });

    if (error)
    {
        console.error("Supabase error:", error);
        return;
    }

    const postsContainer = document.getElementById("content");

    postsContainer.innerHTML = data.map(post => `
        <article class="post" id="${post.id}">
            <div class="post_header">
                <span class="post_user">${post.user_id}</span>

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


function loadPage()
{
    window.location.href = "./index.html";
}


function OnLoad()
{
    if (window.isLoggedIn)
    {
        const elements = document.getElementsByClassName("loggedInShow");

        for (const element of elements)
        {
            element.style.display = "";
        }

        document.title = "Linkup Social | Logged In";
    }
}


async function initialize()
{
    OnLoad();
    await loadPosts();
}


initialize();