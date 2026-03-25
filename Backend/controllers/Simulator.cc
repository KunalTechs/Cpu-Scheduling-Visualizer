#include "Simulator.h"
#include <json/json.h>

// Prototypes (The compiler needs to know these functions exist elsewhere)
void solveFCFS(std::vector<Process> &processes);
void solveSJF(std::vector<Process> &processes);
void solveSRTF(std::vector<Process> &processes);
void solveRR(std::vector<Process> &processes, int quantum);
void solveHRRN(std::vector<Process> &processes);
void solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);
void solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);

void Simulator::runSimulation(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json)
    {
        auto resp = HttpResponse::newHttpResponse();
        resp->setStatusCode(k400BadRequest);
        resp->setBody("Invalid JSON input");
        callback(resp);
        return;
    }

    // 1. Parse Input from React 
    std::string algo = (*json)["algorithm"].asString();
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;
    bool priorityMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asBool() : true;

    std::vector<Process> processes; 
    auto procList = (*json)["processes"];
    
    for (const auto &p : procList)
    {
        processes.push_back(Process(
            p["id"].asInt(),
            p["arrivalTime"].asInt(),
            p["burstTime"].asInt(), 
            p.isMember("priority") ? p["priority"].asInt() : 0
        ));
    }

    // 2. Execute the Selected Algorithm
    if (algo == "FCFS") solveFCFS(processes);
    else if (algo == "SJF") solveSJF(processes);
    else if (algo == "SRTF") solveSRTF(processes);
    else if (algo == "RR") solveRR(processes, quantum);
    else if (algo == "HRRN") solveHRRN(processes);
    else if (algo == "PNSP") solvePriorityNonPreemptive(processes, priorityMode);
    else if (algo == "PSP") solvePriorityPreemptive(processes, priorityMode);

    // 3. Convert Results back to JSON for React
    Json::Value resultJson;
    Json::Value processArray(Json::arrayValue);

    for (const auto &p : processes)
    {
        Json::Value pJson;
        pJson["id"] = p.id;
        pJson["completionTime"] = p.completionTime;
        pJson["turnaroundTime"] = p.turnaroundTime; // Match your Process.h field names
        pJson["waitingTime"] = p.waitingTime;
        processArray.append(pJson);
    }

    resultJson["status"] = "success";
    resultJson["results"] = processArray;
    
    auto resp = HttpResponse::newHttpJsonResponse(resultJson);
    resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow React
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    callback(resp);
}