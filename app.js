const themebtn = document.querySelector(".theme-btn");
const controls = document.querySelectorAll(".control");
function controling () {
    controls.forEach(button => {
        button.addEventListener("click", function() {
            document.querySelector(".active-btn").classList.remove("active-btn");
            this.classList.add('active-btn');
            document.querySelector('.active').classList.remove('active');
            document.getElementById(button.dataset.id).classList.add("active");
        })
    });
}
function changeTheme(){
    document.body.classList.toggle("light-mode");
}

function emailErr() {
    window.alert('this service is not available for now')
}

themebtn.addEventListener("click", changeTheme);
controling();