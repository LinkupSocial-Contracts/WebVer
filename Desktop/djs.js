
let downloadInProgress = false;

function JsDownloadDesktop() {
    if (downloadInProgress) {
        alert("File Already Downloading,\nCannot Download Again\nError: 0xff");
        return;
    }

    const userConfirmed = window.confirm("Download The Desktop App?");

    if (userConfirmed) {
        downloadInProgress = true;

        console.log("Downloading Desktop Via API Call 20FF");
        console.log("If The Users WiFi Is Insufficient The DS Will Not Download");

        window.location.href = "../CDN/setup.exe";
    } else {
        alert("The Download Was Cancelled");

        console.log("User Cancelled The API Request 20FF");
        console.log("Download request cancelled by user.");
    }
    function StartTimer() {
    clearInterval(timerInterval);

    timeLeft = 10;

    timerInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft <= 0) {
            downloadInProgress = false;
        }
    }, 1000);
}
}
