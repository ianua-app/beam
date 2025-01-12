import React, { useState, useEffect, useLayoutEffect } from 'react';

const styles = {
  canvas: {
    border: '1px solid #333',
    width: '100%' },


  maindiv: {
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px' },


  button: {
    border: '0px',
    margin: '1px',
    height: '50px',
    minWidth: '75px' },


  colorSwatches: {
    red: { 'backgroundColor': 'red' },
    orange: { 'backgroundColor': 'orange' },
    yellow: { 'backgroundColor': 'yellow' },
    green: { 'backgroundColor': 'green' },
    blue: { 'backgroundColor': 'blue' },
    purple: { 'backgroundColor': 'purple' },
    black: { 'backgroundColor': 'black' } } };



//simple draw component made in react
class DrawCanvas extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.reset();
  }

  draw(e) {//response to Draw button click 
    this.setState({
      mode: 'draw' });

  }

  erase() {//response to Erase button click
    this.setState({
      mode: 'erase' });

  }

  drawing(e) {//if the pen is down in the canvas, draw/erase

    if (this.state.pen === 'down') {

      this.ctx.beginPath();
      this.ctx.lineWidth = this.state.lineWidth;
      this.ctx.lineCap = 'round';


      if (this.state.mode === 'draw') {
        this.ctx.strokeStyle = this.state.penColor;
      }

      if (this.state.mode === 'erase') {
        this.ctx.strokeStyle = '#ffffff';
      }

      this.ctx.moveTo(this.state.penCoords[0], this.state.penCoords[1]); //move to old position
      this.ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); //draw to new position
      this.ctx.stroke();

      this.setState({ //save new position 
        penCoords: [e.nativeEvent.offsetX, e.nativeEvent.offsetY] });

    }
  }

  penDown(e) {//mouse is down on the canvas
    this.setState({
      pen: 'down',
      penCoords: [e.nativeEvent.offsetX, e.nativeEvent.offsetY] });

  }

  penUp() {//mouse is up on the canvas
    this.setState({
      pen: 'up' });

  }

  penSizeUp() {//increase pen size button clicked
    this.setState({
      lineWidth: this.state.lineWidth += 5 });

  }

  penSizeDown() {//decrease pen size button clicked
    this.setState({
      lineWidth: this.state.lineWidth -= 5 });

  }

  setColor(c) {//a color button was clicked
    this.setState({
      penColor: c });

  }

  reset() {//clears it to all white, resets state to original
    this.setState({
      mode: 'draw',
      pen: 'up',
      lineWidth: 10,
      penColor: 'black' });


    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, 800, 600);
    this.ctx.lineWidth = 10;
  }

  render() {
    return /*#__PURE__*/(
      React.createElement("div", { style: styles.maindiv }, /*#__PURE__*/
      React.createElement("canvas", { ref: "canvas", style: styles.canvas,
        onMouseMove: e => this.drawing(e),
        onMouseDown: e => this.penDown(e),
        onMouseUp: e => this.penUp(e) }), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("button", { onClick: e => this.draw(e), style: (styles.btn, styles.button) }, "Draw"), /*#__PURE__*/
      React.createElement("button", { onClick: e => this.erase(e), style: (styles.btn, styles.button) }, "Erase"), /*#__PURE__*/
      React.createElement("button", { onClick: e => this.penSizeUp(), style: (styles.btn, styles.button) }, "Pen Size +"), /*#__PURE__*/
      React.createElement("button", { onClick: e => this.penSizeDown(), style: (styles.btn, styles.button) }, "Pen Size -"), /*#__PURE__*/
      React.createElement("button", { onClick: () => this.reset(), style: (styles.btn, styles.button) }, "Reset")), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.red, styles.button), onClick: () => this.setColor('red') }, "Red"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.orange, styles.button), onClick: () => this.setColor('orange') }, "Orange"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.yellow, styles.button), onClick: () => this.setColor('yellow') }, "Yellow"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.green, styles.button), onClick: () => this.setColor('green') }, "Green"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.blue, styles.button), onClick: () => this.setColor('blue') }, "Blue"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.purple, styles.button), onClick: () => this.setColor('purple') }, "Purple"), /*#__PURE__*/
      React.createElement("button", { style: Object.assign({}, styles.colorSwatches.black, styles.button), onClick: () => this.setColor('black') }, "Black"))));
  }}

  export default DrawCanvas;