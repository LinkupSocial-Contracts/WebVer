const SUPABASE_URL = "https://paotmlgoayixvwozvohp.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_XX-Ofl8fQ1JL7n6Ei6kFdw_sb5bT-xk";

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


// Login form
document.getElementById("loginForm").addEventListener("submit", async function (event)
{
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const errorElement = document.getElementById("loginError");

    errorElement.textContent = "";

    if (!email || !password)
    {
        errorElement.textContent = "Please enter your email and password.";
        return;
    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    if (error)
    {
        console.error("Supabase login error:", error);

        errorElement.textContent = error.message;
        return;
    }


    if (!data.session)
    {
        errorElement.textContent = "Login failed.";
        return;
    }


    console.log("Successfully logged in.");
    console.log("User ID:", data.user.id);


    // Supabase automatically persists the authenticated session.
    // Do NOT create a fake "loggedIn=true" cookie.
    
    window.location.href = "../../index.html";
});