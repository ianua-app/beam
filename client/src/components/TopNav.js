import {
  BrowserRouter as Router,
  useHistory
} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

function TopNav(props) {

  // const [user, setUser] = useState({});
  const history = useHistory();

  // useEffect(() => {
  //   firebase.auth().onAuthStateChanged((user) => {
  //     if (user) {
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/firebase.User
  //       console.log(user.email);
  //       var docRef = props.db.collection("users").doc(user.email);

  //       docRef.get().then((doc) => {
  //         if (doc.exists) {
  //           console.log("Document data:", doc.data());
  //           var userData = doc.data();
  //           userData.email = user.email;
  //           userData.hash = user.email.hashCode();

  //           if (userData.rooms == undefined)
  //             userData.rooms = [];

  //           setUser(userData);
  //         } else {
  //           // doc.data() will be undefined in this case
  //           console.log("No such document!");
  //         }
  //       }).catch((error) => {
  //           console.log("Error getting document:", error);
  //       });
  //       // ...
  //     } else {
  //       // User is signed out
  //       console.log("no user");
  //       history.push("/");
  //       // ...
  //     }
  //   });
  // }, [user.email]);

  return (
    <Navbar bg="light" style={{ "borderRadius": "35px 35px" }}>
      <Navbar.Brand href="/" className="mr-auto" style={{ "font-weight": "bold", "color": "darkslategray" }}>
        <img
          alt=""
          src="/beam.svg"
          width="30"
          height="30"
          className="d-inline-block align-top"
        />{' '}
        <span style={{ paddingLeft: "3px" }}>Beam</span>
      </Navbar.Brand>
      <span style={{ width: "100%", textAlign: "center", fontWeight: "bold", fontSize: "20px", color: "darkslategray" }}>{props.title}</span>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
        </Nav>
        <Nav>
          {props.user && props.user.email && <Nav.Link onClick={signOut}>Sign Out</Nav.Link>}

          {props.shuffle && <Button onClick={() => { props.shuffle(false) }}>◄</Button>}
          {props.shuffle && <Button style={{ marginLeft: "5px" }} onClick={() => { props.shuffle(true) }}>►</Button>}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )

  function signOut() {
    firebase.auth().signOut();
    // history.push("/");
  }
}

export default TopNav;