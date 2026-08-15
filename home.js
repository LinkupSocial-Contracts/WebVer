function OnLoad() 
{
    if (window.isLoggedIn) {
const elements = document.getElementsByClassName("loggedInShow");

for (const element of elements) {
    element.style.display = "";
}

document.title = "Linkup Social | Logged In";
}


}