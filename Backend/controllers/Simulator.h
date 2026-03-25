#pragma once
#include <drogon/HttpController.h>
#include <vector>
#include "process.h"

using namespace drogon;

class Simulator : public HttpController<Simulator>
{
public:
    METHOD_LIST_BEGIN
    // Using the JwtCookieFilter we built earlier
    ADD_METHOD_TO(Simulator::runSimulation, "/simulate", Post, "JwtCookieFilter");
    METHOD_LIST_END

    void runSimulation(const HttpRequestPtr &req, 
                        std::function<void(const HttpResponsePtr &)> &&callback);
};