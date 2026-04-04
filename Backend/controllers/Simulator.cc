#include "Simulator.h"
#include <json/json.h>
#include <vector>
#include <string>
#include <numeric>

// Algorithm Prototypes
std::vector<GanttBlock> solveFCFS(std::vector<Process> &processes);
std::vector<GanttBlock> solveSJF(std::vector<Process> &processes);
std::vector<GanttBlock> solveSRTF(std::vector<Process> &processes);
std::vector<GanttBlock> solveRR(std::vector<Process> &processes, int quantum);
std::vector<GanttBlock> solveHRRN(std::vector<Process> &processes);
std::vector<GanttBlock> solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);
std::vector<GanttBlock> solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);

// --- HELPER FUNCTION: THE ENGINE ---
Json::Value Simulator::runSpecificAlgo(const std::string &algoName, const Json::Value &processesJson, int quantum, bool isHighPriorityHigher) {
    std::vector<Process> processes;
    for (const auto &p : processesJson) {
        processes.push_back(Process(
            p["id"].asString(),
            p["arrival"].asInt(),
            p["burst"].asInt(),
            p.isMember("priority") ? p["priority"].asInt() : 0));
    }

    std::vector<GanttBlock> timeline;
    if (algoName == "FCFS") timeline = solveFCFS(processes);
    else if (algoName == "SJF") timeline = solveSJF(processes);
    else if (algoName == "SRTF") timeline = solveSRTF(processes);
    else if (algoName == "RR") timeline = solveRR(processes, quantum);
    else if (algoName == "HRRN") timeline = solveHRRN(processes);
    else if (algoName == "P-NP") timeline = solvePriorityNonPreemptive(processes, isHighPriorityHigher);
    else if (algoName == "P-P") timeline = solvePriorityPreemptive(processes, isHighPriorityHigher);

    // Calculate Stats
    double totalWait = 0, totalTat = 0;
    Json::Value procArray(Json::arrayValue);
    for (const auto &p : processes) {
        totalWait += p.waitingTime;
        totalTat += p.turnaroundTime;
        
        Json::Value pJson;
        pJson["id"] = p.id;
        pJson["completion"] = p.completionTime;
        pJson["tat"] = p.turnaroundTime;
        pJson["wait"] = p.waitingTime;
        procArray.append(pJson);
    }

    // Map Timeline
    Json::Value timelineArray(Json::arrayValue);
    for (const auto &block : timeline) {
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
    if (!json) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    std::string algo = (*json)["algorithm"].asString();
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;

    // ✅ Extract Priority Mode correctly from frontend request
    std::string pMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asString() : "lower";
    bool isHighPriorityHigher = (pMode == "higher");

    // Use the engine
    Json::Value resultJson = runSpecificAlgo(algo, (*json)["processes"], quantum, isHighPriorityHigher);
    resultJson["status"] = "success";

    auto resp = HttpResponse::newHttpJsonResponse(resultJson);
    resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    callback(resp);
}

// --- ENDPOINT: COMPARISON BENCHMARK ---
void Simulator::compareAll(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json) {
        callback(HttpResponse::newHttpResponse());
        return;
    }

    auto selectedAlgos = (*json)["algorithms"];
    auto processesJson = (*json)["processes"];
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;

    // ✅ Extract Priority Mode correctly for Benchmark comparison
    std::string pMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asString() : "lower";
    bool isHighPriorityHigher = (pMode == "higher");

    Json::Value comparisonResults(Json::arrayValue);

    for (const auto &algoName : selectedAlgos) {
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
    resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    callback(resp);
}