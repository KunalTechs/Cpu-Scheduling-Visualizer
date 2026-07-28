#include <drogon/drogon.h>
#include <iostream>
#include <cstdlib>

static std::string getOrigin(const drogon::HttpRequestPtr &req) {
    std::string origin = req->getHeader("Origin");
    if (!origin.empty()) {
        return origin;
    }
    const char* frontendEnv = std::getenv("FRONTEND_URL");
    return frontendEnv ? std::string(frontendEnv) : "http://localhost:3000";
}

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
    drogon::app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &req, const drogon::HttpResponsePtr &resp) {
        std::string origin = getOrigin(req);
        if (resp->getHeader("Access-Control-Allow-Origin").empty()) {
            resp->addHeader("Access-Control-Allow-Origin", origin);
        }
        if (resp->getHeader("Access-Control-Allow-Credentials").empty()) {
            resp->addHeader("Access-Control-Allow-Credentials", "true");
        }
        resp->addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
        resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    });

    // --- GLOBAL OPTIONS HANDLER ---
    drogon::app().registerPreRoutingAdvice([](const drogon::HttpRequestPtr &req, drogon::FilterCallback &&fcb, drogon::FilterChainCallback &&fccb) {
        if (req->method() == drogon::Options) {
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k204NoContent);
            std::string origin = getOrigin(req);
            resp->addHeader("Access-Control-Allow-Origin", origin);
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
