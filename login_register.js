function register () {
    // Prevent default form submission
    // event.preventDefault();

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

    // Create an object with form data
    const formData = {
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

    // Save form data to Firebase
    database.ref('registrations').push(formData)
        .then(() => {
            alert('Form submitted successfully!');
            form.reset(); // Reset form fields
        })
        .catch((error) => {
            console.error('Error saving data to Firebase:', error);
        });
};