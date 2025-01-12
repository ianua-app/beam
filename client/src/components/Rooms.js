import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  useLocation,
  useHistory
} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Alert from 'react-bootstrap/Alert';

import TopNav from './TopNav'

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const testdata = require('../data/templates.json');

function Rooms(props) {

  const [user, setUser] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [templates, setTemplates] = useState(testdata.scenes);

  const { url } = useRouteMatch();
  let location = useLocation();
  const history = useHistory();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        //console.log(user.email);
        var docRef = props.db.collection("users").doc(user.email);

        docRef.get().then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            var userData = doc.data();
            userData.email = user.email;
            userData.hash = user.email.hashCode();

            if (userData.rooms === undefined)
              userData.rooms = [];

            setUser(userData);
            setDataLoaded(true);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
        // ...
      } else {
        // User is signed out
        console.log("no user");
        history.push("/");
        // ...
      }
    });
  }, [user.email]);

  function openRoom(template, e) {
    // Add a new document with a generated id.
    e.preventDefault();

    var userRoom;
    for (const [key, value] of Object.entries(user.rooms)) {
      if (value.templateId == template.id)
        userRoom = value;
    }

    if (userRoom === undefined) {
      var newRoom = JSON.parse(JSON.stringify(template));
      newRoom.owners = [
        user.email
      ];

      newRoom.templateId = newRoom.id;
      delete newRoom.id;

      props.db.collection("rooms").add(newRoom)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);

          newRoom.id = docRef.id;
          user.rooms.push({
            "id": docRef.id,
            "templateId": template.id
          });

          props.db.collection("users").doc(user.email).set(user)
            .then((docRef) => {
              history.push("/rooms/" + newRoom.id, {
                room: newRoom
              });
            })
            .catch((error) => {
              console.error("Error updating user document: ", error);
            });
        })
        .catch((error) => {
          console.error("Error updating user document: ", error);
        });
    }
    else {
      var newRoom = JSON.parse(JSON.stringify(template));
      newRoom.id = userRoom.id;
      history.push("/rooms/" + userRoom.id, {
        room: newRoom
      });
    }
  }

  function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
  }

  // generateId :: Integer -> String
  function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
  }

  return (
    <div>
      <TopNav user={user} />
      <Container id="menuContent" >
        <br />
        {/* <h1 class="display-5">Locations</h1> */}
        <Alert variant={"primary"}>
          Click the "Start Huddle! 👋" button to open up any of these virtual locations.  Then you can forward the link to anyone to join you there for a video chat.
        </Alert>


        <Row>
          {templates.map((template) =>
            <div class="col-lg-4" style={{ width: "auto", marginBottom: "15px", marginLeft: "auto", marginRight: "auto" }}>
              <div class="card" style={{ width: "18rem", marginLeft: "auto", marginRight: "auto" }}>
                <img src={template.preview} class="card-img-top" style={{ objectFit: "cover", height: "200px" }} alt="..." />
                <div class="card-body">
                  <h3 class="card-title">{template.title}</h3>
                  <p class="card-text">{template.description}</p>
                  <div class="btn-group" role="group" aria-label="Basic outlined example">
                    <button type="button" class="btn btn-primary" style={{ color: "white", textDecoration: "none" }} onClick={(e) => openRoom(template, e)}>
                      Start Huddle! 👋
                    </button>
                  </div>
                </div>
                <div class="card-footer">
                  <small class="text-muted">Author: Bazapi.com</small>
                </div>
              </div>
            </div>
          )}
          <div class="col-lg-4" style={{ opacity: ".7", width: "auto", marginBottom: "15px", marginLeft: "auto", marginRight: "auto" }}>
            <div class="card" style={{ width: "18rem", marginLeft: "auto", marginRight: "auto" }}>
              {/* <img src="https://i.pinimg.com/originals/93/29/4a/93294af6a4a352bdb07f673892efcb09.png" class="card-img-top" style={{objectFit: "cover", height: "200px"}} alt="..." /> */}
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRIuaWkL6T4fqCRYqAa-fZf9UTKnhgOVymJjNLRQw9j0fG9CiFE0GRoq3uNS14sq9J86k&usqp=CAU" class="card-img-top" style={{ objectFit: "cover", height: "200px" }} alt="..." />
              <div class="card-body">
                <h3 class="card-title">Coming Soon!</h3>
                <p class="card-text">Design your own Huddles, right in your browser.  It will be awesome!</p>
                <div class="btn-group" role="group" aria-label="Basic outlined example">
                  {/* <button type="button" class="btn btn-secondary" style={{color: "white", textDecoration: "none", cursor: "default"}}>
                    Coming Soon! 👋
                  </button> */}
                </div>
              </div>
              <div class="card-footer">
                <small class="text-muted">Author: Bazapi.com</small>
              </div>
            </div>
          </div>
        </Row>
        <br></br><br></br>
      </Container>
    </div>
  );
}

export default Rooms;