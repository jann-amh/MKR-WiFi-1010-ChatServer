#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Hash.h>
#include <ESP8266mDNS.h>

const char* ssid = "ssid";
const char* password = "password";

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

#define USE_SERIAL Serial

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            USE_SERIAL.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                USE_SERIAL.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
            }
            break;
        case WStype_TEXT:

            USE_SERIAL.printf("[%u] get Text: %s\n", num, payload);

            // send data to all connected clients
            webSocket.broadcastTXT(payload);
            break;
        
    }

}

void setup() {
    // USE_SERIAL.begin(921600);
    USE_SERIAL.begin(115200);

    if(!SPIFFS.begin()){
        USE_SERIAL.println("An Error has occurred while mounting SPIFFS");
        return;
    }

    WiFi.softAP("chat", "password01");
    
    USE_SERIAL.println(WiFi.softAPIP());

    /*WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    USE_SERIAL.println(WiFi.localIP());*/


    // Route for root / web page
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(SPIFFS, "/index.html", "text/html");
    });

    if(!MDNS.begin("chat")) {
        USE_SERIAL.println("mDNS failed!");
    } else {
        USE_SERIAL.println("mDNS responder started!");
    }
    MDNS.addService("http", "tcp", 80);

     // Start server
    server.begin();

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    
}

void loop() {
    MDNS.update();
    webSocket.loop();
}
