// Globals
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");
admin.initializeApp(functions.config().firebase);
const aref = admin.database().ref();
firebase.initializeApp(functions.config().firebase);
var fref = firebase.database().ref();

// REGISTER
exports.register = functions.https.onRequest((request, response) => {
  // Read the info from request
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  const password = request.body.password;
  const projects = [];
  const notification = false;

  var authUser = admin
    .auth()
    .createUser({
      email: email,
      firstName: firstName,
      password: password,
      lastName: lastName,
      projects: projects
    })
    .then(function (userRecord) {
      var tempId = "users/" + userRecord.uid;
      var sid = "settings/" + userRecord.uid;
      console.log("TempId: ", tempId);
      console.log(
        "Successfully created new user:",
        firstName,
        " ",
        lastName,
        "email:",
        email
      );
      // Add pushing notification
      var sref = admin
        .database()
        .ref(sid)
        .set({
          notification: notification
        });
      var newUserRef = admin
        .database()
        .ref(tempId)
        .set({
          email: email,
          firstName: firstName,
          password: password,
          lastName: lastName,
          projects: []
        });
      return response.status(200).json({
        email: email,
        password: password
      });
      // return response.status(200).end();
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
      return response.status(400).json(400);
      // return 400;
      // return response.status(400).json(400, 'Error ', error);
    });
});

// LOGIN
exports.login = functions.https.onRequest((request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(function (userRecord) {
      console.log("Successfully Logged In:", userRecord);
      return response.status(200).json(userRecord);
    })
    .catch(function (error) {
      console.log(
        "Error Logging In:",
        email,
        "Error Code: ",
        error.code,
        "Error Message: ",
        error.message
      );
      return response.status(400).json(error);
    });
});

// LOGOUT
exports.logout = functions.https.onRequest((request, response) => {
  // get the currently logged in user
  const user = firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      firebase
        .auth()
        .signOut()
        .then(function () {
          console.log("You are signed out!");
          response.status(200).end();
          return response.json();
        })
        .catch(function (error) {
          console.log(
            "Error Logging out ",
            "Error Code: ",
            error.code,
            "Error Message: ",
            error.message
          );
          response.status(400).end();
          return response.json();
        });
    } else {
      console.log("No Current User");
      response.status(200).end();
      return response.json();
    }
  });
});

// CREATEPROJECT
exports.createProject = functions.https.onRequest((request, response) => {
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
  };

  console.log("Type :  ", type);
  // for logging
  if (type === 0) {
    type_name = "Research";
  } else if (type === 1) {
    type_name = "Writing";
  } else {
    type_name = "Revision";
  }

  if (newProject) {
    console.log("New ", type_name, " Project is Created");
    response.status(200).json("Project is created");
  } else {
    console.log("error");
    reponse.status(400).json("Error");
  }

  // write to db -> add the project_id to the list in users table
  const projRef = aref.child(`/projects/`);
  console.log("Pushing to Project Node", newProject);
  var pushRef = projRef.push({
    title: title,
    type: type,
    deadline: deadline,
    progress: progress,
    subprojects: subprojects,
    key: userId
  });

  // retrieve random string and push it under user.
  var projectId = pushRef.key;
  const userRef = aref.child(`/users/${userId}/projects/`);
  return pushRef, userRef.push({
    projectId
  });
});

// CREATESUBPROJECT
exports.createSubproject = functions.https.onRequest((request, response) => {
  // create project tied to uid
  const parentProject = request.body.pid;
  const projectId = request.body.pid;
  const deadline = request.body.deadline;
  const progress = 0;
  const title = request.body.title;
  const task = [];
  const completedTasks = [];
  const word_count = 0;

  const newSubproject = {
    deadline,
    progress,
    task,
    completedTasks,
    title,
    word_count,
    parentProject
  };

  if (newSubproject) {
    console.log("New Subproject ", title, " is created");
    response.status(200).end();
  } else {
    console.log("error");
    response.status(400).end();
  }

  // write to db -> add the project_id to the list in users table
  const subProjRef = aref.child(`/subprojects/`);
  var pushRef = subProjRef.push({
    deadline: deadline,
    progress: progress,
    task: task,
    completedTasks: completedTasks,
    title: title,
    wordcount: word_count,
    parentProect: parentProject
  });

  // retrieve random string and push it under user.
  var subProjectId = pushRef.key;
  const projRef = aref.child(`/projects/${projectId}/subprojects/`);
  return pushRef, projRef.push({
    subProjectId
  });
});

// CREATETASK
exports.createTask = functions.https.onRequest((request, response) => {
  // create task tied to user
  const parentSubproject = request.body.spid;
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
    completed,
    parentSubproject
  };

  if (newTask) {
    console.log("New Task", title, " is Created");
    response.status(200).end();
    // return response.json()
  } else {
    console.log("error");
    reponse.status(400).end();
    // return response.json()
  }

  // write to db -> add the project_id to the list in users table
  const taskRef = aref.child(`/tasks/`);
  console.log("After Reference");
  var pushRef = taskRef.push({
    deadline: deadline,
    title: title,
    completed: completed,
    parentSubproject: parentSubproject
  });

  // console.log("After push")
  // retrieve random string and push it under user.
  var taskId = pushRef.key;
  const subprojRef = aref.child(`/subprojects/${subprojId}/tasks/`);
  // console.log("Before Return")
  return pushRef, subprojRef.push({
    taskId
  });
});

// GETVIDEO
exports.getvideos = functions.https.onRequest((req, res) => {
  const videoquery = aref.child("videos").once("value", snapshot => {
    var vidlist = snapshot.val();

    return vidlist.reduce(
      (payload, video) => {
        const {
          type
        } = video;
        const typeArr = payload[type.toLowerCase()];
        typeArr.push(video);

        payload[type.toLowerCase()] = typeArr;
        return payload;
      }, {
        research: [],
        writing: [],
        revision: []
      }
    );
  });

  return videoquery.then(payload => {
    return res.json(payload);
  });
});

// GETPROJECTS
exports.getprojects = functions.https.onRequest((req, res) => {
  const uid = req.body.uid;
  var projectref = fref.child("projects");
  var projarr = [];

  // Make the promise object for query
  const projpromise = projectref
    .orderByChild("key")
    .equalTo(uid)
    .once("value");
  // Another Promise for pushing to array
  const pushpromise = projpromise
    .then(snap => {
      var proj_item = snap.val();

      // push to array
      projarr.push(proj_item);
      return proj_item;
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });

  // Respond with array
  return pushpromise
    .then(proj_item => {
      var newArr = Object.assign({}, projarr);
      console.log(newArr);
      return res.json(200, newArr);
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });
});

exports.getprojectbyid = functions.https.onRequest((req, res) => {
  const pid = req.body.pid;
  // query for everything
  var rdeadline = "";
  var rprogress = 0;
  var rtitle = "";
  var rtype = 0;
  var rsubprojects = [];


  // access the projects node with pid
  var pqueryref = fref.child(`projects/${pid}/`).once("value");
  var squeryref = fref.child("subprojects").orderByChild("parentProect").equalTo(pid).once("value");

  const projectinfo = pqueryref.then(function (snapshot) {
    rdeadline = snapshot.val().deadline;
    rprogress = snapshot.val().progress;
    rtitle = snapshot.val().title;
    rtype = snapshot.val().type;

    const pinfo = {
      "deadline": rdeadline,
      "progress": rprogress,
      "title": rtitle,
      "type": rtype
    }

    console.log("pinfo: ", pinfo);
    return pinfo;
  })

  const subprojectinfo = squeryref.then(function (snapshot) {

    console.log("subproject: ", snapshot.val());
    rsubprojects.push(snapshot.val());

    pqueryref.then(pinfo => {
      const spinfo = {
        "deadline": pinfo.deadline,
        "progress": pinfo.progress,
        "title": pinfo.title,
        "type": pinfo.type,
        "subprojects": rsubprojects
      }
      return spinfo;
    })
  })

  return subprojectinfo.then(function (value) {

    // make return object of project with all the sub project info + project info
    return res.json(200, {
      "deadline": rdeadline,
      "progress": rprogress,
      "title": rtitle,
      "type": rtype,
      "subprojects": rsubprojects
    });
  })
});

exports.getsubprojectbyid = functions.https.onRequest((req, res) => {
  const pid = req.body.spid;
  var subprojectref = fref.child("subprojects");

  return subprojectref
    .orderByKey()
    .equalTo(pid)
    .limitToFirst(1)
    .on("child_added", function (snapshot) {
      const pbyid = snapshot.val();
      console.log(pbyid);
      return res.send(pbyid);
    });
});

// GETTASKS
exports.gettasks = functions.https.onRequest((req, res) => {
  const spid = req.body.spid;
  var projectref = fref.child("tasks");
  var taskarr = [];

  // Make the promise object for query
  const taskpromise = projectref
    .orderByChild("parentSubproject")
    .equalTo(spid)
    .once("value");
  // Another Promise for pushing to array
  const pushpromise = taskpromise
    .then(snap => {
      var task_item = snap.val();

      // push to array
      taskarr.push(task_item);
      return task_item;
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });

  // Respond with array
  return pushpromise
    .then(task_item => {
      var newArr = Object.assign({}, taskarr);
      console.log(newArr);
      return res.json(200, newArr);
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });
});

// GETGLOBALTASKS
exports.getglobaltasks = functions.https.onRequest((req, res) => {
  const globaluser = req.body.uid;
  const spid = req.body.spid;
  var projectref = fref.child("tasks");
  var taskarr = [];

  // Make the promise object for query
  const taskpromise = projectref
    .orderByChild("parentSubproject")
    .equalTo(spid)
    .once("value");
  // Another Promise for pushing to array
  const pushpromise = taskpromise
    .then(snap => {
      var task_item = snap.val();

      // push to array
      taskarr.push(task_item);
      return task_item;
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });

  // Respond with array
  return pushpromise
    .then(task_item => {
      var newArr = Object.assign({}, taskarr);
      console.log(newArr);
      return res.json(200, newArr);
    })
    .catch(reason => {
      console.log(reason);
      return res.json(400);
    });
});

// UPDATESETTING
exports.updateSetting = functions.https.onRequest((req, res) => {
  const uid = req.body.uid;
  const notification = req.body.notification;
  const password = req.body.password;

  var uref = fref.child(`users/${uid}/password`);
  var sref = fref.child(`settings/${uid}/`);

  // Check pw
  const pwpromise = uref
    .orderByChild("password")
    .once("value")
    .then(snap => {
      const pw = snap.val();
      return pw;
    });

  // password matches, go into notification setting.
  return pwpromise
    .then(pw => {
      // if it checks out, change the notification
      if (pw === password) {
        if (notification === true) {
          console.log("notification: ", notification);
          const rtstr = "notification: " + notification;
          sref.set({
            notification: true
          });
          return res.json(200, rtstr);
        } else {
          const rtstr = "notification: " + notification;
          console.log("notification: ", notification);
          sref.set({
            notification: false
          });
          return res.json(200, rtstr);
        }
      }
    })
    .catch(reason => {
      console.log("Failed to change notification setting: ", reason);
      return res.json(400);
    });
});