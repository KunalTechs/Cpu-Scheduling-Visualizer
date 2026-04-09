#include "AuthController.h"
#include <mongocxx/instance.hpp>
#include <mongocxx/options/tls.hpp>
#include <mongocxx/options/client.hpp> 


static std::string getMongoUri() {
    const char* val = std::getenv("MONGO_URI");
    return val ? std::string(val) : std::string("mongodb://localhost:27017");
}

static const std::string FRONTEND_URL = []() {
    const char* val = std::getenv("FRONTEND_URL");
    return val ? std::string(val) : std::string("http://localhost:3000");
}();

static mongocxx::instance mongoInstance{};

static mongocxx::client& getAuthClient() {
    static mongocxx::client client = []() {
        mongocxx::uri uri{getMongoUri()};
        mongocxx::options::client client_options;
        mongocxx::options::tls tls_options;
        tls_options.allow_invalid_certificates(true);
        client_options.tls_opts(tls_options);
        return mongocxx::client{uri, client_options};
    }();
    return client;
}

void AuthController::registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json)
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string email    = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();
    std::string username = (*json)["username"].asString();

    try
    {
        
       auto& client = getAuthClient();
        auto users = client["scheduler_db"]["users"];

        auto existing = users.find_one(
            bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize
        );

        if (existing)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k400BadRequest);
            resp->setBody("User already exists");
            callback(resp);
            return;
        }

        auto doc = bsoncxx::builder::stream::document{}
            << "email"    << email
            << "username" << username
            << "password" << password
            << bsoncxx::builder::stream::finalize;

        users.insert_one(doc.view());

        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("User registered successfully");
        callback(resp);
    }
    catch (const std::exception &e)
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k500InternalServerError);
        resp->setBody(e.what());
        callback(resp);
    }
}

void AuthController::loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json) {
        callback(HttpResponse::newHttpResponse(k400BadRequest, CT_TEXT_PLAIN));
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

        if (!userDoc || std::string(userDoc->view()["password"].get_string().value) != password) {
            auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
            resp->setBody("Invalid Email or Password");
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        // 🟢 NEW: Extract username from MongoDB
        std::string username = std::string(userDoc->view()["username"].get_string().value);

        const char *secretEnv = std::getenv("JWT_SECRET");
        std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

        // 🟢 NEW: Add username to the JWT Payload
        auto token = jwt::create()
            .set_issuer("scheduler_api")
            .set_payload_claim("email", jwt::claim(email))
            .set_payload_claim("username", jwt::claim(username)) // 👈 IMPORTANT
            .sign(jwt::algorithm::hs256{secret});

        // 🟢 NEW: Return JSON so Frontend Redux can update immediately
        Json::Value ret;
        ret["status"] = "success";
        ret["username"] = username;
        ret["email"] = email;
        
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        const char* isProduction = std::getenv("PRODUCTION");

        drogon::Cookie cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSameSite(drogon::Cookie::SameSite::kNone);
        cookie.setSecure(isProduction != nullptr); // Set to true if using HTTPS
        resp->addCookie(cookie);

        // CORS Headers
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Credentials", "true");

        callback(resp);
    }
    catch (const std::exception &e) {
        auto resp = HttpResponse::newHttpResponse(k500InternalServerError, CT_TEXT_PLAIN);
        resp->setBody(e.what());
        callback(resp);
    }
}

void AuthController::logout(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto resp = HttpResponse::newHttpResponse();
    
    drogon::Cookie cookie("token", "");
    cookie.setMaxAge(0);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setSameSite(drogon::Cookie::SameSite::kNone);
    resp->addCookie(cookie);

    resp->setBody("Logged out successfully");
   resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}


void AuthController::checkAuth(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    // These keys must match the .insert() keys in your Filter above!
    std::string username = req->getAttributes()->get<std::string>("user_name");
    std::string email = req->getAttributes()->get<std::string>("user_email");

    Json::Value ret;
    ret["username"] = username;
    ret["email"] = email;
    ret["status"] = "success";

    auto resp = HttpResponse::newHttpJsonResponse(ret); // 👈 This MUST be JSON
   resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}