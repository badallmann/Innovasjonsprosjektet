/**************************
Innovasjonsprosjektet – Gruppe 7
Kildekode for nettsiden (JavaScript)
Kjøres sammen med index.html servert fra ESPAsyncWebServer på ESP32 samt ikon- og bildefiler.
***************************/


// KOMMUNIKASJON MED ESP32
  // Dette setter opp forbindelse mellom nettsiden og ESP32
  // via en protokoll kalt WebSocket, samt forenkler
  // dette til vårt behov, som er å sende en tekststreng.

  // WebSocket setup
  // Credit: https://randomnerdtutorials.com/esp32-websocket-server-arduino/

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
  // TUDU
  function onOpen(event) {
    console.log('Connection opened');
    defaultPinModes()
    // resetPalette()
  }
  function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
  }
  function onMessage(event) {
    // handle message from websocket connection
    console.log("new websocket message received")
  }




// KONFIGURERING AV ESP32
  // Eventuell automatisk forhåndskonfigurering av ESP.

  // TUDO: set pins. this runs on new connection
  defaultPinModes = () => {
    // set built-in blue LED as output
    pinMode(2, 0)

    // flash blue LED
    websocket.send("002002001")
    setTimeout(()=>{websocket.send("002002000")}, 500) // off
  }




// BESKJEDER TIL ESP32
  // protocol: websocket.send(msg)
  // msg = string: pin# + function# + value (all integers)
  // pin#      = 001, 002 etc.
  // function# = 001, 002 etc.
  // value     = 000 < value < 255
  // example: websocket.send("002001255")

  formatInt = int => {
    let fInt = int.toString()
    while (fInt.length != 3) {
      fInt = "0" + fInt
    }
    return fInt
  }

  // interface equal to receiving end in ESP code
  newMsg = (pin, fn, value) => {
    let msg = ""
    msg += formatInt(pin)
    msg += formatInt(fn)
    msg += formatInt(value)
    websocket.send(msg)
    console.log(msg)
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
  setSpeed = value => {
    let d = 41 - parseInt(value)
    newMsg(0, 11, d)
  }

  // reset light program (to run on reconnection)
  resetPalette = () => {
    websocket.send('000100000')
    setTimeout(()=>{websocket.send('000011015')}, 500)
  }

  // lyd
  audioChange = id => {
    // stop
    npn_audio.pause()
    lm_audio.pause()
    ktk_audio.pause()

    // reset
    npn_audio.src = npn_audio.src
    lm_audio.src = lm_audio.src
    ktk_audio.src = ktk_audio.src

    // play if specified
    if (id != null) { id.play() }
  }




// IKONER
  // Legger til filer som brukes for diverse ikoner

  newLink = (rel, sizes, type, fileName) => {
    link = document.createElement("link")
    link.rel = rel
    if (sizes) { link.sizes = sizes }
    if (type) { link.type = type }
    link.href = window.jsSrc.replace("script.js", "") + "assets/icons/" + fileName
    document.head.appendChild(link)
  }

  // eqv. HTML: <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
  newLink("apple-touch-icon", "180x180", false, "apple-touch-icon.png")

  // eqv. HTML: <link rel="icon" sizes="32x32" type="image/png" href="assets/favicon-32x32.png">
  newLink("icon", "32x32", "image/png", "favicon-32x32.png")




// HTML
  // Dette bygger opp nettsiden fra skratsj utelukkende ved bruk av JavaScript.

  // HTML model
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
  // set body height
  // optional: on resize: window.addEventListener("resize", () => {setTimeout(setBodyHeight, 100)} )
  setBodyHeight = () => { body.style.height = String(window.innerHeight) + "px" }


  // init
    setBodyHeight()

  // grid
    grid = newDiv()
    grid.id = "grid-container"
    bap(grid)

  // grid items
    ITEMS = {}
    for (i = 1; i <= 3; i++) {
      let elm = newDiv()
      elm.className = "item"
      elm.id = "item" + i
      grid.append(elm)
      ITEMS[i] = elm

    }

  // header
    ITEMS[1].textContent = "Foajéen NRK 🥳"

  // controls:
    // A) imgs
      // model
        imgPath = (fileName) => {
          return window.jsSrc.replace('script.js', '') + 'assets/images/' + fileName
        }
        newImgFrame = (src, alt, id) => {
          img = newElm('img')
          img.src = imgPath(src)
          img.alt = alt
          img.id = id
          img.class = "lysbryter"
          frame = newDiv()
          frame.className = 'imgFrame'
          frame.append(img)
          return frame
        }

      controlA = newDiv()
      controlA.append(newImgFrame('npn.jpeg', 'Nytt på nytt', 'npn'))
      controlA.append(newImgFrame('lm.jpeg', 'Lindmo', 'lm'))
      controlA.append(newImgFrame('ktk.jpeg', 'Kåss til kvelds', 'ktk'))
      ITEMS[2].append(controlA)

    // B) slider
      slider = newElm("input")
      slider.type = "range"
      slider.min = "1"
      slider.max = "40"
      slider.value = "1"
      slider.id = "slider"

      sliderText = newText("blinkehastighet")
      sliderText.style.display = "block"

      controlB = newDiv()
      controlB.append(sliderText)
      controlB.append(slider)
      ITEMS[2].append(controlB)

  // footer
    ITEMS[3].textContent = "Gruppe 7 © 2021"

  // audio
  newAudioElm = (id, filename) => {
    let elm = doc.createElement('audio')
    elm.id = id
    elm.src = window.jsSrc.replace("script.js", "") + "assets/audio/" + filename
    elm.controls = true
    return elm
  }
  let npn_audio = newAudioElm('npn_audio', 'npn.mp3')
  let lm_audio = newAudioElm('lm_audio', 'lm.mp3')
  let ktk_audio = newAudioElm('ktk_audio', 'ktk.mp3')
  let audioContainer = newDiv()
  audioContainer.append(npn_audio)
  audioContainer.append(lm_audio)
  audioContainer.append(ktk_audio)
  body.append(audioContainer)







// CSS
  // Stilark for generert HTML.

  // static
  var styles = `




    /* META */

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
    overflow-x: hidden;
    position: fixed;
    transition: background-color 0.333s;
    color: white;
    background-color: black;
    font-family: sans-serif;



    /* GRID */

    } #item1 {
    grid-area: header;
    text-align: center;
    font-size: 28px;

    } #item2 {
    grid-area: controls;

    display: flex;
    justify-content: center;
    align-items: flex-start;
    column-gap: 20px;

    } #item3 {
    grid-area: footer;
    text-align: center;

    } #grid-container {
    position: fixed;
    width:  inherit;
    height: inherit;
    display: grid;
    grid-template-areas:
      'header'
      'controls'
      'footer';
    grid-auto-rows: 15% 80% 5%;
    padding: 20px;



    /* IMG */

    } .imgFrame {
    width: 150px;
    height: 100px;
    text-align: right;

    } img {
    object-fit: contain; max-height: 100%; max-width: 100%; margin-left: auto; margin-right: auto;




    /* SLIDER */

    } #slider {
    -webkit-appearance: slider-vertical;
    width: 100px;
    height: 250px;
    margin-top: 10px;

    } #slider::-webkit-slider-thumb {
    width: 75px; height: 75px;




    /* AUDIO */
    } audio {
    display: none;




    }`

  // attach static to page
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
  // Håndtering av hendelser på siden. Knappetrykk registreres
  // ved 'event delegation' på window-objektet, før ønsket
  // respons blir kjørt.

  // events: click and touchstart. touchstart if mobile for less latency
    let isTouchDevice = false;

    window.document.addEventListener("touchstart", e => {
      isTouchDevice = true
      handleClickAndTouchstartEvent(e)
    })

    window.document.addEventListener("click", e => {
      if (!isTouchDevice) { handleClickAndTouchstartEvent(e) }
    })

    let LIGHT = false

    handleClickAndTouchstartEvent = e => {
      const elm = e.target
      const tc = elm.textContent
      const id = elm.id
      console.log(elm)

      // velg lys-program
      if (elm.class == "lysbryter") {
        if (!LIGHT || !(LIGHT == elm.id)) {
          if (id == "npn") {  // Program for Nytt på nytt
            newMsg("000", "102", "000") // == websocket.send("000102000")
            body.style.backgroundColor = "rgb(220, 120, 30)"
            audioChange(npn_audio)

          } else if (elm.id == "lm") {
            websocket.send("000101000")
            body.style.backgroundColor = "rgb(11, 80, 152)"
            audioChange(lm_audio)

          } else if (elm.id == "ktk") {
            websocket.send("000103000")
            body.style.backgroundColor = "rgb(220, 20, 126)"
            audioChange(ktk_audio)
          }
          LIGHT = elm.id

        } else {
          LIGHT = false
          websocket.send("000100000")
          body.style.backgroundColor = "black"
          audioChange(null)
        }
      }

      // run fns with stored parameters
      // fnArr[tc]()
    }

  // event: slider input
    window.addEventListener("input", e => { setSpeed(e.target.value) })

    /* optional: debounce the input event
    let SLIDER_VALUE
    let SLIDER_TIMEOUT
    window.addEventListener("input", e => {
      SLIDER_VALUE = e.target.value
      clearTimeout(SLIDER_TIMEOUT)
      SLIDER_TIMEOUT = setTimeout( () => {
        console.log(SLIDER_VALUE)
        setSpeed(SLIDER_VALUE)
      }, 200)
    })
    */




//
