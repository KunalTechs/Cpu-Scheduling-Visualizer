#include <drogon/drogon.h>
#include <iostream>

int main() {
    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

    // Heartbeat only
    drogon::app().registerHandler("/", [](const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setBody("--- Master Kernel API Online (via Controller) ---");
        callback(resp);
    }, {drogon::Get});

    // Global CORS Advice - Essential for React app
    drogon::app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &, const drogon::HttpResponsePtr &resp) {
        resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp->addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        resp->addHeader("Access-Control-Allow-Headers", "Content-Type");
        resp->addHeader("Access-Control-Allow-Credentials", "true");
    });

    std::cout << "--- Master Kernel Online on Port " << port << " ---" << std::endl;
    drogon::app().addListener("0.0.0.0", port).setThreadNum(16).run();
    return 0;
}