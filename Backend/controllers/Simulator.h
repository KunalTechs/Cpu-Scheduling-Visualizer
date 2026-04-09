#pragma once
#include <drogon/HttpController.h>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <vector>
#include "process.h"

using namespace drogon;

static std::string getMongoUri() {
    const char* val = std::getenv("MONGO_URI");
    return val ? std::string(val) : std::string("mongodb://localhost:27017");
}

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

    mongocxx::client _mongoClient{mongocxx::uri{getMongoUri()}};
};