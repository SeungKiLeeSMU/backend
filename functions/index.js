// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');

// admin initialization
admin.initializeApp(functions.config().firebase);
const aref = admin.database().ref();
// firebase initialization for magic
firebase.initializeApp(functions.config().firebase);
const fref = firebase.database().ref();

// Name : register()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/register
// Deployed [o]
// Logged [o]
// Writes to DB [o]
// Status : 200 OK
// Note : + Will update using firebase.auth().functions
//        + Will update to write to /users/{uid}.value, not uid itself.
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
      // login(email, password)
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      response.status(400).end();      
    });  
    
    // Add to DB
    const newUserRef = aref.child('/users/')
    return newUserRef.push({
      'email': email,
      'firstName': firstName,
      'password': password,
      'lastName': lastName
    })
});

// Name : login()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/login
// Deployed [o]
// Logged [o]
// Writes to DB [-]
// Status : 200 OK
// Note : Should prob send token on success?
exports.login = functions.https.onRequest((request, response) =>{
  const email = request.body.email
  const password = request.body.password
  
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(userRecord) {
    console.log("Successfully Logged In:", email);
    response.status(200).end();          
  })
  .catch(function(error) {
    console.log("Error Logging In:", email, "Error Code: ", error.code, "Error Message: ", error.message);
    response.status(400).end();      
  });
});

// Name : logout()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/logout
// Deployed [x]
// Logged [x]
// Writes to DB [-]
// Status : 200 NOT WORKING
// Note : Need to specify which user is being signedOut
exports.logout = functions.https.onRequest((request, response) => {
  // var user = firebase.auth().currentUser;
  // var checkEmail = user.email;
  // user.signout()
  firebase.auth().signOut()
    .then(function(){
      console.log("Signed Off ");
      response.status(200).end();
    })
    .catch(function(error) {
      console.log("Error Logging out ", "Error Code: ", error.code, "Error Message: ", error.message);
      response.status(400).end();      
    });
})

// Name : updateAccountSetting()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/{uid}/updateAccountSetting
// Deployed [x]
// Logged [x]
// Writes to DB [x]
// Status : -
// Note : Need to make sure exactly what we are updating:


// Name : createProject()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/{uid}/createProject
// Deployed [X]
// Logged [X]
// Writes to DB [X]
// Status : build a new project with 
// ["project": {
//   "project_id" : "string",
//   "tasks" : "string[]",
//   "title" : "string",
//   "type" : "int",
//   "word_count" : "int",
//   "deadline" : "Date",
//   "progress" : "int",
//   "subprojects" : "string[]"
// }]