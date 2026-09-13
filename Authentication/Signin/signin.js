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


// ==========================================
// URL ARGUMENTS
// ==========================================

const urlParams = new URLSearchParams(window.location.search);

const redirect = (urlParams.get("redirect") || "")
    .trim()
    .toLowerCase();

console.log("Current URL:", window.location.href);
console.log("Redirect argument:", redirect);


// ==========================================
// REDIRECT FUNCTION
// ==========================================

function handleRedirect()
{
    console.log("Handling redirect:", redirect);

    switch (redirect)
    {
        case "social":

            console.log("Redirecting to Social");

            window.location.href = "../../";
            break;


        case "home_ads":

            console.log("Redirecting to Home Ads");

            window.location.href = "../../ads";
            break;


        case "settings":

            console.log("Redirecting to Settings");

            window.location.href = "../../Account/";
            break;


        case "sign_profile":

            console.log("Redirecting to Signup");

            window.location.href = "../Signup/";
            break;


        default:

            console.log(
                "No redirect argument. Using default."
            );

            window.location.href = "../../index.html";
            break;
    }
}


// ==========================================
// CHECK IF ALREADY LOGGED IN
// ==========================================

async function checkExistingSession()
{
    try
    {
        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error)
        {
            console.error(
                "Session check error:",
                error
            );

            return;
        }


        // User is already logged in
        if (data.session)
        {
            console.log(
                "User is already logged in."
            );

            console.log(
                "User ID:",
                data.session.user.id
            );

            handleRedirect();

            return;
        }


        console.log(
            "No existing session. Showing login page."
        );
    }
    catch (err)
    {
        console.error(
            "Failed to check session:",
            err
        );
    }
}


// ==========================================
// RUN SESSION CHECK
// ==========================================

checkExistingSession();


// ==========================================
// LOGIN FORM
// ==========================================

document.getElementById("loginForm").addEventListener(
    "submit",
    async function (event)
    {
        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const errorElement =
            document.getElementById("loginError");

        errorElement.textContent = "";


        // ==========================================
        // VALIDATE
        // ==========================================

        if (!email || !password)
        {
            errorElement.textContent =
                "Please enter your email and password.";

            return;
        }


        // ==========================================
        // LOGIN
        // ==========================================

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        // ==========================================
        // LOGIN ERROR
        // ==========================================

        if (error)
        {
            console.error(
                "Supabase login error:",
                error
            );

            errorElement.textContent =
                error.message;

            return;
        }


        // ==========================================
        // CHECK SESSION
        // ==========================================

        if (!data.session)
        {
            errorElement.textContent =
                "Login failed.";

            return;
        }


        console.log("Successfully logged in.");
        console.log("User ID:", data.user.id);


        // ==========================================
        // REDIRECT
        // ==========================================

        handleRedirect();
    }
);
