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
  const projects = []

 var authUser = admin.auth().createUser({
    email: email,
    firstName: firstName,
    password: password,
    lastName: lastName,
    projects: projects
  })
    .then(function(userRecord) {
      var tempId = 'users/'+ userRecord.uid;
      console.log("TempId: ", tempId);
      console.log("Successfully created new user:", firstName, " ", lastName, "email:", email);
      var newUserRef = admin.database().ref(tempId).set({
        'email': email,
        'firstName': firstName,
        'password': password,
        'lastName': lastName,
        'projects': []
      })
      return response.status(200).json({"email":email, "password": password});
      // return response.status(200).end();
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      return response.status(400).json(400);
      // return 400;
      // return response.status(400).json(400, 'Error ', error);   
    });
});

// LOGIN
exports.login = functions.https.onRequest((request, response) =>{
  const email = request.body.email
  const password = request.body.password

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(userRecord) {
    console.log("Successfully Logged In:", userRecord);
    return response.status(200).json(userRecord)
  })
  .catch(function(error) {
    console.log("Error Logging In:", email, "Error Code: ", error.code, "Error Message: ", error.message);
    return response.status(400).json(error);      
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
      return response.json();
    })
    .catch(function(error){
      console.log("failed to update user info");
      response.status(400).end();
      return response.json();
    })

    // Write to DB
    const updateUserRef = aref.child(`/users/${userId}/`)
    return updateUserRef.set({
      'email': newEmail,
      'firstName': newFirstName,
      'password': newPassword,
      'lastName': newLastName
    })
})

// CREATEPROJECT
exports.createProject = functions.https.onRequest((request, response) =>{

  // create project tied to uid
  const userId = request.body.uid;
  const deadline = request.body.deadline;
  const progress = 0;
  const title = request.body.title;
  const subprojects = [];
  // 0 = research, 1 = writing, 2 = revision
  const type = request.body.type;
  const key = request.body.uid;

  const newProject = {
    title,
    type,
    deadline,
    progress,
    subprojects,
    key
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
  const projRef = aref.child(`/projects/`)
  console.log("Pushing to Project Node", newProject)
  var pushRef = projRef.push({
    "title": title,
    "type": type,
    "deadline": deadline,
    "progress": progress,
    "subprojects": subprojects,
    "key": userId
  });

  // retrieve random string and push it under user.
  var projectId = pushRef.key;
  const userRef = aref.child(`/users/${userId}/projects/`);
  return pushRef, userRef.push({projectId});
})

// CREATESUBPROJECT
exports.createSubproject = functions.https.onRequest((request, response) =>{

  // create project tied to uid
  // const userId = request.body.uid;
  const projectId = request.body.pid;
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
  const subProjRef = aref.child(`/subprojects/`)
  var pushRef= subProjRef.push({
    "deadline": deadline,
    "progress": progress,
    "task": task,
    "completedTasks": completedTasks,
    "title": title,
    "wordcount": word_count
  })

    // retrieve random string and push it under user.
    var subProjectId = pushRef.key;
    const projRef = aref.child(`/projects/${projectId}/subprojects/`);
    return pushRef, projRef.push({subProjectId});
})

// CREATETASK
exports.createTask = functions.https.onRequest((request, response) =>{
    // create task tied to user
    const subprojId = request.body.spid;
    const deadline = request.body.deadline;
    const title = request.body.title;
    // const description = request.body.description;
    // const progress = 0;
    // // 0 : daily, 1 : Weekly, 2 : Monthly
    // const reminder = request.body.reminder;
    var completed = false;
  
    const newTask = {
      deadline,
      title,
      completed
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
    const taskRef = aref.child(`/tasks/`)
    console.log("After Reference")
    var pushRef = taskRef.push({
      "deadline": deadline,
      "title": title,
      "completed": completed      
    })

  // console.log("After push")
  // retrieve random string and push it under user.
  var taskId = pushRef.key;
  const subprojRef = aref.child(`/subprojects/${subprojId}/tasks/`);
  // console.log("Before Return")
  return pushRef, subprojRef.push({taskId});
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

// // GETPROJECTS
// exports.getprojects = functions.https.onRequest((req, res) => {
//   // Get the User Id
//   const uid = req.body.uid;
//   var pref = firebase.database().ref('projects')

//   // Query for projects
//   return pref.orderByChild("key").equalTo(uid).on("child_added", function(snapshot){
//     var projlist = snapshot.val()
//     // add each project object to an array
//     console.log(typeof projlist, projlist);
//       // Return the array
//     return res.status(200).send(projquery);
//   });

// });

// GETVIDEO
exports.getprojects = functions.https.onRequest((req, res) => {

  const uid = req.body.uid;
  var pref = firebase.database().ref('projects')

  const videoquery = pref.orderByChild("key").equalTo(uid).on("child_added", function(snapshot) {
    var vidlist = snapshot.val();

    const projarr = payload[vidlist];
    projarr.push(vidlist);
    payload[vidlist] = projarr;

    return vidlist.reduce((payload, video) => {
      const { type } = video;
      const typeArr = payload[type.toLowerCase()];
      typeArr.push(video);

      payload[type.toLowerCase()] = typeArr;
      return payload;
    }, {
      projArr: []
    });
  });

  return videoquery.then((payload) => {
    return res.json(payload);
  });
});
