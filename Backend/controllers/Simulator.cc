#include "Simulator.h"
#include <json/json.h>
#include <vector>
#include <string>

// Update prototypes to return the timeline vector
std::vector<GanttBlock> solveFCFS(std::vector<Process> &processes);
std::vector<GanttBlock> solveSJF(std::vector<Process> &processes);
std::vector<GanttBlock> solveSRTF(std::vector<Process> &processes);
std::vector<GanttBlock> solveRR(std::vector<Process> &processes, int quantum);
std::vector<GanttBlock> solveHRRN(std::vector<Process> &processes);
std::vector<GanttBlock> solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);
std::vector<GanttBlock> solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);

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
    // Match the strings sent from your Dashboard.jsx state
    std::string algo = (*json)["algorithm"].asString();
    int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;
    
    // Convert "lower"/"higher" string from React to bool for C++
    std::string pMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asString() : "lower";
    bool isHighPriorityHigher = (pMode == "higher");

    std::vector<Process> processes; 
    auto procList = (*json)["processes"];
    
    for (const auto &p : procList)
    {
        // React sends 'id' as a string (e.g., "P1"), Process.h expects string
        processes.push_back(Process(
            p["id"].asString(), 
            p["arrival"].asInt(),
            p["burst"].asInt(), 
            p.isMember("priority") ? p["priority"].asInt() : 0
        ));
    }

    // 2. Execute Algorithm and Capture the Timeline
    std::vector<GanttBlock> timeline;

    if (algo == "FCFS") timeline = solveFCFS(processes);
    else if (algo == "SJF") timeline = solveSJF(processes);
    else if (algo == "SRTF") timeline = solveSRTF(processes);
    else if (algo == "RR") timeline = solveRR(processes, quantum);
    else if (algo == "HRRN") timeline = solveHRRN(processes);
    else if (algo == "P-NP") timeline = solvePriorityNonPreemptive(processes, isHighPriorityHigher);
    else if (algo == "P-P") timeline = solvePriorityPreemptive(processes, isHighPriorityHigher);

    // 3. Prepare Multi-Part JSON Response
    Json::Value resultJson;
    Json::Value timelineArray(Json::arrayValue);
    Json::Value processArray(Json::arrayValue);

    // Map the Gantt Chart blocks
    for (const auto &block : timeline) {
        Json::Value b;
        b["id"] = block.id;
        b["start"] = block.start;
        b["end"] = block.end;
        timelineArray.append(b);
    }

    // Map the Table results
    for (const auto &p : processes)
    {
        Json::Value pJson;
        pJson["id"] = p.id;
        pJson["completionTime"] = p.completionTime;
        pJson["turnaroundTime"] = p.turnaroundTime;
        pJson["waitingTime"] = p.waitingTime;
        processArray.append(pJson);
    }

    resultJson["status"] = "success";
    resultJson["timeline"] = timelineArray; // Key for the Gantt Chart
    resultJson["results"] = processArray;   // Key for the Table
    
    auto resp = HttpResponse::newHttpJsonResponse(resultJson);
    
    // Ensure CORS allows the React dev server with credentials
    resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    resp->addHeader("Access-Control-Allow-Credentials", "true");
    
    callback(resp);
}