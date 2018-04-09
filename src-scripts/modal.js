// Component: Modal
function showModal(modal) {
	document.getElementById(modal).classList.add("show");
}
function closeModal(modal) {
	document.getElementById(modal).classList.remove("show");
}
if (
	navigator.userAgent.indexOf("Safari") != -1 &&
	navigator.userAgent.indexOf("Chrome") == -1
) {
	var modal = document.getElementsByClassName("modal");
	for (i = 0; i < modal.length; i++) modal[i].classList.add("ios");
}
