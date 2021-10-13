/*********
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-websocket-server-arduino/
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*********/

#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <stdio.h> // sscanf
// #include <string.h> delete asap

// hjemme hos Baslak
const char* ssid     = "Get-2G-350B21";
const char* password = "7ECJBBAAHF";

// Baslaks mobil
// const char* ssid     = "iphone";
// const char* password = "the2020project";




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

void notifyClients() {
  // sends the same string to all clients
  // ws.textAll(String(ledState));
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;

    // CUSTOM C-KODE HERFRA (:

    // get receiverd message as char array
    char msg[4];
    memcpy(msg, (char*)data, len);

    // fn to perform
    char fn = msg[0];

    // pin number
    int pin;
    char msgTrimmed[2];
    size_t nums = 2;
    strncpy(msgTrimmed, msg + 1, nums);
    sscanf(msgTrimmed, "%d", &pin);

    // pinmode value to set (if any)
    char mode;
    if (strlen(msg) > 3) {
      mode = msg[3];
    }

    // test receiving data
    Serial.println(fn);
    Serial.println(pin);
    Serial.println(mode);



    /*
    bool ledState = 0;
    const int ledPin = 2;
    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, LOW);
    analogWrite()
    analogRead()
    */




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





void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);



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





void loop() {
  ws.cleanupClients(); // run one per sec or so
  // digitalWrite(ledPin, ledState);
}
