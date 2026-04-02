#include "JwtCookieFilter.h"
#include <jwt-cpp/jwt.h>
#include <cstdlib>

void JwtCookieFilter::doFilter(const HttpRequestPtr &req,
                                FilterCallback &&fcb,
                                FilterChainCallback &&fccb)
{
    if (req->method() == drogon::Options) {
        fccb();
        return;
    }

    auto token = req->getCookie("token");

    if (token.empty()) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        res->setBody("Missing Auth Cookie");
        res->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res->addHeader("Access-Control-Allow-Credentials", "true");
        fcb(res);
        return;
    }

    try {
        const char *secretEnv = std::getenv("JWT_SECRET");
        std::string secret = secretEnv ? secretEnv : "DEFAULT_SECRET";

        auto decoded = jwt::decode(token);
        auto verifier = jwt::verify()
                            .allow_algorithm(jwt::algorithm::hs256{secret})
                            .with_issuer("scheduler_api");

        verifier.verify(decoded);
        fccb();
    }
    catch (...) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        res->setBody("Invalid Session");
        res->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res->addHeader("Access-Control-Allow-Credentials", "true");
        fcb(res);
    }
}