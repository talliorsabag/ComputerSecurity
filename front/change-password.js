console.log("blablabla")
$(document).ready( () => {
    addEventListeners();
})
function addEventListeners(){
    formSubmitListener();
    $("#login").on("click",login);
}

function togglePW(){
    let password = document.getElementById("password");
    let toggle = document.getElementById("show-password");
    if(password.type == "password"){
        password.type="text";
        toggle.title = "Hide password"
    }
    else{
        password.type="password";
        toggle.title="Show password";
    }
}


function formSubmitListener(){
    // Get the form input values
    
    $("#login-form").on("submit", (e) =>{
        e.preventDefault()
    let password = document.getElementById("password").value;
    sendPOSTRequestChangePassword(password)
    });

}
function login() {
    $("#login-form").submit();
  }

function sendPOSTRequestChangePassword(new_password) {
    const all_url = window.location.href.split(':')
    const token = all_url[all_url.length - 1]
    $.ajax({
        type: 'POST',
        url: 'https://localhost:8080/change-password',
        data: {
            token:token,
            new_password: new_password,
        },
        success: function(response) {
            if (response.error){
                alert(response.error)
            }
            else{
                alert(response.message)
                if (response.result) window.location.replace("https://localhost:8080" + response.url);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}
