// EKSTERNT SKRIPT
// NETWORKING
  var gateway = `ws://${window.location.hostname}/ws`;
  var websocket;
  window.addEventListener('load', onLoad);
  function onLoad(event) {
    initWebSocket();
  }
  function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket = new WebSocket(gateway);
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage; // <-- add this line
  }
  function onOpen(event) {
    console.log('Connection opened');
    defaultPinModes()
  }
  function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
  }
  function onMessage(event) {
    // handle message from websocket connection
    console.log("new websocket message received")
  }




// HTML
  const doc = document
  const body = doc.body
  bap = (elm) => {
    body.appendChild(elm)
    // linjeskift
    body.appendChild(document.createElement("br"))
  }
  newDiv = () => {
    return doc.createElement("div")
  }
  newText = (text) => {
    d = newDiv()
    d.textContent = text
    return d
  }
  newButton = (text, id) => {
    b = newDiv()
    b.className = "button"
    b.textContent = text
    b.id = id
    return b
  }
  // quickly add button with function and parameters to run
  fnArr = []
  fb = (text, fn, a=0, b=0, c=0) => {
    bap(newButton(text, text))
    fnArr[text] = () => {
      fn(a, b, c)
    }
  }




// CSS
  // static
  var styles = `
  *, *::before, *::after {
  user-select: none; -webkit-user-select: none;
  box-sizing: inherit; -webkit-box-sizing: inherit;
  margin: 0; padding: 0;
  cursor: default;
  -webkit-touch-callout: none;                    /* disable callouts (info on tocuh && hold) iOS */
  -webkit-tap-highlight-color: rgba(0,0,0,0);     /* Remove Gray Highlight When Tapping Links in Mobile Safari */

  } html {
  box-sizing: border-box; -webkit-box-sizing: border-box;
  text-size-adjust: none; -webkit-text-size-adjust: none;

  } body {
  width: 100vw; /* inherit */
  padding: 16px;
  overflow-x: hidden;

  white-space: pre-wrap; /* preserve all whitespace, render newline chars, wrap on end of line */
  text-align: left; /* margin or padding instead? */
  line-height: 64px;
  font-size: 24px;
  font-family: serif;
  font-weight: normal;

  } .button {
  display: inline-block;
  text-decoration: underline;
  /* transition: background-color 0.1s; */
  } .button:hover {
  cursor: grab;
  } .button:active {
  cursor: grabbing;
  /* background-color: black;
  color: white; */

  } input:focus, select:focus, textarea:focus, button:focus {
  outline: none;  /* disable focus highlighting */

  } .selectable, input {
  user-select: initial; -webkit-user-select: text;

  }`
  var styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)

  // dynamic
  highlightElm = (id) => {
    elm = document.getElementById(id)
    let defaultBackgroundColor = elm.style.backgroundColor
    let defaultColor = elm.style.color
    let defaultTextDecoration = elm.style.textDecoration
    elm.style.backgroundColor = "black"
    elm.style.color = "white"
    elm.style.textDecoration = "initial"
    setTimeout(() => {
      elm.style.backgroundColor = defaultBackgroundColor
      elm.style.color = defaultColor
      elm.style.textDecoration = defaultTextDecoration
    }, 100)
  }




// EVENTS
  // raskere å bruke "touchstart" på mobil
  let isTouchDevice = false;
  window.document.addEventListener("touchstart", e => {
    isTouchDevice = true
    handleClickAndTouchEvent(e)
  })
  window.document.addEventListener("click", e => {
    if (!isTouchDevice) { handleClickAndTouchEvent(e) }
  })
  handleClickAndTouchEvent = e => {
    const elm = e.target
    const tc = elm.textContent
    const id = elm.id

    // dynamisk css
    if (elm.classList.contains("button")) {
      highlightElm(id)
    }

    // run one of the stored fns
    fnArr[tc]()
  }




// ESP INTERFACE
  // protocol: websocket.send(msg)
  // msg = string: pin# + function# + value (all integers)
  // pin#      = 001, 002 etc.
  // function# = 001, 002 etc.
  // value     = 000 < value < 255
  // example: websocket.send("002001255")

  // model
  newMsg = (pin, fn, value) => {
    // input validation?
    let msg = ""
    msg += formatInt(pin)
    msg += fn
    msg += formatInt(value)
    websocket.send(msg)
  }
  formatInt = int => {
    let fInt = int.toString()
    while (fInt.length != 3) {
      fInt = "0" + fInt
    }
    return fInt
  }

  // arduino function replicas
  pinMode = (pin, value) => {
    let fn = "001"
    newMsg(pin, fn, value)
  }
  digitalWrite = (pin, value) => {
    let fn = "002"
    newMsg(pin, fn, value)
  }

  /*
  analogWrite = (pin, value) => {
  }
  analogRead = (pin) => {
  }
  */




// SETUP
  // pins
  defaultPinModes = () => {
    // built-in blue LED
    pinMode(2, 0)
  }

  // build page
  bap(newText("ESP32 remote"))
  fb("built-in LED on", digitalWrite, 2, 1)
  fb("built-in LED off", digitalWrite, 2, 0)
