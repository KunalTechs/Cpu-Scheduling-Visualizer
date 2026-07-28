#pragma once
#include <drogon/HttpController.h>
#include <mongocxx/client.hpp>
#include <mongocxx/uri.hpp>
#include <vector>
#include "process.h"
#include <mongocxx/options/tls.hpp>
#include <mongocxx/options/client.hpp>

using namespace drogon;

static std::string getMongoUri()
{
    const char *val = std::getenv("MONGO_URI");
    return val ? std::string(val) : std::string("mongodb://localhost:27017");
}

class Simulator : public HttpController<Simulator>
{
public:
    METHOD_LIST_BEGIN
    // Main Simulation Endpoints
    ADD_METHOD_TO(Simulator::runSimulation, "/api/simulate", Post, Options, "JwtCookieFilter");
    ADD_METHOD_TO(Simulator::compareAll, "/api/compare", Post, Options, "JwtCookieFilter");

    // History Management Endpoints
    ADD_METHOD_TO(Simulator::getHistory, "/api/history", Get, Options, "JwtCookieFilter");
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

    static mongocxx::client makeMongoClient()
    {
        std::string mongoUri = getMongoUri();
        mongocxx::uri uri{mongoUri};
        if (mongoUri.find("mongodb+srv://") != std::string::npos ||
            mongoUri.find("ssl=true") != std::string::npos ||
            mongoUri.find("tls=true") != std::string::npos)
        {
            mongocxx::options::client client_options;
            mongocxx::options::tls tls_options;
            tls_options.allow_invalid_certificates(true);
            client_options.tls_opts(tls_options);
            return mongocxx::client{uri, client_options};
        }
        return mongocxx::client{uri};
    }
    mongocxx::client _mongoClient{makeMongoClient()};
};