#pragma once
#include <drogon/HttpController.h>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <jwt-cpp/jwt.h>
#include <cstdlib>

using namespace drogon;

class AuthController : public HttpController<AuthController>
{
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthController::registerUser, "/register", Post);
    ADD_METHOD_TO(AuthController::loginUser, "/login", Post);
    ADD_METHOD_TO(AuthController::logout, "/logout", Get);
    METHOD_LIST_END

    // --- REGISTER ---
    void registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
    {
        auto json = req->getJsonObject();
        if (!json)
        {
            callback(HttpResponse::newHttpResponse());
            return;
        }

        std::string username = (*json)["username"].asString();
        std::string password = (*json)["password"].asString();

        try
        {
            static mongocxx::client client{mongocxx::uri{"mongodb://mongodb:27017"}};
            auto users = client["scheduler_db"]["users"];

            auto existing = users.find_one(bsoncxx::builder::stream::document{} << "username" << username << bsoncxx::builder::stream::finalize);

            if (existing)
            {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k400BadRequest);
                resp->setBody("User already exists");
                callback(resp);
                return;
            }

            auto doc = bsoncxx::builder::stream::document{} << "username" << username << "password" << password << bsoncxx::builder::stream::finalize;
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

    // --- LOGIN ---
    void loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
    {
        auto json = req->getJsonObject();
        std::string username = (*json)["username"].asString();
        std::string password = (*json)["password"].asString();

        try
        {
            static mongocxx::client client{mongocxx::uri{"mongodb://mongodb:27017"}};
            auto users = client["scheduler_db"]["users"];

            auto userDoc = users.find_one(bsoncxx::builder::stream::document{} << "username" << username << bsoncxx::builder::stream::finalize);

            if (!userDoc || userDoc->view()["password"].get_utf8().value.to_string() != password)
            {
                auto resp = HttpResponse::newHttpResponse();
                resp->setStatusCode(k401Unauthorized);
                resp->setBody("Invalid credentials");
                callback(resp);
                return;
            }

            // Get Secret from .env
            const char *secretEnv = std::getenv("JWT_SECRET");
            std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

            auto token = jwt::create()
                             .set_issuer("scheduler_api")
                             .set_type("JWS")
                             .set_payload_claim("username", jwt::claim(username))
                             .sign(jwt::algorithm::hs256{secret});

            auto resp = HttpResponse::newHttpResponse();
            resp->setBody("Login Success");
            drogon::Cookie cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            resp->addCookie(cookie);
            callback(resp);
        }
        catch (...)
        {
            callback(HttpResponse::newHttpResponse());
        }
    }

    // --- LOGOUT ---
    void logout(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
    {
        auto resp = HttpResponse::newHttpResponse();
        drogon::Cookie cookie("token", "");
        cookie.setMaxAge(0);
        resp->addCookie(cookie);
        resp->setBody("Logged out");
        callback(resp);
    }
};