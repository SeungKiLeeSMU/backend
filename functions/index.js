// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref();

// Name : Register
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/register
// Deployed [o]
// Logged [o]
// Writes to DB [o]
// Status : Working
exports.register = functions.https.onRequest((request, response) =>{
  const firstName = request.body.firstName
  const lastName = request.body.lastName
  const email = request.body.email
  const password = request.body.password

  admin.auth().createUser({
    email: email,
    // emailVerified: false,
    firstName: firstName,
    password: password,
    lastName: lastName
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", firstName, " ", lastName, "email:", email);  
      response.status(200).end();      
      // auto login if successful 
      // doLogin(email,password); 
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      response.status(400).end();      
    });  
    
    // Add to DB
    const newUserRef = ref.child('/users/')
    return newUserRef.push({
      'email': email,
      'firstName': firstName,
      'password': password,
      'lastName': lastName
    })
});


// Name : Login
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/login
// Deployed [o]
// Logged [X]
// Writes to DB [-]
// Status : 500 Error
exports.login = functions.https.onRequest((request, response) =>{
  const email = request.body.email
  const password = request.body.password

  admin.auth().login(email, password)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log("Successfully Logged In:", email);
    response.status(200).end();          
  })
  .catch(function(error) {
    console.log("Error Logging In:", "Error Code: ", error.code, "Error Message: ", error.message);
    response.status(400).end();      
  });
});





// function doLogin(email, password) {
//   admin.auth().login('password', {
//       email: email,
//       password: password
//   });
// };

// Give 500 error
// Register -> New Firebase Function
// exports.register = functions.https.onRequest((request, response) =>{
//   const firstName = request.body.firstName
//   const lastName = request.body.lastName
//   const email = request.body.email
//   const password = request.body.password
//   console.log ("email: ", email);
//   console.log ("rbemail: ", request.body.email);
//   console.log ("password: ", password);
//   console.log ("rbpassword: ", request.body.password);
  
//   firebase.auth().createUserWithEmailAndPassword(request.body.email, request.body.password)
//   .catch(function(error) {
//     console.log("Error creating new user:", error);
//     response.status(400).end();      
//   })
// });

//   let userRecord = admin.auth().createUser({email: email,password: password})
//   var url = 'user/' + userRecord.uid
//   const updatedProfile = admin.database().ref(url).set({
//     "firstName": firstName,
//     "lastName": lastName,
//     "email": email,
//     "password": password
//   })
//   console.log("Created a New User", userRecord.uid);

// exports.signup = functions.auth.user().onCreate( event => {
//   const uid = event.data.uid;
//   const email = event.data.email;
//   // const firstName = event.data.firstName;
//   // const lastName = event.data.lastName;
//   const newUserRef = ref.child('/users/')
//   return newUserRef.push({
//     "email": email
//   })
// });

// exports.signin = functions.auth.user().signInWithEmailAndPassword(email, password).catch(function(error) {
// });
// auth.createUserWithEmailAndPassword(email, password);
// auth.signInWithEmailAndPassword(email, password);
// auth.onAuthStateChanged(firebaseUser => { });

// Sample
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });