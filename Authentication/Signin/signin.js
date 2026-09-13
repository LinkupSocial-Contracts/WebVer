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

// Example:
// ?redirect=social
// ?redirect=settings
// ?redirect=home

const redirect = urlParams.get("redirect");
const redirect = urlParams.get("loggedin");


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


        // ------------------------------
        // Validate input
        // ------------------------------

        if (!email || !password)
        {
            errorElement.textContent =
                "Please enter your email and password.";

            return;
        }


        // ------------------------------
        // Login
        // ------------------------------

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        // ------------------------------
        // Login error
        // ------------------------------

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


        // ------------------------------
        // Make sure session exists
        // ------------------------------

        if (!data.session)
        {
            errorElement.textContent =
                "Login failed.";

            return;
        }


        console.log("Successfully logged in.");
        console.log("User ID:", data.user.id);


        // ==========================================
        // REDIRECT ARGUMENT HANDLING
        // ==========================================
        switch (redirect)
        {
            case "social":

                // Go to the main social page
                window.location.href =
                    "../../";

                break;


            case "home_ads":

                // Go to the main home page
                window.location.href =
                    "../../ads";

                break;


            case "settings":

                // Go to account settings
                window.location.href =
                    "../Account/";

                break;


            case "sign_profile":

                // Go to signup page
                window.location.href =
                    "../Signup/";

                break;


            default:

                // No redirect argument,
                // or an unknown redirect argument.

                window.location.href =
                    "../../index.html";

                break;
        }
    }
);