function onValidateRequest() {
    if (validateInputZaloNumber() == true) {
        document.getElementById('buttonEnter').style.display = 'block';
        showDivOTP();
        resetAndStartCountdown();
    }
};

function showDivFollow() {
    document.getElementById('divFollow').style.display = 'grid';
    document.getElementById('divOTP').style.display = 'none';
};

function showDivOTP() {
    document.getElementById('divFollow').style.display = 'none';
    document.getElementById('divOTP').style.display = 'grid';
};

function enter() {
    let inputOTP = document.getElementById('inputOTP');
    let otp = String(inputOTP.value);
    if (otp == '') {
        alert('Xin vui lòng nhập OTP gửi bằng tin nhắn Zalo!');
        return;
    }
    showPage2();
};

function resetAndStartCountdown() {
    document.getElementById('divCountdownFinished').style.display = 'none';
    document.getElementById('divCountdownEffective').style.display = 'block';
    let divCountdown = document.getElementById('divCountdown');
    divCountdown.innerText = '10';
    window.demoCountdownIntervalId = window.setInterval(function () {
        let currentCountdown = parseInt(divCountdown.innerText);
        currentCountdown = currentCountdown - 1;
        divCountdown.innerText = currentCountdown;
        if (currentCountdown <= 0) {
            window.clearInterval(window.demoCountdownIntervalId);
            document.getElementById('buttonEnter').style.display = 'none';
            document.getElementById('divCountdownFinished').style.display = 'block';
            document.getElementById('divCountdownEffective').style.display = 'none';
        }
    }, 1000);
};

function showPage2() {
    document.getElementById('divPage1').style.display = 'none';
    document.getElementById('divPage2').style.display = 'grid';
};

function validateInputZaloNumber() {
    let inputZaloNumber = document.getElementById('inputZaloNumber');
    let zaloNumber = String(inputZaloNumber.value);
    if (zaloNumber == '') {
        alert('Xin vui lòng nhập số điện thoại đăng ký Zalo của bạn!');
        return false;
    }
    return true;
};

function flow2Enter() {
    if (validateInputZaloNumber() == true) {
        showPage2();
    }
};