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

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const indexData = require('../data/templates.json');

export default function Templates(props) {

  const [user, setUser] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [pads, setPads] = useState({});
  const [templates, setTemplates] = useState(indexData.scenes);

  const { url } = useRouteMatch();
  let location = useLocation();
  const history = useHistory();
  
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log(user.email);
        var docRef = props.db.collection("users").doc(user.email);
  
        docRef.get().then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            var userData = doc.data();
            userData.email = user.email;
            userData.hash = user.email.hashCode();

            setUser(userData);
            if (userData.pads) setPads(userData.pads);
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
  

  function signOut() {
    firebase.auth().signOut();
  }

  return (
  <div>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/" className="mr-auto">
        <img
          alt=""
          src="logo18.png"
          width="30"
          height="30"
          className="d-inline-block align-top"
        />{' '}
        Mindpads.com
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto" style={{marginLeft: "10px", marginTop: "4px"}}>

          <Nav.Link href="/templates">Templates</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link onClick={signOut}>Sign Out</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    <Container id="menuContent" >
      <br/>

      <h1 class="display-5">Templates</h1>
      <br/>
      <Row>
          {templates.map((template) =>
            <div class="col-lg-4" style={{"margin-bottom": "15px"}}>
              <div class="card" style={{"width": "18rem"}}>
                <img src={template.preview} class="card-img-top" style={{objectFit: "cover", height: "200px"}} alt="..." />
                <div class="card-body">
                  <h5 class="card-title">{template.title}</h5>
                  <p class="card-text">{template.description}</p>
                  <div class="btn-group" role="group" aria-label="Basic outlined example">
                    <button type="button" class="btn btn-primary" style={{color: "white", textDecoration: "none"}} >
                      <Link style={{color: "white"}} to={"/" + template.id}>Open ➚</Link>
                    </button>
                  </div>
                </div>
                <div class="card-footer">
                  <small class="text-muted">Last updated 3 mins ago</small>
                </div>
              </div>
            </div>
          )}
      </Row>
      <br></br><br></br>
    </Container>
  </div>
  );
}
