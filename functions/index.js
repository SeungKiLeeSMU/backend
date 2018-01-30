import { user } from 'firebase-functions/lib/providers/auth';

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
// Note : + use firebase.auth().functions?
//        + write to /users/{uid}.value, not uid itself.
//        + Hash PW param?
exports.register = functions.https.onRequest((request, response) =>{
  const firstName = request.body.firstName
  const lastName = request.body.lastName
  const email = request.body.email
  const password = request.body.password

  admin.auth().createUser({
    email: email,
    firstName: firstName,
    password: password,
    lastName: lastName
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", firstName, " ", lastName, "email:", email);
      // // auto login if successful 
      // login(email, password)  
      response.status(200).end();      
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      response.status(400).end();      
    });  
    
    // Write to DB
    const newUserRef = aref.child('/users/')
    return newUserRef.push({
      'email': email,
      'firstName': firstName,
      'password': password,
      'lastName': lastName,
      'projects': []
    })
});

// Name : login()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/login
// Deployed [o]
// Logged [o]
// Writes to DB [-]
// Status : 200 OK
// Note : -
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
// Deployed [o]
// Logged [o]
// Writes to DB [-]
// Status : 200 OK
// Note : Current User is null afterwards
exports.logout = functions.https.onRequest((request, response) => {

  const user = firebase.auth().onAuthStateChanged(function(user) {
    if(user){
      firebase.auth().signOut()
      .then(function(){
        console.log("You are signed out!");
        response.status(200).end();
      })
      .catch(function(error) {
        console.log("Error Logging out ", "Error Code: ", error.code, "Error Message: ", error.message);
        response.status(400).end();      
      });
    } else {
      console.log("No Current User");
      response.status(200).end();          
    }
  });
})

// Name : updateAccountSetting()
// Type : PUT
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/{uid}/updateAccountSetting
// Deployed [o]
// Logged [x]
// Writes to DB [o]
// Status : -
// Note : Need to make sure exactly what we are updating:
//        Start by just assigning current info for empty inputs
exports.updateAccountSetting = functions.https.onRequest((request, response) =>{

    const user = firebase.auth().currentUser;

    // check for changed info
    if (request.body.newPassword) {
      newPassword = request.body.newPassword  
    } else {
      newPassword = user.password
    }
    if (request.body.newEmail) {
      newEmail = request.body.newEmail  
    } else {
      newEmail = user.email
    }
    if (request.body.newFirstName) {
      newFirstName = request.body.newFirstName 
    } else {
      newFirstName = user.firstNme
    }
    if (request.body.newLastName) {
      newLastName = request.body.newLastName  
    } else {
      newLastName = user.lastName
    }
    const uid = user.uid;

  admin.auth().updateUser(uid, {
    email: newEmail,
    password: newPassword,
    firstName: newFirstName,
    lastName: newLastName
  })
    .then(function(userRecord) {
      console.log("updated user info: ", userRecord.toJSON());
      response.status(200).end();
    })
    .catch(function(error){
      console.log("failed to update user info");
      response.status(400).end();
    })

    // Write to DB
    const updateUserRef = aref.child(`/users/{$uid}`)
    return updateUserRef.set({
      'email': newEmail,
      'firstName': newFirstName,
      'password': newPassword,
      'lastName': newLastName
    })
})

// Name : createProject()
// Type : POST
// API : https://us-central1-jumpstart-f48ac.cloudfunctions.net/{id}/createProject
// Deployed [x]
// Logged [x]
// Writes to DB [x]
// Status : -
// Note : -


// "projects" : {
//   "completedTasks" : "string[]",
//   "deadline" : "Date",
//   "progress" : "int",
//   "project_id" : "string",
//   "subprojects" : "string[]",
//   "title" : "string",
//   "type" : "int",
//   "word_count" : "int"
// },

exports.createProject = functions.https.onRequest((request, response) =>{
// check for user


  // create project tied to uid

  const completedTasks = [];
  const deadline = request.body.deadline;
  const progress = 0;
  const title = request.body.title;
  const subproject = [];
  const type = request.body.type;
  const word_count = 0;
  const time_created = new Date();

  // make unique project_id
  const project_id = concat(request.body.title, time_created.toString())

  const newProject = {
    deadline,
    progress,
    project_id,
    subproject,
    title,
    type,
    project_id,
    word_count
  }

// write to db -> add the project_id to the list in users table
  const newUserRef = aref.child(`/users/{$uid}/projects`)
  return newUserRef.push({
    'project': project_id
  })
})