#pragma once
#include <drogon/HttpFilter.h>

using namespace drogon;

class JwtCookieFilter : public HttpFilter<JwtCookieFilter>
{
public:
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
};