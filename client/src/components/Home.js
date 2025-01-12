import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
  useHistory
} from "react-router-dom";

import React, { useState, useEffect } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Alert from 'react-bootstrap/Alert';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';

import example1 from '../img/example1.jpg'
import example2 from '../img/example2.jpg'
import histk from '../img/histk.png'

import TopNav from './TopNav'

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
var firebaseui = require('firebaseui');

function Home(props) {
  const user = useState();
  const history = useHistory();

  useEffect(() => {
    // props.ui.start('#firebaseui-auth-container', {
    //   callbacks: {
    //     signInSuccessWithAuthResult: function (authResult, redirectUrl) {
    //       // User successfully signed in
    //       var userData = {
    //         email: authResult.user.email,
    //         id: authResult.user.email.hashCode()
    //       }
    //       props.db.collection("users").doc(userData.email).set(userData)
    //         .catch((error) => {
    //           console.error("Error updating user document: ", error);
    //         }, { merge: true });

    //       history.push("/rooms");
    //       return false;
    //     }
    //   },
    //   signInFlow: 'popup',
    //   signInOptions: [
    //     firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //     firebase.auth.GoogleAuthProvider.PROVIDER_ID
    //   ],
    //   // Other config options...
    // });

    // firebase.auth().onAuthStateChanged((user) => {
    //   if (user) {
    //     history.push("/rooms");
    //   } else {
    //     console.log("user logged out");
    //   }
    // });

    return () => {
      // Clean up the subscription
    };
  });

  var imgStyle = {
    height: "150px",
    marginLeft: "auto",
    marginRight: "auto",
    boxShadow: "inset 0 0 0 1000px rgba(0,0,0,.83)",
  }

  var carItemStyle = {
    height: "75vh",
    backgroundColor: "#F8F8F8"
  }

  var overlayStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    opacity: ".35"
  }

  var jumboStyle = {
    // backgroundImage: "url(https://www.coolibri.de/wp-content/uploads/2018/07/05_11_18_Coffee_Pirates.jpg)",
    // boxShadow: "rgb(90 170 255) 0px 0px 0px 1000px inset",
    color: "darkslategray",
    // borderRadius: "7em",
    // margin: "15px",
    textAlign: "center",
  }

  var huddlePreviewStyle = {
    backgroundImage: "url(" + example1 + ")",
    boxShadow: "inset 0 0 0 1000px rgba(0,0,0,.20)",
    color: "white",
    height: "170px",
    width: "210px",
    backgroundSize: "auto 100%",
    backgroundRepeat: "no-repeat",
    backgroundColor: "transparent",
    borderRadius: "15px",
    marginBottom: "10px",
    display: "inline-block",
  }

  var huddlePreviewStyle2 = {
    backgroundImage: "url(" + example2 + ")",
    boxShadow: "inset 0 0 0 1000px rgba(0,0,0,.20)",
    color: "white",
    height: "170px",
    width: "210px",
    backgroundSize: "auto 100%",
    backgroundRepeat: "no-repeat",
    backgroundColor: "transparent",
    borderRadius: "15px",
    marginBottom: "10px",
    display: "inline-block",
    marginLeft: "5px",
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

  function startNewBeam() {
    var newId = generateId(8);
    history.push("/" + newId);
  }

  return (
    <div>
      <TopNav user={user} />
      <Jumbotron style={jumboStyle}>
        <h1 className="display-3" style={{ fontWeight: "bold", overflowY: "auto" }}>Beam Together</h1>
        <p className="lead">Meet & chat in unusual & delightful locations, right in your browser.</p>
        {/* <hr className="my-2" /> */}
        <span style={huddlePreviewStyle} /><span style={huddlePreviewStyle2} />
        <p className="lead">Start a Beam right here, share with just a link, no registration required.</p>
        <p className="lead" style={{ textAlign: "center" }}>
          <center>
            {/* <div id="firebaseui-auth-container" style={{ width: "300px", marginTop: "20px" }}></div> */}
            <Button color="primary" style={{ height: "65px", fontSize: "24px" }} onClick={startNewBeam}>Start Beam</Button>

            <div style={{ marginTop: "25px" }}>
              Requires a webcam and microphone, and currently works in Chrome / Chromium-based browsers.
            </div>

            {/* <div style={{ marginTop: "15px" }}>
              <a href="https://www.google.com/chrome/">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/2048px-Google_Chrome_icon_%28September_2014%29.svg.png" width="50px" />
              </a>
            </div> */}
          </center>
        </p>
      </Jumbotron>

    </div>
  )
}

export default Home;