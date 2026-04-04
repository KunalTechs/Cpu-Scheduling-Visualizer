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
    ADD_METHOD_TO(AuthController::registerUser, "/register", Post, Options);
    ADD_METHOD_TO(AuthController::loginUser, "/login", Post, Options);
    ADD_METHOD_TO(AuthController::logout, "/logout", Get, Options);
   ADD_METHOD_TO(AuthController::checkAuth, "/api/check", Get, Options, "JwtCookieFilter");
METHOD_LIST_END

    void registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
    void loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
    void logout(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
    void checkAuth(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback);
};