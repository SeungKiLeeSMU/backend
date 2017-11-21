const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const ref = admin.database().ref();


// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.signup = functions.https.onRequest((request, response) =>{
  const firstName = request.body.firstName
  const lastName = request.body.lastName
  const email = request.body.email
  const password = request.body.password

  admin.auth().createUser({
    email: email,
    emailVerified: false,
    firstName: firstName,
    password: password,
    lastName: lastName
  })
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.username, "email:", email);      
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      response.status(400).end();      
    });
    response.status(200).end();              
});



  // let userRecord = admin.auth().createUser({email: email,password: password})
  //
  // var url = 'user/' + userRecord.uid
  // const updatedProfile = admin.database().ref(url).set({
  //   "firstName": firstName,
  //   "lastName": lastName,
  //   "email": email,
  //   "password": password
  // })
  //
  // console.log("Created a New User", userRecord.uid);

// exports.signup = functions.auth.user().onCreate( event => {
//   const uid = event.data.uid;
//   const email = event.data.email;
//   // const firstName = event.data.firstName;
//   // const lastName = event.data.lastName;
//   const newUserRef = ref.child('/users/')
//   return newUserRef.push({
//     "email": email
//   })
//
//
// });

// exports.register = functions.https.onRequest((request, response) => {
//   // const auth = firebase.auth();
//   // auth.createUserWithEmailAndPassword(email, password);
//   // response.send("account created");
// })

// exports.signin = functions.auth.user().signInWithEmailAndPassword(email, password).catch(function(error) {
//
// });

// auth.createUserWithEmailAndPassword(email, password);
// auth.signInWithEmailAndPassword(email, password);
// auth.onAuthStateChanged(firebaseUser => { });
