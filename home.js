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

   postElement.innerHTML = `
    <div class="post_header">
        <div class="post_user">
            ${escapeHTML(username)}
        </div>

        <div class="post_date">
            ${escapeHTML(postDate)}
        </div>
    </div>

    <div class="post_content">
        ${escapeHTML(post.title || "")}
    </div>
`;
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

    window.location.href = "./Auth/Signin/";
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
    const elementsHide =
        document.getElementsByClassName("loggedInHide");

    for (const element of elements)
    {
        element.style.display = "";
    }

    for (const elementHide of elementsHide)
    {
        elementHide.style.display = "none";
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