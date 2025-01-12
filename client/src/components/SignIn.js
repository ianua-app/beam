import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import React, { useState } from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import firebase from "firebase/app";
import "firebase/auth";

//var firebase = require('firebase');

var firebaseui = require('firebaseui');



function SignIn(props) {

  props.fbui.start('#firebaseui-auth-container', {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        document.getElementById("firebaseui-auth-container").innerHTML = "signed in!";
        document.location.href = "/";
        return false;
      }
    },
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // Other config options...
  });

  return(
    <div>
      <nav class="navbar navbar-light bg-light" >
        <Container fluid>
          <a class="navbar-brand" href="/">
            <img src="https://www.svgrepo.com/show/2230/hologram.svg" alt="" width="30" height="24" class="d-inline-block align-text-top" />
            Mindpads
          </a>
        </Container>
      </nav>
      <div id="firebaseui-auth-container"></div>
    </div>
  )
}

export default SignIn;