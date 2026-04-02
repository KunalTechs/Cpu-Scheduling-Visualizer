#include <drogon/drogon.h>
#include <iostream>

int main() {
    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

    // Heartbeat Handler
    drogon::app().registerHandler("/", [](const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setBody("--- Master Kernel API Online ---");
        callback(resp);
    }, {drogon::Get});

    // --- GLOBAL CORS INJECTION ---
    drogon::app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &, const drogon::HttpResponsePtr &resp) {
        resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        resp->addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
        resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        resp->addHeader("Access-Control-Allow-Credentials", "true");
    });

    // --- GLOBAL OPTIONS HANDLER ---
    // This intercepts Preflight requests before they hit any routing logic
    drogon::app().registerPreRoutingAdvice([](const drogon::HttpRequestPtr &req, drogon::FilterCallback &&fcb, drogon::FilterChainCallback &&fccb) {
        if (req->method() == drogon::Options) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k204NoContent);
            resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            resp->addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
            resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            fcb(resp);
            return;
        }
        fccb();
    });

    std::cout << "--- Master Kernel Online on Port " << port << " ---" << std::endl;
    
    drogon::app().addListener("0.0.0.0", port)
                 .setThreadNum(16)
                 .run();

    return 0;
}