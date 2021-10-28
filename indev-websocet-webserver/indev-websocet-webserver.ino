/***************************************************************
  Credit:
  Rui Santos
  Complete project details at:
  https://RandomNerdTutorials.com/esp32-websocket-server-arduino/
  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
****************************************************************/




// BIBLIOTEKER ––––––––––––––––––––––––––––––––-
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <stdio.h> // sscanf
#include <string.h> // strncpy (eller bruk memcpy++)
#include <FastLED.h>





// FAST LED
#define NUM_LEDS  45
#define LED_PIN   12
CRGB leds[NUM_LEDS];
uint8_t paletteIndex = 0;
CRGBPalette16 currentPalette; // settes dynamisk
int fps;                      // settes dynamisk

// Definér paletter her og legg dem til i 'NETTVERK/doSomething/bytt palette'.
CRGBPalette16 palette1 = CRGBPalette16 (
    CRGB::DarkViolet,
    CRGB::DarkViolet,
    CRGB::DarkViolet,
    CRGB::DarkViolet,

    CRGB::Magenta,
    CRGB::Magenta,
    CRGB::Linen,
    CRGB::Linen,

    CRGB::Magenta,
    CRGB::Magenta,
    CRGB::DarkViolet,
    CRGB::DarkViolet,

    CRGB::DarkViolet,
    CRGB::DarkViolet,
    CRGB::Linen,
    CRGB::Linen
);

CRGBPalette16 palette2 = CRGBPalette16 (
    CRGB::Orange,
    CRGB::Yellow,
    CRGB::Black,
    CRGB::Black,

    CRGB::Orange,
    CRGB::Yellow,
    CRGB::Black,
    CRGB::Black,

    CRGB::Orange,
    CRGB::Yellow,
    CRGB::Black,
    CRGB::Black,

    CRGB::Orange,
    CRGB::Yellow,
    CRGB::Black,
    CRGB::Orange
);

CRGBPalette16 palette3;
CRGBPalette16 palette4;
CRGBPalette16 palette5;







// NETTVERK –––––––––––––––––––––––––––––––––––––––

// WiFi
const char* ssid     = "iphone";
const char* password = "the2020project";

// Baslaks mobil
// const char* ssid     = "iphone";
// const char* password = "the2020project";

// hjemme hos Baslak
// const char* ssid     = "Get-2G-350B21";
// const char* password = "7ECJBBAAHF";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
const char index_html[] PROGMEM = R"rawliteral(
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="
			width=device-width,
			initial-scale=1.0,
			maximum-scale=1.0,
			user-scalable=no" /> <!-- viewport-fit=cover -->
		<meta name="format-detection" content="telephone=no">
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
		<meta name="apple-mobile-web-app-title" content="＊ ＊ ＊">

    <title>ESP32 fjernkontroll</title>


    <!-- custom external .js file -->
    <script defer src="http://172.20.10.2:8000/script.js"></script>

  </head>
  <body ontouchstart=""></body>
  </html>
)rawliteral";
void doSomething(int pin, int fn, int val) {
  // FUNKSJONER (# 1–999)

  // pinMode()
  if (fn == 1) {
    if (val == 0) {
      pinMode(pin, OUTPUT);
    }
    else if (val == 1) {
      pinMode(pin, INPUT);
    }
    else if (val == 2) {
      pinMode(pin, INPUT-PULLUP);
    }
    Serial.println("pinmode was set");
  }

  // digitalWrite()
  if (fn == 2) {
    if (val == 0) {
      digitalWrite(pin, LOW);
    }
    else if (val == 1) {
      digitalWrite(pin, HIGH);
    }
    Serial.println("digitalWrite did run");
  }

  // bytt palette (FastLED).
  if (fn == 101) { currentPalette = palette1; }
  if (fn == 102) { currentPalette = palette2; }
  if (fn == 103) { currentPalette = palette3; }
  // ...

  // endre hastighet
  if (fn == 11) {
    fps = val;
  }


}
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;

    // example message: "003001255"
    // 003 = pin
    // 001 = function reference
    // 255 = analog value

    // get receiverd message as char array
    char msg[9];
    memcpy(msg, (char*)data, len);

    size_t num3 = 3;

    // get pin
    int pin;
    char msgPin[3];
    strncpy(msgPin, msg + 0, num3);
    sscanf(msgPin, "%d", &pin);

    // get fn ref
    int fn;
    char msgFn[3];
    strncpy(msgFn, msg + 3, num3);
    sscanf(msgFn, "%d", &fn);

    // get value
    int val;
    char msgVal[3];
    strncpy(msgVal, msg + 6, num3);
    sscanf(msgVal, "%d", &val);

    // test received data
    Serial.println("New message:");
    Serial.println(pin);
    Serial.println(fn);
    Serial.println(val);
    Serial.println("");

    // next step
    doSomething(pin, fn, val);
  }
}
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      break;
    case WS_EVT_DISCONNECT:
      Serial.printf("WebSocket client #%u disconnected\n", client->id());
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}
void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}
void nettverkSetup() {
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  // Print ESP Local IP Address
  Serial.println(WiFi.localIP());

  initWebSocket();

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  // Start server
  server.begin();
}
void nettverkLoop() {
  // run every sec or so
  ws.cleanupClients();
}
// send a string to all connected clients
// ws.textAll(String(variable));








// SETUP ––––––––––––––––––––––––––––––––––––––––
void setup() {
  Serial.begin(115200);
  nettverkSetup();


  // FastLED
  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(50);
}

// LOOP ––––––––––––––––––––––––––––––––––––––––
void loop() {
  nettverkLoop();

  // FastLED
  fill_palette(leds, NUM_LEDS, paletteIndex, 255 / NUM_LEDS, currentPalette, 255, LINEARBLEND);

  EVERY_N_MILLISECONDS(fps) {
    paletteIndex++;
  }

  FastLED.show();
}
