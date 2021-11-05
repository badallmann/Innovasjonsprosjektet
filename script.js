// ICONS
  newLink = (rel, sizes, type, fileName) => {
    link = document.createElement("link")
    link.rel = rel
    if (sizes) { link.sizes = sizes }
    if (type) { link.type = type }
    link.href = window.jsSrc.replace("script.js", "") + "assets/" + fileName
    document.head.appendChild(link)
  }

  // as done in skoidda
  // <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
  newLink("apple-touch-icon", "180x180", false, "apple-touch-icon.png")

  // <link rel="icon" sizes="32x32" type="image/png" href="assets/favicon-32x32.png">
  newLink("icon", "32x32", "image/png", "favicon-32x32.png")

  /* resten
    newLink(false, "apple-touch-icon-iphone-60x60.png")
    newLink("60x60", "apple-touch-icon-ipad-76x76.png")
    newLink("114x114", "somedir/apple-touch-icon-iphone-retina-120x120.png")
    newLink("144x144", "somedir/apple-touch-icon-ipad-retina-152x152.png")
    HTML for resten
    <link rel="apple-touch-icon" href="somedir/apple-touch-icon-iphone-60x60.png">
    <link rel="apple-touch-icon" sizes="60x60" href="somedir/apple-touch-icon-ipad-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="somedir/apple-touch-icon-iphone-retina-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="somedir/apple-touch-icon-ipad-retina-152x152.png">
  */




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




// HTML MODEL
  const doc = document
  const body = doc.body
  bap = (elm) => {
    body.appendChild(elm)
  }
  newElm = tag => {
    elm = doc.createElement(tag)
    return elm
  }
  newDiv = () => {
    return newElm("div")
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
    }

    html {
      box-sizing: border-box; -webkit-box-sizing: border-box;
      text-size-adjust: none; -webkit-text-size-adjust: none;
    }

    body {
      width: 100vw; /* inherit */
      overflow-x: hidden;
      position: fixed;
      height: 100vh;

      white-space: pre-wrap; /* preserve all whitespace, render newline chars, wrap on end of line */
      text-align: left; /* margin or padding instead? */
      line-height: 24px;
      font-size: 24px;
      font-family: serif;
      font-weight: normal;

      background-color: #6c8c6e;
    }

    #item1 { grid-area: header; }
    #item2 { grid-area: npn; }
    #item3 { grid-area: lm; }
    #item4 { grid-area: ktk; }
    #item5 { grid-area: slider; }
    #item6 { grid-area: footer; }

    #grid-container {
      position: fixed;
      display: grid;
      grid-template-areas:
        'header header'
        'npn slider'
        'lm slider'
        'ktk slider'
        'footer footer';
      grid-gap: 1px;

      width: inherit;
      height: inherit;
    }

    #grid-container > div {
      background-color: #5e8561;
    }










    .button {
      display: inline-block;
      text-decoration: underline;
      /* transition: background-color 0.1s; */
    } .button:hover {
      cursor: grab;
    } .button:active {
      cursor: grabbing;
      /* background-color: black;
      color: white; */
    }

    .input {
      font-size: inherit;
      font-family: inherit;
      font-weight: inherit;
    }

    input:focus, select:focus, textarea:focus, button:focus {
      outline: none;  /* disable focus highlighting */
    }

    .selectable, input {
      user-select: initial; -webkit-user-select: text;
    }





    .slider-wrapper {
      display: inline-block;
      width: 20px;
      height: 150px;
      padding: 0;
    }
    .slider-wrapper input {
      width: 150px;
      height: 20px;
      margin: 0;
      transform-origin: 75px 75px;
      transform: rotate(-90deg);
    }


    #slider {
      width: 300px;
      height: 50px;
    }






    `
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




// ESP32 INTERFACE
  // protocol: websocket.send(msg)
  // msg = string: pin# + function# + value (all integers)
  // pin#      = 001, 002 etc.
  // function# = 001, 002 etc.
  // value     = 000 < value < 255
  // example: websocket.send("002001255")

  // model
  formatInt = int => {
    let fInt = int.toString()
    while (fInt.length != 3) {
      fInt = "0" + fInt
    }
    return fInt
  }

  // interface
  newMsg = (pin, fn, value) => {
    // input validation?
    let msg = ""
    msg += formatInt(pin)
    msg += formatInt(fn)
    msg += formatInt(value)
    websocket.send(msg)
  }

  // arduino function replicas
  pinMode = (pin, value) => {
    let fn = 1
    newMsg(pin, fn, value)
  }
  digitalWrite = (pin, value) => {
    let fn = 2
    newMsg(pin, fn, value)
  }

  // sett hastighet for paletteIndex++
  setSpeed = () => {
    d = doc.getElementById("slider").value
    d = parseInt(d)
    newMsg(0, 11, d)
  }





// SETUP
  // set pins. this runs on new connection
  defaultPinModes = () => {
    pinMode(2, 0) // built-in blue LED as output

    // test
    // setInterval(websocket.send("000102000"), 1000)
  }




// LAYOUT

  // grid container
  g = newDiv()
  g.id = "grid-container"
  bap(g)

  // items
  for (i = 1; i < 7; i++) {
    let elm = newDiv()
    elm.id = "item" + i
    elm.textContent = i
    g.appendChild(elm)
  }









  /*
  // add slider
  slider = doc.createElement("input")
  slider.type = "range"
  slider.min = "1"
  slider.max = "30"
  slider.value = "30"
  slider.id = "slider"

  sliderWrapper = newDiv()
  sliderWrapper.className = "slider-wrapper"

  sliderWrapper.appendChild(slider)
  bap(sliderWrapper)

  setInterval(setSpeed, 200)
  */


