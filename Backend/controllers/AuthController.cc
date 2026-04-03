#include "AuthController.h"
#include <mongocxx/instance.hpp> 

static mongocxx::instance mongoInstance{};

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
        
        static mongocxx::client client{mongocxx::uri{"mongodb://mongodb:27017"}};
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
    if (!json)
    {
        callback(HttpResponse::newHttpResponse());
        return;
    }

    std::string email    = (*json)["email"].asString();
    std::string password = (*json)["password"].asString();

    try
    {
        static mongocxx::client client{mongocxx::uri{"mongodb://mongodb:27017"}};
        auto users = client["scheduler_db"]["users"];

        auto userDoc = users.find_one(
            bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize
        );

        if (!userDoc || std::string(userDoc->view()["password"].get_string().value) != password)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(k401Unauthorized);
            resp->setBody("Invalid Email or Password");
            callback(resp);
            return;
        } 

        const char *secretEnv = std::getenv("JWT_SECRET");
        std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

        auto token = jwt::create()
            .set_issuer("scheduler_api")
            .set_payload_claim("email", jwt::claim(email))
            .sign(jwt::algorithm::hs256{secret});

        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("Login Success");

        drogon::Cookie cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSameSite(drogon::Cookie::SameSite::kNone);
        resp->addCookie(cookie);

        callback(resp);
    }
    catch (...)
    {
        callback(HttpResponse::newHttpResponse());
    }
}

void AuthController::logout(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto resp = HttpResponse::newHttpResponse();

    drogon::Cookie cookie("token", "");
    cookie.setMaxAge(0);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    resp->addCookie(cookie);

    resp->setBody("Logged out successfully");
    callback(resp);
}


void AuthController::checkAuth(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    // If the JwtCookieFilter is applied to this route, 
    // it will only reach this point if the token is valid.
    auto resp = HttpResponse::newHttpResponse();
    resp->setStatusCode(k200OK);
    resp->setBody("Authenticated");
    
    // Add CORS headers so React can read the response
    resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}