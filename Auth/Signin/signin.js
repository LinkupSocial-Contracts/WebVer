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
// REDIRECT AFTER LOGIN
// ==========================================

function redirectToSocial()
{
    console.log("Redirecting to Linkup Social...");

    window.location.href = "../../";
}


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkExistingSession()
{
    try
    {
        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error)
        {
            console.error(
                "Session check error:",
                error
            );

            return;
        }


        // ==========================================
        // USER IS ALREADY LOGGED IN
        // ==========================================

        if (data && data.session)
        {
            console.log(
                "Existing Supabase session found."
            );

            console.log(
                "User ID:",
                data.session.user.id
            );

            redirectToSocial();

            return;
        }


        // ==========================================
        // NO SESSION = GUEST
        // ==========================================

        console.log(
            "No active session. User is a guest."
        );

        // IMPORTANT:
        // Do NOT redirect the guest.
        // They stay on the Sign In page.
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

const loginForm =
    document.getElementById("loginForm");


if (loginForm)
{
    loginForm.addEventListener(
        "submit",
        async function(event)
        {
            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const errorElement =
                document.getElementById(
                    "loginError"
                );


            const loginButton =
                document.getElementById(
                    "loginButton"
                );


            // ==========================================
            // CLEAR ERROR
            // ==========================================

            errorElement.textContent = "";


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!email || !password)
            {
                errorElement.textContent =
                    "Please enter your email and password.";

                return;
            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";


            try
            {
                // ==========================================
                // SUPABASE LOGIN
                // ==========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
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

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Log In";

                    return;
                }


                // ==========================================
                // VERIFY SESSION
                // ==========================================

                if (!data || !data.session)
                {
                    errorElement.textContent =
                        "Login failed. No session was created.";

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Log In";

                    return;
                }


                // ==========================================
                // SUCCESS
                // ==========================================

                console.log(
                    "Successfully logged in."
                );

                console.log(
                    "User ID:",
                    data.user.id
                );


                // ==========================================
                // REDIRECT
                // ==========================================

                redirectToSocial();
            }
            catch (err)
            {
                console.error(
                    "Unexpected login error:",
                    err
                );

                errorElement.textContent =
                    "An unexpected error occurred. Please try again.";

                loginButton.disabled = false;

                loginButton.textContent =
                    "Log In";
            }
        }
    );
}