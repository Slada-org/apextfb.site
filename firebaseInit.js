// Import Firebase App (the core Firebase SDK) and Firebase Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtLQVjaoh3I9yfSl66DSQicRUtBGNoE78",
    authDomain: "park-online-633b5.firebaseapp.com",
    databaseURL: "https://park-online-633b5-default-rtdb.firebaseio.com",
    projectId: "park-online-633b5",
    storageBucket: "park-online-633b5.appspot.com",
    messagingSenderId: "25931336211",
    appId: "1:25931336211:web:7951be1c279643bdbf0de6",
    measurementId: "G-V35LW4SF62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database
const database = getDatabase(app);

// Function to generate a unique account number
function generateAccountNumber() {
    return 'ACC' + Math.floor(Math.random() * 1000000000); // Generates a random 9-digit number prefixed with 'ACC'
}

async function sendRegistrationEmail(name, email, accountNumber) {
    const data = {
        service_id: 'service_u4bxj8p', // Your EmailJS service ID
        template_id: 'template_n387z6f', // Your EmailJS template ID, Create a new template ID
        user_id: 'wFjLvmBKtil7JR8Bd', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: email,
            from_name: 'ApexTFB.com',
            from_email: 'support@apextfb.com',
            account_number: accountNumber,
            instructions: 'Your registration was successful. Please use the following account number to log in: ' + accountNumber
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Email response:', res);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function send2FACodeEmail(name, email, code) {
    const data = {
        service_id: 'service_u4bxj8p', // Your EmailJS service ID
        template_id: 'template_z3c8l8d', // Your EmailJS template ID
        user_id: 'wFjLvmBKtil7JR8Bd', // Your EmailJS user ID
        template_params: {
            to_name: name,
            to_email: email,
            from_name: 'ApexTFB.com', // Your sender name
            from_email: 'support@apextfb.com', // Your sender email
            code: code // The 2FA code to be sent
        },
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';

    try {
        const req = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!req.ok) {
            throw new Error(`HTTP error! Status: ${req.status}`);
        }

        const contentType = req.headers.get('content-type');

        let res;
        if (contentType && contentType.includes('application/json')) {
            res = await req.json();
        } else {
            res = await req.text();
        }

        console.log('Response:', res);
    } catch (error) {
        console.error('Error:', error);
    }
}

function generate2FACode() {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate a token (JWT-like token)
function generateToken(accountNumber) {
    const payload = {
        accountNumber: accountNumber,
        exp: Date.now() + (60 * 60 * 1000) // Token expires in 1 hour
    };
    return btoa(JSON.stringify(payload)); // Base64 encode the payload
}

// Function to decode a token and get account number
function decodeToken(token) {
    const decodedString = atob(token);
    const payload = JSON.parse(decodedString);
    return payload;
}


// Function to handle form submission
async function register() {
    // Get form values
    const title = document.getElementById('title').value;
    const fname = document.getElementById('fname').value;
    const oname = document.getElementById('oname').value;
    const gender = document.getElementById('gender').value;
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('tel').value;
    const country = document.getElementById('country').value;
    const nokName = document.getElementById('nok_name').value;
    const nokPhone = document.getElementById('nok_phone').value;
    const nokEmail = document.getElementById('nok_email').value;
    const nokAddress = document.getElementById('nok_address').value;
    const password = document.getElementById('password').value;

    if (password === '') {
        return alert('Password is Required');
    };

    if (email === '') {
        return alert('Password is Required');
    };

    if (fname === '') {
        return alert('Password is Required');
    };

    // Generate a unique account number
    const accountNumber = generateAccountNumber();

    // Create an object with form data
    const formData = {
        accountNumber,
        title,
        firstName: fname,
        otherNames: oname,
        gender,
        dateOfBirth: dob,
        email,
        phone,
        country,
        nextOfKin: {
            name: nokName,
            phone: nokPhone,
            email: nokEmail,
            address: nokAddress
        },
        password // Add password to form data
    };

    try {
        // Save form data to Firebase
        const userRef = ref(database, 'users/' + accountNumber);
        await set(userRef, formData)
        await sendRegistrationEmail(fname, email, accountNumber);
        // alert('Registration successful! Your account number is: ' + accountNumber);
        window.location.href = 'login.html'; // Redirect to login page
    } catch (error) {
        console.error('Error saving data to Firebase or sending email:', error);
    }
}

// Function to handle login
// Function to handle login
async function login() {
    // Prevent default form submission

    // Get login form values
    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;

    // Reference to the user's data in the database
    const dbRef = ref(getDatabase());

    try {
        // Retrieve user data from Firebase
        const snapshot = await get(child(dbRef, `users/${accountNumber}`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log(userData);
            if (userData.password === password) {
                // Generate 2FA code
                const twoFACode = generate2FACode();

                // Send 2FA code to user's email
                await send2FACodeEmail(userData.firstName, userData.email, twoFACode);

                // Store 2FA code in sessionStorage
                sessionStorage.setItem('2faCode', twoFACode);
                sessionStorage.setItem('accountNumber', userData.accountNumber);

                // Redirect to 2FA verification page
                window.location.href = 'verification.html';
            } else {
                alert('Invalid password.');
            }
        } else {
            alert('Account number not found.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// Function to verify 2FA code
function verify2FACode() {
    // Prevent default form submission
    // event.preventDefault();

    // Get entered 2FA code
    const enteredCode = document.getElementById('2faCode').value;

    // Retrieve stored 2FA code from sessionStorage
    const storedCode = sessionStorage.getItem('2faCode');
    const accountNumber = sessionStorage.getItem('accountNumber');

    if (enteredCode === storedCode) {
        // Clear sessionStorage
        const token = generateToken(accountNumber);
        sessionStorage.setItem('token', token);
        sessionStorage.removeItem('2faCode');
        sessionStorage.removeItem('accountNumber');

        alert('2FA code verified successfully!');
        // Proceed to the user's dashboard or home page
        window.location.href = 'dash.html';
    } else {
        alert('Invalid 2FA code.');
    }
}

console.log('Starting the cookie');

// Function to get user details from Firebase using the decoded token
async function getUserDetails() {
    console.log('Starting the cookie');
    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
        // Token is not present, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // Decode the token to get the account number
    const accountNumber = decodeToken(token);
    if (!accountNumber) {
        // Token is invalid, redirect to login
        window.location.href = 'login.html';
        return;
    }

    console.log(accountNumber);

    // Reference to the user's data in Firebase
    const userRef = ref(database, 'users/' + accountNumber.accountNumber);

    try {
        // Retrieve user data from Firebase
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User Details:', userData);
            // Process or display user details
            // Find the element with the class 'user-name'
            const userNameElement = document.querySelector('.name');
            const justName = document.querySelector('.jname');
            const inputValue = document.querySelector('input[name="op"]');
            const phoneValue = document.querySelector('input[name="fgf"]');
            const nokName = document.querySelector('input[name="name"]');
            const nokEmail = document.querySelector('input[name="email"]');
            const nokPhone = document.querySelector('input[name="phone"]');


            // Check if the element exists
            if (userNameElement) {
                // Display the user's first name
                userNameElement.textContent = `Welcome, ${userData.firstName}!`;
            }

            if (justName) {
                // Display the user's first name
                justName.textContent = userData.firstName;
            }

            if (inputValue) {
                // Display the user's first name
                inputValue.value = userData.email;
            }

            if (phoneValue) {
                // Display the user's first name
                phoneValue.value = userData.phone;
            }

            if (nokName) {
                // Display the user's first name
                nokName.value = userData.nextOfKin.name;
            }

            if (nokEmail) {
                // Display the user's first name
                nokEmail.value = userData.nextOfKin.email;
            }

            if (nokPhone) {
                // Display the user's first name
                nokPhone.value = userData.nextOfKin.phone;
            }

             // Mapping user data to HTML elements
             const userMapping = {
                '.user-title': userData.title,
                '.user-other-names': userData.otherNames,
                '.user-gender': userData.gender,
                '.user-dob': userData.dateOfBirth,
                '.user-email': userData.email,
                '.user-phone': userData.phone,
                '.user-country': userData.country,
                '.user-account': userData.accountNumber,
                '.nok-name': userData.nextOfKin.name,
                '.nok-phone': userData.nextOfKin.phone,
                '.nok-email': userData.nextOfKin.email,
                '.nok-address': userData.nextOfKin.address
            };

            // Update the HTML with user data
            for (const [selector, value] of Object.entries(userMapping)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = value;
                }
            }

            return userData;
        } else {
            // Account number not found
            alert('User not found.');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        // Token verification failed
        alert('Error retrieving user details.');
        window.location.href = 'login.html';
    }
}


console.log('Ending the cookie');


// Expose the login function to the global scope
window.login = login;

// Expose the verify2FACode function to the global scope
window.verify2FACode = verify2FACode;

// Expose the register function to the global scope
window.register = register;

window.getUserDetails = getUserDetails;

console.log('Closing the cookie');
