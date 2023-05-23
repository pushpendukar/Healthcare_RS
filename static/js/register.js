function checkUserName() {    //验证用户名
    var fname = document.getElementById("username").value;
    var reg = /^[0-9a-zA-Z]/;
    if (fname.length != 0) {
        for (i = 0; i < fname.length; i++) {
            if (!reg.test(fname)) {
                alert("Only require letter and number");
                return false;
            }
        }
        // if (fname.length < 4 || fname.length > 16) {
        //     alert("4-16 digits long");
        //     return false;
        // }
    }
    else {
        alert("Please input your username");
        document.getElementById("username").focus();
        return false;
    }
    return true;
}

function passCheck() { //验证密码
    var userpass = document.getElementById("password").value;
    if (userpass == "") {
        alert("You haven't input password \n" + "Please input password");
        document.getElementById("password").focus();
        return false;
    }
    if (userpass.length < 6 || userpass.length > 12) {
        alert("6-12 digits long\n");
        return false;
    }
    return true;
}

// function passCheck2() {
//     var p1 = document.myform.password.value;
//     var p2 = document.myform.password2.value;
//     if (p1 != p2) {
//         alert("You input is not same as password you set");
//         return false;
//     } else {
//         return true;
//     }
// }
function checkName() {
    var name = document.getElementById("realname").value;
    if (name == "") {
        alert("Please input your name");
        document.getElementById("realname").focus();
        return false;
    }
    return true;
}

function checkEmail() {
    var Email = document.getElementById("email").value;
    var e = Email.indexOf("@" && ".");
    if (Email.length != 0) {
        if (e > 0) {
            if (Email.charAt(0) == "@" && ".") {
                alert("Wrong format");
                return false;
            }
            else {
                return true;
            }
        }
        else {
            alert("Wrong format");
            return false;
        }
    }
    else {
        alert("Please input your email");
        return false;
    }
}

// function checkbirthday() {    //验证用户名
//     var year = document.myform.birthday.value;
//     if (year < 1949 || year > 2007) {
//         alert("年份范围从1949-2007年");
//         return false;
//     }
//     return true;
// }

function validateform() {
    if (checkUserName() && passCheck() && checkEmail() && checkName())
        return true;
    else
        return false;
}

// function clearText() {
//     document.user.value = "";
//     document.password.value = "";
// }

//显示隐藏对应的密码方法:
function show_hide_pwd(id)
{
    let type = $("#"+id).attr('type')
    if (type === "password") {
        $("#"+id+"eye").attr('src', "img/eye_open.svg"); 
        $("#"+id).attr("type", "text");
    } else {
        $("#"+id+"eye").attr('src', "img/eye_close.svg"); 
        $("#"+id).attr("type", "password");
    }
}