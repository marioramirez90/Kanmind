let signUpValues = {
    "fullname": "",
    "email": "",
    "password": "",
    "repeated_password": ""
}

async function signUpSubmit(event) {
    event.preventDefault();
    let isFormValid = validateSignUp();
    if (isFormValid) {
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const repeatedPassword = document.getElementById("repeated_password").value;

        if (!fullname || !email || password !== repeatedPassword) {
            return;
        }

        registration({
            fullname,
            email,
            password,
            repeated_password: repeatedPassword
        });
    }
}

async function registration(data) {
    let response = await postData(REGISTER_URL, data);
    if (!response.ok) {
        console.error("Registration failed:", {
            status: response.status,
            response: response.data
        });
        let errorArr = extractErrorMessages(response.data)
        showToastMessage(true, errorArr)
    } else {
        if (storeAuthResponse(response.data)) {
            window.location.href = "../dashboard/index.html"
        } else {
            showToastMessage(true, ["The server did not return an authentication token."])
        }
    }
}

async function logInSubmit(event) {
    event.preventDefault();
    setError(false, "error_login")
    const data = getFormData(event.target);
    await logIn(data)
}

async function logIn(data) {
    let response = await postData(LOGIN_URL, data);
    if (!response.ok) {
        setError(true, "error_login")
    } else {
        if (storeAuthResponse(response.data)) {
            window.location.href = "../dashboard/index.html"
        } else {
            setError(true, "error_login")
        }
    }
}

function storeAuthResponse(data) {
    const user = data.user || data;
    const token = data.token || data.key;

    return setAuthCredentials(
        token,
        user.user_id || user.id,
        user.email,
        user.fullname || user.name
    );
}

function guestLogin() {
    setError(false, "error_login")
    logIn(GUEST_LOGIN)
}

function validateFullname(element) {
    const nameRegex = /^[a-zäöüß]+(?: [a-zäöüß]+){1,2}$/i;
    let valid = nameRegex.test(element.value.trim())
    setError(!valid, element.id + "_group")
    if (valid) {
        signUpValues.fullname = element.value.trim()
    }
}

function validateRegistrationEmail(element) {
    let valid = validateEmail(element)
    if (valid) {
        signUpValues.email = element.value.trim()
    }
}

function validatePW(element) {
    let valid = element.value.trim().length > 7;
    setError(!valid, element.id + "_group")

    if (valid) {
        signUpValues.password = element.value.trim()
    }

    let repeatedPwRef = document.getElementById("repeated_password")
    if (repeatedPwRef.value.trim().length > 0) {
        validateConfirmPW(repeatedPwRef)
    }
}

function validateConfirmPW(element) {
    let valid = document.getElementById("password").value.trim() == element.value.trim();
    setError(!valid, element.id + "_group")
    if (valid) {
        signUpValues.repeated_password = element.value.trim()
    }
}

function validatePrivacyCheckbox(element) {
    setError(!element.checked, element.id + "_group")
}

function validateLoginPW(element) {
    let valid = element.value.trim().length > 0;
    setError(!valid, element.id + "_group")
}

function validateEmail(element) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let valid = emailRegex.test(element.value.trim())
    setError(!valid, element.id + "_group")
    return valid;
}

function validateSignUp() {
    validateFullname(document.getElementById("fullname"))
    validateRegistrationEmail(document.getElementById("email"))
    validatePW(document.getElementById("password"))
    validateConfirmPW(document.getElementById("repeated_password"))
    validatePrivacyCheckbox(document.getElementById("privacy_policy_checkbox"))

    const form = document.getElementById('sign_up_form');
    const elementWithErrorFalse = form.querySelector('[error="true"]');
    return elementWithErrorFalse == null
}