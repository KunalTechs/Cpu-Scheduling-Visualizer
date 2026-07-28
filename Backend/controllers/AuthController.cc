#include "AuthController.h"
#include <mongocxx/instance.hpp>
#include <mongocxx/options/tls.hpp>
#include <mongocxx/options/client.hpp> 
#include <iostream>

static std::string getMongoUri() {
    const char* val = std::getenv("MONGO_URI");
    return val ? std::string(val) : std::string("mongodb://localhost:27017");
}

static std::string getRequestOrigin(const HttpRequestPtr &req) {
    std::string origin = req->getHeader("Origin");
    if (!origin.empty()) {
        return origin;
    }
    const char* val = std::getenv("FRONTEND_URL");
    return val ? std::string(val) : std::string("http://localhost:3000");
}

static bool isRequestSecure(const HttpRequestPtr &req) {
    std::string origin = req->getHeader("Origin");
    std::string proto = req->getHeader("X-Forwarded-Proto");
    const char* prodEnv = std::getenv("PRODUCTION");
    const char* nodeEnv = std::getenv("NODE_ENV");
    
    if (proto == "https" || origin.rfind("https://", 0) == 0) return true;
    if (prodEnv && (std::string(prodEnv) == "true" || std::string(prodEnv) == "production")) return true;
    if (nodeEnv && std::string(nodeEnv) == "production") return true;
    return false;
}

static mongocxx::instance mongoInstance{};

static mongocxx::client& getAuthClient() {
    static mongocxx::client client = []() {
        std::string mongoUri = getMongoUri();
        mongocxx::uri uri{mongoUri};
        
        // 🟢 FIX: Handle mongodb+srv:// (MongoDB Atlas cloud DB) & tls/ssl options
        if (mongoUri.find("mongodb+srv://") != std::string::npos ||
            mongoUri.find("ssl=true") != std::string::npos || 
            mongoUri.find("tls=true") != std::string::npos) {
            mongocxx::options::client client_options;
            mongocxx::options::tls tls_options;
            tls_options.allow_invalid_certificates(true);
            client_options.tls_opts(tls_options);
            return mongocxx::client{uri, client_options};
        }
        return mongocxx::client{uri};
    }();
    return client;
}

void AuthController::registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string origin = getRequestOrigin(req);
    auto json = req->getJsonObject();
    if (!json || !json->isMember("email") || !json->isMember("password"))
    {
        auto resp = HttpResponse::newHttpResponse(k400BadRequest, CT_TEXT_PLAIN);
        resp->setBody("Missing required fields: email and password");
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
        return;
    }

    std::string email    = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();
    std::string username = json->isMember("username") ? (*json)["username"].asString() : email;

    try
    {
        auto& client = getAuthClient();
        auto users = client["scheduler_db"]["users"];

        auto existing = users.find_one(
            bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize
        );

        if (existing)
        {
            auto resp = HttpResponse::newHttpResponse(k400BadRequest, CT_TEXT_PLAIN);
            resp->setBody("User already exists");
            resp->addHeader("Access-Control-Allow-Origin", origin);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        auto doc = bsoncxx::builder::stream::document{}
            << "email"    << email
            << "username" << username
            << "password" << password
            << bsoncxx::builder::stream::finalize;

        users.insert_one(doc.view());

        auto resp = HttpResponse::newHttpResponse(k200OK, CT_TEXT_PLAIN);
        resp->setBody("User registered successfully");
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
    catch (const std::exception &e)
    {
        std::cerr << "[AUTH_REGISTER_ERROR] " << e.what() << std::endl;
        auto resp = HttpResponse::newHttpResponse(k500InternalServerError, CT_TEXT_PLAIN);
        resp->setBody(e.what());
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
}

void AuthController::loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string origin = getRequestOrigin(req);
    auto json = req->getJsonObject();
    if (!json || !json->isMember("email") || !json->isMember("password")) {
        auto resp = HttpResponse::newHttpResponse(k400BadRequest, CT_TEXT_PLAIN);
        resp->setBody("Missing email or password");
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
        return;
    }

    std::string email = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();

    try {
        auto& client = getAuthClient();
        auto users = client["scheduler_db"]["users"];

        auto userDoc = users.find_one(
            bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize
        );

        if (!userDoc) {
            auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
            resp->setBody("Invalid Email or Password");
            resp->addHeader("Access-Control-Allow-Origin", origin);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        auto view = userDoc->view();
        if (!view["password"] || view["password"].type() != bsoncxx::type::k_string ||
            std::string(view["password"].get_string().value) != password) {
            auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
            resp->setBody("Invalid Email or Password");
            resp->addHeader("Access-Control-Allow-Origin", origin);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        std::string username = (view["username"] && view["username"].type() == bsoncxx::type::k_string)
            ? std::string(view["username"].get_string().value)
            : email;

        const char *secretEnv = std::getenv("JWT_SECRET");
        std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

        auto token = jwt::create()
            .set_issuer("scheduler_api")
            .set_payload_claim("email", jwt::claim(email))
            .set_payload_claim("username", jwt::claim(username))
            .sign(jwt::algorithm::hs256{secret});

        Json::Value ret;
        ret["status"] = "success";
        ret["username"] = username;
        ret["email"] = email;
        
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        
        // 🟢 FIX: Browser Cookie Security Policy
        // SameSite=None strictly requires Secure=true (HTTPS).
        // For local HTTP development, set SameSite=Lax and Secure=false so browsers accept it!
        bool isSecure = isRequestSecure(req);

        drogon::Cookie cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        if (isSecure) {
            cookie.setSameSite(drogon::Cookie::SameSite::kNone);
            cookie.setSecure(true);
        } else {
            cookie.setSameSite(drogon::Cookie::SameSite::kLax);
            cookie.setSecure(false);
        }
        resp->addCookie(cookie);

        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");

        callback(resp);
    }
    catch (const std::exception &e) {
        std::cerr << "[AUTH_LOGIN_ERROR] " << e.what() << std::endl;
        auto resp = HttpResponse::newHttpResponse(k500InternalServerError, CT_TEXT_PLAIN);
        resp->setBody(e.what());
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
}

void AuthController::logout(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string origin = getRequestOrigin(req);
    auto resp = HttpResponse::newHttpResponse();
    
    bool isSecure = isRequestSecure(req);

    drogon::Cookie cookie("token", "");
    cookie.setMaxAge(0);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    if (isSecure) {
        cookie.setSameSite(drogon::Cookie::SameSite::kNone);
        cookie.setSecure(true);
    } else {
        cookie.setSameSite(drogon::Cookie::SameSite::kLax);
        cookie.setSecure(false);
    }
    resp->addCookie(cookie);

    resp->setBody("Logged out successfully");
    resp->addHeader("Access-Control-Allow-Origin", origin);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}

void AuthController::checkAuth(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    std::string origin = getRequestOrigin(req);

    if (!req->getAttributes()->find("user_name") || !req->getAttributes()->find("user_email")) {
        auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
        resp->setBody("Unauthorized session");
        resp->addHeader("Access-Control-Allow-Origin", origin);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
        return;
    }

    std::string username = req->getAttributes()->get<std::string>("user_name");
    std::string email = req->getAttributes()->get<std::string>("user_email");

    Json::Value ret;
    ret["username"] = username;
    ret["email"] = email;
    ret["status"] = "success";

    auto resp = HttpResponse::newHttpJsonResponse(ret);
    resp->addHeader("Access-Control-Allow-Origin", origin);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}