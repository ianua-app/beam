import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch,
  useLocation,
  useHistory
} from "react-router-dom";

import axios from 'axios';

import * as tf from '@tensorflow/tfjs';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import TopNav from './TopNav'

import firebase from "firebase/app";
import "firebase/firestore";

const testdata = require('../data/templates.json');

const bodyPix = require('@tensorflow-models/body-pix');

var localUuid = createUUID();
var localDisplayName = localUuid;
var localStream;
var bodyPixNet;
var paintRunning = false;
var serverConnection;
var peerConnections = {};
var videoResWidth = 240;
var videoResHeight = 240;
var roomId;

var paint = true;

var peerConnectionConfig = {
  'iceServers': [
    { 'urls': 'stun:stun.stunprotocol.org:3478' },
    { 'urls': 'stun:stun.l.google.com:19302' },
  ]
};

function Room(props) {

  // let [user, setUser] = useState()
  let { id } = useParams();
  let location = useLocation();
  var currentRoom = undefined;
  if (location.state && location.state.room)
    currentRoom = location.state.room;

  let [roomIndex, setRoomIndex] = useState(0);
  let [room, setRoom] = useState(currentRoom);
  let [initializeTimesteamp] = useState(Date.now());
  let [lastUpdate, setLastUpdate] = useState((new Date()).toISOString());
  let [localUser, setLocalUser] = useState();
  let [users, setUsers] = useState([]);
  let [userIds, setUserIds] = useState([]);
  let [videoHeight] = useState(videoResHeight);
  let [videoWidth] = useState(videoResWidth);

  let [backgroundWidth, setBackgroundWidth] = useState(1682);
  let [backgroundHeight, setBackgroundHeight] = useState(1231);
  let [windowWidth] = useState(window.innerWidth);

  let [toolboxOpen, setToolboxOpen] = useState(false);
  let [drawPeople, setDrawPeople] = useState(true);
  let [modalOpen, setModalOpen] = useState(true);

  const history = useHistory();

  roomId = id;

  console.log("STARTING ROOM for " + localUuid);

  // firebase.auth().onAuthStateChanged((user) => {
  //   if (user) {
  //     setUser(user);
  //   } else {
  //     console.log("user logged out");
  //     history.push("/");
  //   }
  // });

  useEffect(() => {
    console.log("ENTER UseEffect");
    applyNewRoomIndex(roomIndex);

    // setRoom(testdata.scenes[roomIndex]);

    // setTimeout(function () {
    //   backgroundResize();
    // }, 500);
    // if (!room) {
    //   var docRef = props.db.collection("rooms").doc(id);

    //   docRef.get().then((doc) => {
    //     if (doc.exists) {
    //       var roomData = doc.data();

    //       setRoom(roomData);
    //     } else {
    //       // doc.data() will be undefined in this case
    //       console.log("No such room!");
    //     }
    //   }).catch((error) => {
    //     console.log("Error getting room:", error);
    //   });
    // }

    start();

    paint = true;
    perform();

    return () => {
      // Clean up the subscription
      paint = false;

      if (localStream) {
        const tracks = localStream.getTracks();

        tracks.forEach(function (track) {
          track.stop();
        });

        //localStream.getTracks()[0].stop();
      }

      console.log("EXIT UseEffect")
    };
  }, [initializeTimesteamp]);

  useLayoutEffect(() => {
    console.log("ENTER UseLayoutEffect");
    backgroundResize();
    window.addEventListener('resize', backgroundResize);

    return () => {
      //if (localUser && localUser.video) localUser.video.current.srcObject = null;
      window.removeEventListener('resize', backgroundResize);
      console.log("EXIT UseLayoutEffect");
    };
  });

  function backgroundResize() {
    var backgroundImg = document.getElementById('backgroundimage');
    var peopleBox = document.getElementById('peopleBox');

    if (backgroundImg) {
      peopleBox.style["width"] = backgroundImg.offsetWidth + "px";
      peopleBox.style["left"] = backgroundImg.offsetLeft + "px";
    }
  }

  function mExport(e) {
    console.log("hello")

    var peopleBox = document.getElementById("peopleBox");
    var exportData = [];

    peopleBox.childNodes.forEach((node, index) => {
      console.log("child");

      var newObj = {};
      var styles = node.attributes.style.value.split(";");
      styles.forEach((att, i) => {
        var attSplits = att.split(":");
        if (attSplits.length > 1) {
          var name = attSplits[0].trim();
          var value = attSplits[1].trim();

          if (name === "--top") {
            newObj.top = value;
          }
          else if (name == "--left") {
            newObj.left = value;
          }
          else if (name == "--width") {
            newObj.width = value;
          }
          else if (name == "--height") {
            newObj.height = value;
          }
          else if (name == "--rotate") {
            newObj.rotate = value;
          }
        }
      });

      exportData.push(newObj);
    });

    console.log(JSON.stringify(exportData, null, 2));
  }

  function copyUrlToClipboard() {
    var dummy = document.createElement('input'),
      text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  function shuffleLocation(forward = true) {
    var newRoomIndex = roomIndex + 1;

    if (!forward)
      newRoomIndex = newRoomIndex - 2;

    if (newRoomIndex >= testdata.scenes.length) newRoomIndex = 0;
    if (newRoomIndex < 0) newRoomIndex = testdata.scenes.length - 1;

    applyNewRoomIndex(newRoomIndex);

    if (serverConnection && serverConnection.readyState == 1)
      serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'setScene': newRoomIndex, 'dest': roomId, 'room': roomId, 'timestamp': initializeTimesteamp }));

  }

  function applyNewRoomIndex(newIndex) {

    setDrawPeople(false);

    setRoomIndex(newIndex);
    setRoom(testdata.scenes[newIndex]);

    setTimeout(function () {
      backgroundResize();
      setDrawPeople(true);
      var audioElement = document.getElementById("backgroundAudio");
      if (audioElement) {
        audioElement.load();
        audioElement.play();
        audioElement.volume = .4;
      }
    }, 1500);
  }

  function onModalClose() {
    setModalOpen(false)
  }

  return (
    <div>
      {room ? <TopNav shuffle={shuffleLocation} title={room.title} /> : <TopNav shuffle={shuffleLocation} />}
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={modalOpen}
        onHide={() => onModalClose()}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Welcome to your Beam!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <h4>Centered Modal</h4> */}
          <p>
            You can invite anyone to join by sending them the link to this page:
            <br />
            <br />
            <Alert id="urlAlert" variant={"primary"}>
              {window.location.href}
            </Alert>
            <Button onClick={() => copyUrlToClipboard()}>Copy link to clipboard</Button>
            <br />
            <br />
            They will not have to register - anyone can join a Beam by just clicking on the link.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <div id="menuContent" className="container-fluid">
        <div id="videos" className="videos" style={{ position: "fixed", opacity: "0" }}>
          {users.map((user) =>
            user.id === localUser.id
              ? <video id={"video_" + user.id} key={user.id} ref={user.video} muted autoPlay height={videoHeight} width={videoWidth} />
              : <video id={"video_" + user.id} key={user.id} ref={user.video} autoPlay height={videoHeight} width={videoWidth} />
          )}
        </div>

        {room &&
          <div id="background" className="row">
            <img alt="Tiny Trip background" id="backgroundimage" src={room.preview} style={{ height: "calc(100vh - 56px)", margin: "auto", "padding": "0px" }} />
            <div id="peopleBox" style={{ position: "absolute", height: "calc(100vh - 56px)", margin: "auto", padding: "auto" }}  >
              {drawPeople && users.map((user, index) =>
                index < room.positions.length
                  ? <deckgo-drr id={"box_" + user.id} key={user.id} style={{ "--width": room.positions[index].width, "--height": room.positions[index].height, "--left": room.positions[index].left, "--top": room.positions[index].top, "--rotate": room.positions[index].rotate }}>
                    <canvas id={"canvas_" + user.id} height="240px" width="240px" class="animate__animated animate__fadeInDown"/>
                  </deckgo-drr>
                  : <deckgo-drr id={"box_" + user.id} key={user.id} style={{ "--width": "10%", "--height": "10%" }}>
                    <canvas id={"canvas_" + user.id} height="240px" width="240px" class="animate__animated animate__fadeInDown" />
                  </deckgo-drr>
              )}
            </div>
            {room.sound &&
              <audio controls id="backgroundAudio" autoplay loop style={{ position: "fixed", bottom: "10px", right: "14px", width: "125px" }}>
                <source src={room.sound} type="audio/mpeg" />
              </audio>
            }
            <Button style={{ position: "fixed", bottom: "10px", left: "10px" }} onClick={() => { mExport(); setModalOpen(true); }}>Join Info</Button>
          </div>
        }
      </div>
    </div>
  );

  function start() {

    var constraints = {
      video: {
        width: {
          ideal: videoResWidth
        },
        height: {
          ideal: videoResHeight
        }
      },
      audio: true,
    };

    // var constraints = {
    //   video: true,
    //   audio: true,
    // };

    if (!bodyPixNet) loadBodyPix();

    // set up local video stream
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          // if (userIds.indexOf(localUuid) == -1) {
          //setLocalStream(stream);
          localStream = stream;
          var user = { id: localUuid, video: React.createRef(), timestamp: initializeTimesteamp };
          setLocalUser(user);
          users.push(user);
          setUsers([user]);

          if (user.video.current) {
            user.video.current.srcObject = stream;
          }

          axios("/parameters").then(function (response) {
            initWebsocket(response.data.CLIENT_PREFIX, response.data.CLIENT_SUFFIX);
          })

        }).catch((error) => {
          console.log("Error starting webcam, probably is not enabled for this site.")
        }).then(() => {
          // if (!serverConnection) {
          //   serverConnection = new WebSocket("wss://localhost:8443");
          //   serverConnection.onmessage = gotMessageFromServer;
          //   serverConnection.onopen = event => {
          //     serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': roomId, 'room': roomId, 'timestamp': ts }));
          //   } 
          // }
          // axios("/parameters").then(function(response) {
          //   var url = 'wss://' + window.location.hostname;
          //   if (response.data.CLIENT_SUFFIX) url += response.data.CLIENT_SUFFIX;
          //   serverConnection = new WebSocket(url);
          //   serverConnection.onmessage = gotMessageFromServer;
          //   serverConnection.onopen = event => {
          //     serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': roomId, 'room': roomId, 'timestamp': ts }));
          //   }
          // })

        }).catch((error) => {
          console.log("Error starting webcam, probably is not enabled for this site.")
        });

    } else {
      //alert('Your browser does not support getUserMedia API');
    }
  }

  function initWebsocket(clientPrefix, clientSuffix) {
    var url = clientPrefix ? clientPrefix + window.location.hostname : 'wss://' + window.location.hostname;
    if (clientSuffix) url += clientSuffix;
    serverConnection = new WebSocket(url);
    serverConnection.onclose = function (event) {
      console.log("WebSocket is closed now, trying to reopen...");
      // setTimeout(function() {
      //   initWebsocket(clientSuffix);
      // }, 1000);
    };
    serverConnection.onerror = function (event) {
      console.error("WebSocket error observed: ", event);
    };
    serverConnection.onmessage = gotMessageFromServer;
    serverConnection.onopen = event => {
      serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': roomId, 'room': roomId, 'timestamp': initializeTimesteamp }));

      setInterval(function () {
        // keep alive websocket
        if (serverConnection.readyState == 1)
          serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': "ping", 'room': roomId, 'timestamp': initializeTimesteamp }));
        else {
          console.log("Would like to ping websocket server, but is closed, so trying to reopen...")
          initWebsocket(clientPrefix, clientSuffix);
        }

      }, 5000);
    }
  }

  function gotMessageFromServer(message) {
    var signal = JSON.parse(message.data);
    var peerUuid = signal.uuid;

    if (signal.dest == roomId && signal.setScene !== undefined) {

      applyNewRoomIndex(signal.setScene);
      // setRoomIndex(signal.setScene);
      // setRoom(testdata.scenes[signal.setScene]);

      // setTimeout(function () {
      //   backgroundResize();
      // }, 500);
    }

    // Ignore messages that are not for us or from ourselves
    if (peerUuid == localUuid || (signal.dest != localUuid && signal.dest != roomId) || !peerUuid) return;

    if (signal.displayName && signal.dest == roomId) {
      // set up peer connection object for a newcomer peer
      setUpPeer(peerUuid, signal.displayName, signal.timestamp);
      serverConnection.send(JSON.stringify({ 'displayName': localDisplayName, 'uuid': localUuid, 'dest': peerUuid, 'room': roomId, 'timestamp': initializeTimesteamp }));
    } else if (signal.displayName && signal.dest == localUuid) {
      // initiate call if we are the newcomer peer
      setUpPeer(peerUuid, signal.displayName, signal.timestamp, true);
    } else if (signal.sdp) {
      peerConnections[peerUuid].pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnections[peerUuid].pc.createAnswer().then(description => createdDescription(description, peerUuid));
        }
      });

    } else if (signal.ice) {
      peerConnections[peerUuid].pc.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
  }

  function setUpPeer(peerUuid, displayName, timestamp, initCall = false) {
    peerConnections[peerUuid] = { 'displayName': displayName, 'pc': new RTCPeerConnection(peerConnectionConfig) };
    peerConnections[peerUuid].pc.onicecandidate = event => gotIceCandidate(event, peerUuid);
    peerConnections[peerUuid].pc.ontrack = event => gotRemoteStream(event, peerUuid, timestamp);
    peerConnections[peerUuid].pc.oniceconnectionstatechange = event => checkPeerDisconnect(event, peerUuid);
    peerConnections[peerUuid].pc.addStream(localStream);

    if (initCall) {
      peerConnections[peerUuid].pc.createOffer().then(description => createdDescription(description, peerUuid));
    }
  }

  function gotIceCandidate(event, peerUuid) {
    if (event.candidate != null) {
      serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': localUuid, 'dest': peerUuid, 'room': roomId }));
    }
  }

  function createdDescription(description, peerUuid) {
    console.log(`got description, peer ${peerUuid}`);
    peerConnections[peerUuid].pc.setLocalDescription(description).then(function () {
      serverConnection.send(JSON.stringify({ 'sdp': peerConnections[peerUuid].pc.localDescription, 'uuid': localUuid, 'dest': peerUuid, 'room': roomId }));
    });
  }

  function gotRemoteStream(event, peerUuid, timestamp) {
    console.log(`got remote stream, peer ${peerUuid}`);
    //assign stream to new user object
    var user;
    if (!users.some(user => user["id"] === peerUuid)) {

      var newUsers = users;
      user = { id: peerUuid, video: React.createRef(), timestamp: timestamp };
      user.lastUpdate = (new Date()).toISOString();
      newUsers.push(user);
      setUsers(newUsers);
    }
    else {
      user = users.find(user => user["id"] === peerUuid);
    }

    users.sort(function (x, y) {
      return x.timestamp - y.timestamp;
    });

    setLastUpdate(user.lastUpdate);

    var retryFunc = function () {
      if (user.video.current) {
        user.video.current.srcObject = event.streams[0];
      }
      else {
        user.lastUpdate = (new Date()).toISOString();
        setLastUpdate(user.lastUpdate);

        setUsers(users);
        setTimeout(retryFunc, 50);
      }
    }

    retryFunc();

    // var vidElement = document.createElement('video');
    // vidElement.setAttribute('autoplay', '');
    // vidElement.setAttribute('muted', '');
    // vidElement.setAttribute('width', videoResWidth + "px");
    // vidElement.setAttribute('height', videoResHeight + "px");
    // vidElement.setAttribute('tag', peerUuid);
    // vidElement.srcObject = event.streams[0];

    // vidElements.push(vidElement);
    // vidGuuids.push(peerUuid);
    // vidMetadata.push({
    //   timestamp: timestamp,
    //   uuid: peerUuid,
    //   elem: vidElement
    // });

    // console.log(vidMetadata[0].timestamp);
    // console.log(vidMetadata[1].timestamp);

    // vidMetadata.sort(function(x, y) {
    //   return x.timestamp - y.timestamp;
    // });

    // var vidContainer = document.createElement('div');
    // vidContainer.setAttribute('id', 'remoteVideo_' + peerUuid);
    // vidContainer.setAttribute('class', 'videoContainer');
    // vidContainer.appendChild(vidElement);
    // //vidContainer.appendChild(makeLabel(peerConnections[peerUuid].displayName));

    // document.getElementById('videos').appendChild(vidContainer);
  }

  function checkPeerDisconnect(event, peerUuid) {
    var state = peerConnections[peerUuid].pc.iceConnectionState;
    console.log(`connection with peer ${peerUuid} ${state}`);
    if (state === "failed" || state === "closed" || state === "disconnected") {
      delete peerConnections[peerUuid];
      let user = users.find(user => user['id'] === peerUuid);
      if (user) users.splice(users.indexOf(user), 1);
      setUsers(users);
      setLastUpdate((new Date()).toISOString());

      // document.getElementById('videos').removeChild(document.getElementById('remoteVideo_' + peerUuid));
      // vidGuuids.splice(vidGuuids.indexOf(peerUuid), 1);
      // for(var p=0; p<vidMetadata.length; p++) {
      //   if (vidMetadata[p].uuid == peerUuid) {
      //     vidMetadata.splice(p, 1);

      //     if (p < contexts.length)
      //       contexts[p].clearRect(0, 0, videoResWidth, videoResHeight);

      //     break;
      //   }
      // }
    }
  }

  function loadBodyPix() {
    var options = {
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    }
    bodyPix.load(options)
      .then(net => {
        bodyPixNet = net;
        //perform();
      })
      .catch(err => console.log(err))
  }

  async function perform() {

    console.log("ENTER PERFORM")
    while (!bodyPixNet) {
      await new Promise(r => setTimeout(r, 100));
    }

    if (paintRunning) {
      console.log("paint already running, exiting...")
    }
    else {
      paintRunning = true;
      console.log("START PAINT LOOP")
      while (paint) {

        // if (vidMetadata.length > 0) {
        //   for(var c=contexts.length - 1; c > vidMetadata.length - 1; c--)
        //     contexts[c].clearRect(0, 0, videoResWidth, videoResHeight);
        // }
        for (var i = 0; i < users.length; i++) {
          var user = users[i];
          var vidElement = users[i].video.current;
          try {
            var segmentation = await bodyPixNet.segmentPerson(vidElement, {
              flipHorizontal: false,
              internalResolution: 'medium',
              segmentationThreshold: 0.5
            });

            var canvas = document.createElement('canvas');
            canvas.width = videoResWidth;
            canvas.height = videoResHeight;
            var context = canvas.getContext('2d');
            context.drawImage(vidElement, 0, 0);
            var imageData = context.getImageData(0, 0, videoResWidth, videoResHeight);

            var pixel = imageData.data;
            for (var p = 0; p < pixel.length; p += 4) {
              if (segmentation.data[p / 4] == 0) {
                pixel[p + 3] = 0;
              }
              else
                pixel[p + 3] = 255;
            }
            context.imageSmoothingEnabled = true;
            context.putImageData(imageData, 0, 0);

            var imageObject = new Image();
            var l = i;
            imageObject.onload = function () {
              if (l < users.length) {
                var canvasObj = document.getElementById("canvas_" + users[l].id);

                if (canvasObj) {
                  var contextObj = canvasObj.getContext("2d");
                  contextObj.clearRect(0, 0, canvas.width, canvas.height);
                  contextObj.imageSmoothingEnabled = true;
                  contextObj.drawImage(imageObject, 0, 0, canvas.width, canvas.height);
                }
                else {
                  console.log("Error no canvas object found for user " + l);
                }
              }
              else
                console.log("Error no user found for index " + l);
            }

            imageObject.src = canvas.toDataURL();
          } catch (error) {
            //console.error(error);
          }
        }

        await new Promise(r => setTimeout(r, 100));
      }

      paintRunning = false;
      console.log("END PAINT LOOP")
    }

    console.log("EXIT PERFORM")
  }
}

function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export default Room;