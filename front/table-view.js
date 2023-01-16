var req = []
const numbers = [];
const letters = [];
let totalRows;
const itemsPerPage = 50;
let startPage = new URL(location.href).searchParams.get('page');
startPage = !startPage || Number(startPage) < 1 ? 1 : Number(startPage);
let searchVal = new URL(location.href).searchParams.get('search');
searchVal = searchVal ? searchVal : "";
getAllClients();
$(document).ready(() => {
    //todo: delete
    $("#insert-user").on("click", () => {$("#AddClient").submit();});
    $("#change-password-button").on("click", () =>{$("#change-password-form").submit();})
    $("search-user-button").on("click", () =>{$("#search-form").submit();})
    formSubmitListener();
    //todo: end delete
    //todo: remove '//'
    
    // sendRequest(startPage,searchVal);// This request will get the data for the 50 rows in the page :)

    //todo: end remove '//'
    addRowsToTable();
    addTableNav();
    addEventListeners();
})

function sendRequest(start, search) {
    let firstRow = (start - 1) * 50;
    $.ajax({
        type: "GET",
        url: "https://localhost:8080/getclients",
        dataType: 'JSON',
        complete: function (res) {
            req = res.responseJSON;
         }
     })
    //todo: add request;

    /*$.ajax({
        type: 'POST',
        url: 'https://localhost:8080',
        data: {
            start: firstRow,
            search: search
        },
        success: function(response) {
            console.log(response);
        },
        error: function(error) {
            console.log(error);
        }
    });*/
}


function formSubmitListener(){
    // Get the form input values
    
    $("#addClient").on("submit", (e) =>{
        e.preventDefault();
    addUserListener();
    });

    $("#change-password-form").on("submit", (e) =>{
        e.preventDefault();
        changeUserPassword();
    });

    $("#search-form").on("submit", (e) =>{
        e.preventDefault();
        searchAccount();
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

function searchAccount() {
        let search_string = document.getElementById("search-bar").value;
        const data = {
                search_string: search_string
            };
            console.log(data);
            $.ajax({
                type: 'POST',
                url: '/searchclient',
                data: data,
                success: function(response) {
                    req=[]
                    clients_array = response.clients
                    for (let i = 0; i < clients_array.length; i++) {
                        let r = {};
                        r.firstName = clients_array[i].first_name
                        r.lastName = clients_array[i].last_name
                        r.city = clients_array[i].city
                        r.phoneNum = clients_array[i].phone_number
                        r.email = clients_array[i].email
                        req.push(r);
                    }
                    $("#table-content").empty()
                    addRowsToTable()
                }
            });
            
            //todo:add request here (add user)
}

function changeUserPassword() {
    $(".modal-content").on("submit", (e) => {
        e.preventDefault();
        let dontSend = false;
        let user_email = document.getElementById("change-password-email").value;
        let user_old_password = document.getElementById("old-password").value;
        let user_new_password = document.getElementById("new-password").value;
        if(!dontSend){
            const data = {
                email: user_email,
                user_old_password: user_old_password,
                user_new_password: user_new_password
            };
            console.log(data);
            $.ajax({
                type: 'POST',
                url: '/changepasswordlogged',
                data: data,
                success: function(response) {
                    if (response.error){
                        alert(response.error)
                    }
                    else{
                        alert(response.message)
                        if (response.redirect) window.location.replace("https://localhost:8080" + response.url);
                    }
                }
            });
            //todo:add request here (add user)
        }
    })
}


async function getAllClients() {
    totalRows = 999;
    var clients_array = await $.ajax({
        type: "GET",
        url: "https://localhost:8080/getclients",
        dataType: 'JSON',
        async: false,
        complete: function (res) {
            return res.responseJSON;
         }
     })
    for (let i = 0; i < 10; i++) {
        numbers.push(i)
    }
    for (let i = 97; i <= 122; i++) {
        letters.push(String.fromCharCode(i))
    }
    for (let i = 0; i < clients_array.length; i++) {
        let r = {};
        r.firstName = clients_array[i].first_name
        r.lastName = clients_array[i].last_name
        r.city = clients_array[i].city
        r.phoneNum = clients_array[i].phone_number
        r.email = clients_array[i].email
        req.push(r);
    }
    console.log(req)
}

function addRowsToTable() {
    req.forEach(addRow);
}

function addTableNav() {
    let totalPages = Math.ceil(totalRows / itemsPerPage);
    let nav = '<ul id="page-nav" class="pagination m-0 ms-auto">';
    if (startPage > 1) {
        nav += '<li id="prev" class="page-item"><a class="page-link" href="#" data-page="' + (startPage - 1) + '">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><polyline points="15 6 9 12 15 18"></polyline></svg>' +
            'prev' + '</a></li>';
    }
    let start = Math.max(1, startPage - 2);
    let end = Math.min(totalPages, startPage + 2);
    for (let i = start; i <= end; i++) {
        nav += '<li id="page' + i + '" class="page-item' + (i === startPage ? ' active' : '') + '"><a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
    }
    if (startPage < totalPages) {
        nav += '<li id="next" class="page-item"><a class="page-link" href="#" data-page="' + (startPage + 1) + '">' +
            'next' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><polyline points="9 6 15 12 9 18"></polyline></svg>' +
            '</a></li>';
    }
    nav += '</ul>';
    $('#table-nav').html($('#table-nav').html() + nav);
    let currStart = (startPage - 1) * 50 + 1;
    let currEnd = Math.min(currStart + 50, totalRows);
    $('.from-page').val(currStart);
    $('.to-page').val(currEnd);
    $("#search-bar").val(searchVal);
}

function removeData() {
    $("#table-content").empty();
    $("#page-nav").remove();
}

function addRow(r) {
    let checkboxTD = createNewElement("td", null, null);
    let firstNameTD = createNewElement("td", null, r.firstName, "first-name" + r.email);
    let lastNameTD = createNewElement("td", null, r.lastName, "last-name" + r.email);
    let emailTD = createNewElement("td", null, r.email, "email" + r.email);
    let cityTD = createNewElement("td", null, r.city, "email" + r.email);
    let phoneNumTD = createNewElement("td", null, r.phoneNum, "phone-number" + r.email);
    let checkbox = createNewElement("input", "form-check-input m-0 align-middle check-one", null, "checkbox" + r.email);
    checkbox.type = "checkbox";
    $(checkboxTD).append(checkbox);
    let deleteTD = createNewElement("td", null, null);
    deleteTD.title = "Delete User"
    let deleteIcon = createNewElement("button", "delete-user-btn", `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <circle cx="9" cy="7" r="4"></circle>
   <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
   <path d="M17 9l4 4m0 -4l-4 4"></path>
    </svg>`, "delete-btn" + r.email);
    deleteTD.append(deleteIcon);
    let tdList = [checkboxTD, firstNameTD, lastNameTD, emailTD, cityTD, phoneNumTD, deleteTD];
    let tr = createNewElement("tr", null, null, r.email);
    tdList.forEach((td) => $(tr).append(td));
    $("#table-content").append(tr);


}

function createNewElement(tag, htmlClass, html, id) {
    let el = document.createElement(tag);
    if (htmlClass) {
        let classes = htmlClass.split(" ");
        classes.forEach((c) => {
            el.classList.add(c)
        });
    }
    if (html) $(el).html(html);
    if (id) el.id = id;
    return el;

}

function addEventListeners() {
    checkAllListener();
    navListeners();
    deleteUsersListeners();
    $('.delete-btnzpymgd665').click(function() {
        let id = $(this).data('id');
        // here you need to call your delete function and pass the id as argument
     });
   
    searchBarListener();
}

function checkAllListener() {
    $("#select-all").on("change", (e) => {
        $(".check-one").prop("checked", $(e.target).prop("checked"));
    });

    $(".check-one").on("change", (e) => {
        $("#select-all").prop("checked", $('.check-one:checked').length == $('.check-one').length);
    });
}

function navListeners() {
    $(".page-item").on("click", (e) => {
        e.preventDefault();
        let id = e.target.id ? e.target.id : e.target.parentElement.id;
        switch (id) {
            case "next":
                goToPage(startPage + 1, searchVal);
                break
            case "prev":
                goToPage(startPage - 1, searchVal);
                break;
            default:
                goToPage(Number(id.replace("page", "")), searchVal);
        }

    });
}

function deleteUsersListeners() {
    $(".delete-user-btn").on("click", (e) => {
        e.stopPropagation();
        let buttonID = $(e.target).closest('button').attr('id');
        let email;
        let toDelete = [];
        if (buttonID == "delete-selected") {
            $(".check-one:checked").each(function () {
                email = $(this).closest("tr").attr("id");
                if (email === $(this).attr('id').replace("checkbox", "")) ;
                toDelete.push(email);
            });
        } else {
            email = $(e.target).closest("tr").attr("id");
            if (email === buttonID.replace("delete-btn", ""))
                toDelete.push(email);
        }
        deleteUsers(email)
    })
}

function deleteUsers(email) {
    $.ajax({
        type: "POST",
        url: "https://localhost:8080/del-client",
        dataType: 'JSON',
        data:{ email:email},
        async: false,
        complete: function (response) {
            if (response.result) window.location.replace("https://localhost:8080" + response.url);
            location.reload();
         }
     })
    //todo:send to backend list to delete :)
}

function searchBarListener() {
    $("#search-bar").on("keydown", (e) => {
        if (e.keyCode === 13)
            goToPage(1, $(e.target).val());
            $("#search_user_form").submit();
    });
}

function addUserListener() {
    $(".modal-content").on("submit", (e) => {
        e.preventDefault();
        let dontSend = false;
        let fname = document.getElementById("firsst-name").value;
        let lname = document.getElementById("last-name").value;
        let user_email = document.getElementById("email").value;
        let city = document.getElementById("city").value;
        let user_phone = document.getElementById("phoneNum").value;
        if(!dontSend){
            const data = {
                fname: fname,
                lname: lname,
                email: user_email,
                city: city,
                phone: user_phone
            };
            console.log(data);
            $.ajax({
                type: 'POST',
                url: '/add-client',
                data: data,
                success: function(response) {
                    if (response.result) window.location.replace("https://localhost:8080" + response.url);
                    location.reload();
                }
            });
            //todo:add request here (add user)
        }
    })
}
function validateInput(input,type){
    switch (type){
        case "text":
            let nameRegEx = /^[a-zA-Z .'-]+$/;
            return nameRegEx.test(input);

        case "email":
            let emailRegEx =/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            let domainRegEx= /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
            let XSSRegEx = /^[^<>&]*$/;
            if(!emailRegEx.test(input) || !domainRegEx.test(input) || !XSSRegEx.test(input));
                return true
            return false
        case "phone":
            let phoneRegEx =/^[0-9]{9}$/;
            return phoneRegEx.test(input);
    }
}

function removeEventListeners() {
    $(".delete-user-btn").off("click");
    $("#search-bar").off("keydown");
}

function goToPage(num, searchValue) {
    startPage = num;
    searchVal = searchValue;
    //todo:add request instead of fake request
    // sendRequest(num,searchVal);
    //todo:delete fake req
    // getAllClients(); to avoid generating same data few times
    removeData();
    addRowsToTable();
    addTableNav();
    removeEventListeners();
    addEventListeners();
    let currentUrl = new URL(window.location.href);
    let params = new URLSearchParams(currentUrl.search);
    if (startPage > 1)
        params.set("page", num);
    else if (params.get("page"))
        params.delete("page");
    if (searchVal)
        params.set("search", searchVal);
    else if (params.get("search"))
        params.delete("search");
    currentUrl.search = params.toString();
    window.history.replaceState({}, "", currentUrl.toString());
    $("#select-all").prop("checked", false);
    window.scrollTo(0, 0);
    location.reload();
}