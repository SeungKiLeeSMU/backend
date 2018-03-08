const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
// var serviceAccount = require('./service-account.json');
admin.initializeApp(functions.config().firebase);
const aref = admin.database().ref();
firebase.initializeApp(functions.config().firebase);
const fref = firebase.database().ref();

// REGISTER
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
      console.log("Successfully created new user:", firstName, " ", lastName, "email:", email);
      response.status(200).json(200, {'email': email, 'password':password});      

      // // Set the uid
      // var newuid = userRecord.uid;
      // // create Token
      // admin.auth().createCustomToken(newuid)
      //   .then(function(customToken) {
          // See the UserRecord reference doc for the contents of userRecord.
          // console.log("Successfully created new user:", firstName, " ", lastName, "email:", email);
          // response.status(200).json(200, customToken);      
        // }).catch(function(error){
        //   console.log("error: ", error);
        //   return response.status(400).json(400, 'Error : ', error);
        // })
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      return response.status(400).json(400, 'Error ', error);   
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

// LOGIN
exports.login = functions.https.onRequest((request, response) =>{
  const email = request.body.email
  const password = request.body.password

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(userRecord) {
    console.log("Successfully Logged In:", userRecord);
    response.status(200).json(userRecord)
  })
  .catch(function(error) {
    console.log("Error Logging In:", email, "Error Code: ", error.code, "Error Message: ", error.message);
    response.status(400).json(error);      
  });
});

// LOGOUT
exports.logout = functions.https.onRequest((request, response) => {
  // get the currently logged in user
  const user = firebase.auth().onAuthStateChanged(function(user) {
    if(user){
      firebase.auth().signOut()
      .then(function(){
        console.log("You are signed out!");
        response.status(200).end();
        return response.json();
      })
      .catch(function(error) {
        console.log("Error Logging out ", "Error Code: ", error.code, "Error Message: ", error.message);
        response.status(400).end();      
        return response.json();
      });
    } else {
      console.log("No Current User");
      response.status(200).end();
      return response.json();          
    }
  });
})

// UPDATE ACCOUNT SETTING
exports.updateAccountSetting = functions.https.onRequest((request, response) =>{

    const user = firebase.auth().currentUser;
    const userId = user.uid;

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
    const updateUserRef = aref.child(`/users/{$userId}/`)
    return updateUserRef.set({
      'email': newEmail,
      'firstName': newFirstName,
      'password': newPassword,
      'lastName': newLastName
    })
})

// CREATEPROJECT
exports.createProject = functions.https.onRequest((request, response) =>{
// set uid to that of currently logged in user
// const user = firebase.auth().currentUser;
// assign a user id for now
// const uid = user.uid;
// -> Why different UID for db and auth?
  const userId = "-KzyphA2HeggttUGpQ29";

  // create project tied to uid
  const deadline = request.body.deadline;
  const progress = 0;
  const title = request.body.title;
  const subprojects = [];
  // 0 = research, 1 = writing, 2 = revision
  const type = request.body.type;

  const newProject = {
    deadline,
    progress,
    subprojects,
    type,
    title
  }

  console.log("Type :  ", type)
  // for logging
  if (type === 0) {
    type_name = "Research"
  } else if (type === 1) {
    type_name = "Writing"
  } else {
    type_name = "Revision"
  }

  if(newProject) {
    console.log("New ", type_name," Project is Created")
    response.status(200).json('Project is created')
  } else {
    console.log("error")
    reponse.status(400).json('Error')
  }

// write to db -> add the project_id to the list in users table
  const updateUserRef = aref.child(`/users/${userId}/projects/`)
  return updateUserRef.push({
    'projects': newProject
  })
})

// CREATESUBPROJECT
exports.createSubproject = functions.https.onRequest((request, response) =>{

// set uid to that of currently logged in user
// const user = firebase.auth().currentUser;
// const uid = user.uid;
// const pid = user.uid.project_id;

// Set fixed uid and pid for testing
  const userId = "-KzyphA2HeggttUGpQ29"
  const pid = "-L6O7-DA-O57-803HAKh"

  // create project tied to uid
  const deadline = request.body.deadline;
  const progress = 0;
  const title = request.body.title;
  const task = [];
  const completedTasks = []
  const word_count = 0;

  const newSubproject = {
    deadline,
    progress,
    task,
    completedTasks,
    title,
    word_count
  }

  if(newSubproject) {
    console.log("New Subproject ", title, " is created")
    response.status(200).end()
  } else {
    console.log("error")
    response.status(400).end()
  }

// write to db -> add the project_id to the list in users table
  const updateUserRef = aref.child(`/users/${userId}/${pid}/subprojects/`)
  return updateUserRef.push({
    'subprojects': newSubproject
  })
})

// CREATETASK
exports.createTask = functions.https.onRequest((request, response) =>{
  // set uid to that of currently logged in user
  // const user = firebase.auth().currentUser;
  // assign a user id for now
  // const uid = user.uid;
  // const pid = user.pid;
  // const spid = user.pid.spid;
  // -> Why different UID for db and auth?
    const userId = "-KzyphA2HeggttUGpQ29";
    const pid = "-L6O7-DA-O57-803HAKh"
    const spid = "spid"

  
    // create task tied to user
    const deadline = request.body.deadline;
    const title = request.body.title;
  
    const newTask = {
      deadline,
      title
    }
    
    if(newTask) {
      console.log("New Task", title," is Created")
      response.status(200).end()
      // return response.json()
    } else {
      console.log("error")
      reponse.status(400).end()
      // return response.json()
    }
  
  // write to db -> add the project_id to the list in users table
    const updateUserRef = aref.child(`/users/${userId}/${pid}/${spid}/`)
    return updateUserRef.push({
      'tasks': newTask
    })
  })

// GETVIDEO
exports.getvideos = functions.https.onRequest((req, res) => {
  const videoquery = aref.child('videos').once('value', (snapshot) => {
    var vidlist = snapshot.val();

    return vidlist.reduce((payload, video) => {
      const { type } = video;
      const typeArr = payload[type.toLowerCase()];
      typeArr.push(video);

      payload[type.toLowerCase()] = typeArr;
      return payload;
    }, {
      research: [],
      writing: [],
      revision: []
    });
  });

  return videoquery.then((payload) => {
    return res.json(payload);
  });
});
