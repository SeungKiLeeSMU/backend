// Reference of firebase functions commented out


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