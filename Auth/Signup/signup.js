const SUPABASE_URL =
    "https://paotmlgoayixvwozvohp.supabase.co";

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


document.getElementById("signupForm").addEventListener(
    "submit",
    async function (event)
    {
        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const errorElement =
            document.getElementById("signupError");

        errorElement.textContent = "";


        if (username.length < 3)
        {
            errorElement.textContent =
                "Username must be at least 3 characters.";

            return;
        }


        if (password.length < 8)
        {
            errorElement.textContent =
                "Password must be at least 8 characters.";

            return;
        }


        // Create the Supabase Auth account
        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });


        if (error)
        {
            console.error("Signup error:", error);

            errorElement.textContent =
                error.message;

            return;
        }


        if (!data.user)
        {
            errorElement.textContent =
                "Account creation failed.";

            return;
        }


        // Create the user's profile
        const { error: profileError } =
            await supabaseClient
                .from("profiles")
                .insert({
                    id: data.user.id,
                    username: username
                });


        if (profileError)
        {
            console.error(
                "Profile creation error:",
                profileError
            );

            errorElement.textContent =
                "Account was created, but your profile could not be created.";

            return;
        }


        console.log("Account created:", data.user.id);

        window.location.href = "../../index.html";
    }
);