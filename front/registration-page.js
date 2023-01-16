$(document).ready( () => {
    addEventListeners();
})
function addEventListeners(){
    $("#show-password").on("click",togglePW);
    $(".form-control").on("keypress",inputFlow);    
    $("#sign-up").on("click",login);
    $("#change-password").on("click", sendEmail); 
    formSubmitListener();
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

function inputFlow(e){
    let password=$("#password");
    let login=$("#login");
    if(e.charCode == 13){
        if(e.target.id=="email") {
            password.focus()
        }
        else if(e.target.id =="password"){
            login.click()
        }
    }
}


function formSubmitListener(){
    // Get the form input values
    
    $("#signup-form").on("submit", (e) =>{
        e.preventDefault()
    let fname = document.getElementById("firsst-name").value;
    let lname = document.getElementById("last-name").value;
    let user_email = document.getElementById("email").value;
    let user_password = document.getElementById("password").value;
    let user_phone = document.getElementById("phone-number").value;
    console.log(user_email)
    if(!isValidEmail(user_email)){
        alert("Invalid email address format");
        return;
    }
    else{
        sendPOSTRequestRequest(fname, lname, user_email, user_password, user_phone);
    }
    });

    $("#forgot-password-form").on("submit", (e) =>{
        e.preventDefault()
    let user_email1 = document.getElementById("forgot-pass").value;
    if(!isValidEmail(user_email1)){
        alert("Invalid email address format");
        return;
    }else
        sendPOSTRequestfogotpas(user_email1);
    });

}
function login() {
    $("#login-form").submit();
  }
function sendEmail() {
    $("#forgot-password-form").submit();
}

function sendPOSTRequestRequest(fname, lname, user_email, user_password, user_phone) {
    $.ajax({
        type: 'POST',
        url: 'https://localhost:8080/register',
        data: {
            fname:fname,
            lname:lname,
            user_email: user_email,
            user_password: user_password,
            user_phone:user_phone
        },
        success: function(response) {
            if (response.error){
                alert(response.error)
            }
            else{
                if (response.result == 'redirect') window.location.replace("https://localhost:8080" + response.url);
                alert(response.message);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function sendPOSTRequestfogotpas(user_email) {
    $.ajax({
        type: 'POST',
        url: 'https://localhost:8080/forgot-password',
        data: {
            user_email: user_email
        },
        success: function(response) {
            alert(response.message)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function isValidEmail(user_email) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(user_email);
}
