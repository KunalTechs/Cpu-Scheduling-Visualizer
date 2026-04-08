#pragma once
#include <drogon/HttpController.h>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <vector>
#include "process.h"

using namespace drogon;

class Simulator : public HttpController<Simulator>
{
public:
    METHOD_LIST_BEGIN
    // Main Simulation Endpoints
    ADD_METHOD_TO(Simulator::runSimulation, "/api/simulate", Post, Options, "JwtCookieFilter");
    ADD_METHOD_TO(Simulator::compareAll,    "/api/compare",  Post, Options, "JwtCookieFilter");

    // History Management Endpoints
    ADD_METHOD_TO(Simulator::getHistory,  "/api/history", Get,  Options, "JwtCookieFilter");
    ADD_METHOD_TO(Simulator::saveHistory, "/api/history", Post, Options, "JwtCookieFilter");
    ADD_METHOD_TO(Simulator::deleteHistory, "/api/history/{id}", Delete, Options, "JwtCookieFilter");
    METHOD_LIST_END

    // Public API Methods
    void runSimulation(const HttpRequestPtr &req,
                       std::function<void(const HttpResponsePtr &)> &&callback);

    void compareAll(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback);

    void getHistory(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback);

    void saveHistory(const HttpRequestPtr &req,
                     std::function<void(const HttpResponsePtr &)> &&callback);

    void deleteHistory(const HttpRequestPtr &req, 
                   std::function<void(const HttpResponsePtr &)> &&callback, 
                   std::string &&id);

private:
    // Core Engine Helper
    Json::Value runSpecificAlgo(const std::string &algoName,
                                const Json::Value &processes,
                                int quantum,
                                bool isHighPriorityHigher);

    // ✅ Single MongoDB client — initialized once at construction, safe across requests
    mongocxx::client _mongoClient{mongocxx::uri{"mongodb://mongodb:27017"}};
};