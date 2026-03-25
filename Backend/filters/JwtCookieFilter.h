#pragma once
#include <drogon/HttpFilter.h>
#include <jwt-cpp/jwt.h>
#include <cstdlib>

using namespace drogon;

class JwtCookieFilter : public HttpFilter<JwtCookieFilter>
{
public:
    virtual void doFilter(const HttpRequestPtr &req, FilterCallback &&fcb, FilterChainCallback &&fccb) override
    {
        auto token = req->getCookie("token");

        if (token.empty())
        {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k401Unauthorized);
            res->setBody("Missing Auth Cookie");
            fcb(res);
            return;
        }

        try
        {
            const char *secretEnv = std::getenv("JWT_SECRET");
            std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

            auto decoded = jwt::decode(token);
            auto verifier = jwt::verify()
                                .allow_algorithm(jwt::algorithm::hs256{secret})
                                .with_issuer("scheduler_api");

            verifier.verify(decoded);
            fccb(); // Success: Continue to Controller
        }
        catch (...)
        {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k401Unauthorized);
            res->setBody("Invalid Session");
            fcb(res);
        }
    }
};