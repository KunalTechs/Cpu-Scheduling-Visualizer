#include "Simulator.h"
#include <json/json.h>
#include <vector>
#include <string>
#include <numeric>
#include <sstream>
#include <chrono>
#include <iostream>
#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <bsoncxx/builder/stream/document.hpp>

// --- ENV CONFIG ---
static const std::string FRONTEND_URL = []() {
    const char* val = std::getenv("FRONTEND_URL");
    return val ? std::string(val) : std::string("http://localhost:3000");
}();

// Algorithm Prototypes
std::vector<GanttBlock> solveFCFS(std::vector<Process> &processes);
std::vector<GanttBlock> solveSJF(std::vector<Process> &processes);
std::vector<GanttBlock> solveSRTF(std::vector<Process> &processes);
std::vector<GanttBlock> solveRR(std::vector<Process> &processes, int quantum);
std::vector<GanttBlock> solveHRRN(std::vector<Process> &processes);
std::vector<GanttBlock> solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);
std::vector<GanttBlock> solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);

// --- HELPER FUNCTION: THE ENGINE ---
Json::Value Simulator::runSpecificAlgo(const std::string &algoName, const Json::Value &processesJson, int quantum, bool isHighPriorityHigher)
{
    std::vector<Process> processes;
    for (const auto &p : processesJson)
    {
        processes.push_back(Process(
            p["id"].asString(),
            p["arrival"].asInt(),
            p["burst"].asInt(),
            p.isMember("priority") ? p["priority"].asInt() : 0));
    }

    std::vector<GanttBlock> timeline;
    if (algoName == "FCFS")
        timeline = solveFCFS(processes);
    else if (algoName == "SJF")
        timeline = solveSJF(processes);
    else if (algoName == "SRTF")
        timeline = solveSRTF(processes);
    else if (algoName == "RR")
        timeline = solveRR(processes, quantum);
    else if (algoName == "HRRN")
        timeline = solveHRRN(processes);
    else if (algoName == "P-NP")
        timeline = solvePriorityNonPreemptive(processes, isHighPriorityHigher);
    else if (algoName == "P-P")
        timeline = solvePriorityPreemptive(processes, isHighPriorityHigher);

    // Calculate Stats
    double totalWait = 0, totalTat = 0;
    Json::Value procArray(Json::arrayValue);
    for (const auto &p : processes)
    {
        totalWait += p.waitingTime;
        totalTat += p.turnaroundTime;

        Json::Value pJson;
        pJson["id"] = p.id;
        pJson["arrival"] = p.arrivalTime; 
        pJson["burst"] = p.burstTime;
        pJson["completion"] = p.completionTime;
        pJson["tat"] = p.turnaroundTime;
        pJson["wait"] = p.waitingTime;
        procArray.append(pJson);
    }

    // Map Timeline
    Json::Value timelineArray(Json::arrayValue);
    for (const auto &block : timeline)
    {
        Json::Value b;
        b["id"] = block.id;
        b["start"] = block.start;
        b["end"] = block.end;
        timelineArray.append(b);
    }

    Json::Value result;
    result["avgWait"] = processes.empty() ? 0 : totalWait / processes.size();
    result["avgTat"] = processes.empty() ? 0 : totalTat / processes.size();
    result["processes"] = procArray;
    result["timeline"] = timelineArray;
    return result;
}

// --- ENDPOINT: SINGLE SIMULATION ---
void Simulator::runSimulation(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json)
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string algo = (*json)["algorithm"].asString();
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;

    std::string pMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asString() : "lower";
    bool isHighPriorityHigher = (pMode == "higher");

    Json::Value resultJson = runSpecificAlgo(algo, (*json)["processes"], quantum, isHighPriorityHigher);
    resultJson["status"] = "success";

    auto resp = HttpResponse::newHttpJsonResponse(resultJson);
   resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    callback(resp);
}

// --- ENDPOINT: COMPARISON BENCHMARK ---
void Simulator::compareAll(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json)
    {
        callback(HttpResponse::newHttpResponse());
        return;
    }

    auto selectedAlgos = (*json)["algorithms"];
    auto processesJson = (*json)["processes"];
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;

    std::string pMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asString() : "lower";
    bool isHighPriorityHigher = (pMode == "higher");

    Json::Value comparisonResults(Json::arrayValue);
    for (const auto &algoName : selectedAlgos)
    {
        std::string name = algoName.asString();
        Json::Value stats = runSpecificAlgo(name, processesJson, quantum, isHighPriorityHigher);

        Json::Value entry;
        entry["algorithm"] = name;
        entry["avgWait"] = stats["avgWait"];
        entry["avgTat"] = stats["avgTat"];
        entry["timeline"] = stats["timeline"];
        comparisonResults.append(entry);
    }

    auto resp = HttpResponse::newHttpJsonResponse(comparisonResults);
   resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    callback(resp);
}

// --- ENDPOINT: GET HISTORY ---
void Simulator::getHistory(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    try
    {
        if (!req->getAttributes()->find("user_email"))
        {
            auto resp = HttpResponse::newHttpJsonResponse(Json::arrayValue);
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        std::string userEmail = req->getAttributes()->get<std::string>("user_email");

        auto historyCol = _mongoClient["scheduler_db"]["history"];

        auto query = bsoncxx::builder::stream::document{}
                     << "email" << userEmail
                     << bsoncxx::builder::stream::finalize;

        auto cursor = historyCol.find(query.view());

        Json::Value root(Json::arrayValue);
        for (auto &&doc : cursor)
        {
            std::string jsonStr = bsoncxx::to_json(doc);
            Json::Value entry;
            Json::CharReaderBuilder reader;
            std::string errs;
            std::stringstream ss(jsonStr);
            if (Json::parseFromStream(reader, ss, &entry, &errs))
            {
                root.append(entry);
            }
        }

        auto resp = HttpResponse::newHttpJsonResponse(root);
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
    catch (const std::exception &e)
    {
        std::cout << "DEBUG: GetHistory Failed -> " << e.what() << std::endl;
        auto resp = HttpResponse::newHttpJsonResponse(Json::arrayValue);
        resp->setStatusCode(k500InternalServerError);
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
}

// --- ENDPOINT: SAVE HISTORY ---
void Simulator::saveHistory(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    try
    {
        // 1. Get Email from Filter
        if (!req->getAttributes()->find("user_email"))
        {
            auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
            resp->setBody("Session Error: Email missing");
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }
        std::string userEmail = req->getAttributes()->get<std::string>("user_email");

        // 2. Get JSON Body from Frontend
        auto jsonBody = req->getJsonObject();
        if (!jsonBody)
        {
            auto resp = HttpResponse::newHttpResponse(k400BadRequest, CT_TEXT_PLAIN);
            resp->setBody("Missing JSON Body");
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }

        // 3. Convert Frontend JSON to BSON
        std::string rawJson = jsonBody->toStyledString();
        auto simulationDataBson = bsoncxx::from_json(rawJson);

        // 4. Build the final document
        // 🟢 FIXED: Using the "in-line" builder style to prevent data loss
        auto finalDoc = bsoncxx::builder::stream::document{}
                        << "email" << userEmail
                        << "timestamp" << bsoncxx::types::b_date{std::chrono::system_clock::now()}
                        << "simulation_results" << simulationDataBson.view()
                        << bsoncxx::builder::stream::finalize;

        // 5. Insert into MongoDB
        auto historyCol = _mongoClient["scheduler_db"]["history"];
        historyCol.insert_one(finalDoc.view());

        // 6. Success Response
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("Archive_Stored_Successfully");
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
    catch (const std::exception &e)
    {
        std::cout << "CRITICAL_SAVE_ERROR: " << e.what() << std::endl;
        auto resp = HttpResponse::newHttpResponse(k500InternalServerError, CT_TEXT_PLAIN);
        resp->setBody(e.what());
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        callback(resp);
    }
}

void Simulator::deleteHistory(const HttpRequestPtr &req,
                              std::function<void(const HttpResponsePtr &)> &&callback,
                              std::string &&id)
{
    try
    {
        // 1. Auth Check
        if (!req->getAttributes()->find("user_email"))
        {
            auto resp = HttpResponse::newHttpResponse(k401Unauthorized, CT_TEXT_PLAIN);
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
            return;
        }
        std::string userEmail = req->getAttributes()->get<std::string>("user_email");

        // 2. Database Connection
        auto historyCol = _mongoClient["scheduler_db"]["history"];

        // 3. Create Filter: Match both ID and Email (Security: prevent deleting others' data)
        bsoncxx::oid oid(id); // Convert string to MongoDB ObjectId
        auto filter = bsoncxx::builder::stream::document{}
                      << "_id" << oid
                      << "email" << userEmail
                      << bsoncxx::builder::stream::finalize;

        // 4. Execute Delete
        auto result = historyCol.delete_one(filter.view());

        if (result && result->deleted_count() > 0)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setBody("Deleted Successfully");
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
        }
        else
        {
            auto resp = HttpResponse::newHttpResponse(k404NotFound, CT_TEXT_PLAIN);
            resp->setBody("Simulation not found");
           resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
            resp->addHeader("Access-Control-Allow-Credentials", "true");
            callback(resp);
        }
    }
    catch (const std::exception &e)
    {
        auto resp = HttpResponse::newHttpResponse(k500InternalServerError, CT_TEXT_PLAIN);
       resp->addHeader("Access-Control-Allow-Origin", FRONTEND_URL);
        resp->addHeader("Access-Control-Allow-Credentials", "true");
        resp->setBody(e.what());
        callback(resp);
    }
}