// ==========================================
// SUPABASE CLIENT
// ==========================================

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

// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("Unable to get current user:", error);
        return null;
    }

    return user;
}

// ==========================================
// GET CURRENT PROFILE
// ==========================================

async function getCurrentProfile(user) {
    if (!user) return null;

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("username, is_betatester")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Unable to load profile:", error);
        return null;
    }

    return profile;
}

// ==========================================
// UPDATE LOGIN AND BETA UI
// ==========================================

async function updateLoginUI() {
    const betaButton = document.getElementById("betabtn");
    const usernameDisplay =
        document.getElementById("sidebarUsername");
    const statusDisplay =
        document.getElementById("sidebarStatus");

    const loggedInElements =
        document.querySelectorAll(".loggedInShow");
    const loggedOutElements =
        document.querySelectorAll(".loggedInHide");

    // Hide Beta Features by default.
    if (betaButton) {
        betaButton.style.display = "none";
    }

    const user = await getCurrentUser();

    // ==========================================
    // LOGGED OUT
    // ==========================================

    if (!user) {
        loggedInElements.forEach(element => {
            element.style.display = "none";
        });

        loggedOutElements.forEach(element => {
            element.style.display = "";
        });

        if (usernameDisplay) {
            usernameDisplay.textContent = "Guest";
        }

        if (statusDisplay) {
            statusDisplay.textContent = "Logged Out";
        }

        document.title = "SupaSocial | Logged Out";
        return;
    }

    // ==========================================
    // LOGGED IN
    // ==========================================

    loggedInElements.forEach(element => {
        element.style.display = "";
    });

    loggedOutElements.forEach(element => {
        element.style.display = "none";
    });

    const profile = await getCurrentProfile(user);

    if (usernameDisplay) {
        usernameDisplay.textContent =
            profile?.username || "User";
    }

    if (statusDisplay) {
        statusDisplay.textContent = "Logged In";
    }

    document.title = "SupaSocial | Logged In";

    // Show Beta Features if is_betatester is false.
    if (
        profile?.is_betatester === false &&
        betaButton
    ) {
        betaButton.style.display = "";
    }
}

// ==========================================
// LOG OUT
// ==========================================

async function logout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout failed:", error);
        alert("Unable to log out. Please try again.");
        return;
    }

    await updateLoginUI();
}

// ==========================================
// AUTH STATE CHANGES
// ==========================================

supabaseClient.auth.onAuthStateChange((event) => {
    if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "TOKEN_REFRESHED"
    ) {
        setTimeout(() => {
            updateLoginUI();
        }, 0);
    }
});

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    updateLoginUI();
});