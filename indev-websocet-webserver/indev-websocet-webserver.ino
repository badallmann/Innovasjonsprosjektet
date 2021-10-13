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
#include <stdio.h> // ? memcopy, strncpy, sscanf




// WIFI ––––––––––––––––––––––––––––––––––––––––
// hjemme hos Baslak
const char* ssid     = "Get-2G-350B21";
const char* password = "7ECJBBAAHF";

// Baslaks mobil
// const char* ssid     = "iphone";
// const char* password = "the2020project";




// PINS ––––––––––––
const int pin1 = 1;
const int pin2 = 2;




// NETTVERK –––––––––––––––––––––––––––––––––––––––
// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
const char index_html[] PROGMEM = R"rawliteral(
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <title>ESP Web Server</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- custom external .js file -->
    <script defer src="http://192.168.0.131:8000/script.js"></script>

  </head>
  <body ontouchstart=""></body>
  </html>
)rawliteral";
void doSomething(int pin, char fn, int val) {

  // pinMode()
  if ((char*)fn == "p") {
    Serial.println("p was detected");
  }

  // digitalWrite()
  if ((char*)fn == "w") {}

  // analogWrite()
  if ((char*)fn == "v") {}

  // analogRead()
  if ((char*)fn == "r") {}



}
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;

    // example message: "01a001"
    // 01  = pin
    // a   = function reference
    // 001 = analog value

    // get receiverd message as char array
    char msg[6];
    memcpy(msg, (char*)data, len);

    // get pin
    int pin;
    char msgPin[2];
    size_t num2 = 2;
    strncpy(msgPin, msg + 0, num2);
    sscanf(msgPin, "%d", &pin);

    // get fn
    char fn = msg[3];

    // get value
    int val;
    char msgVal[3];
    size_t num3 = 3;
    strncpy(msgVal, msg + 3, num3);
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
}

// LOOP ––––––––––––––––––––––––––––––––––––––––
void loop() {
  nettverkLoop();
}
