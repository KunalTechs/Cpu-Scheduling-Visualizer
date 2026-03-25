#pragma once
#include <drogon/HttpController.h>
#include <vector>
#include "process.h"

#include "Algorithms/FCFS.cpp"
#include "Algorithms/SJF.cpp"
#include "Algorithms/SRTF.cpp"
#include "Algorithms/HRRN.cpp"
#include "Algorithms/PSNP.cpp"
#include "Algorithms/PSP.cpp"
#include "Algorithms/RR.cpp"

using namespace drogon;

class Simulator : public HttpController<Simulator> // Added space
{
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(Simulator::runSimulation, "/simulate", Post, "JwtCookieFilter");
    METHOD_LIST_END

    void runSimulation(const HttpRequestPtr &req,
                       std::function<void(const HttpResponsePtr &)> &&callback)
    {
        auto json = req->getJsonObject();
        if (!json)
        {
            auto resp = HttpResponse::newHttpJsonResponse(Json::Value("Invalid JSON data"));
            resp->setStatusCode(k400BadRequest);
            callback(resp);
            return;
        }

        // 1. Map JSON to your C++ Process Vector
        std::vector<Process> processes;
        const Json::Value &procList = (*json)["processes"];

        for (const auto &p : procList)
        {
            Process proc;
            proc.id = p["id"].asInt();
            proc.arrivalTime = p["arrivalTime"].asInt();
            proc.burstTime = p["burstTime"].asInt();
            proc.priority = p.isMember("priority") ? p["priority"].asInt() : 0;
            processes.push_back(proc);
        }

        // Get Algorithm and Quantum from JSON
        int algorithmType = (*json)["algo"].asInt();
        int quantum = (*json).isMember("quantum") ? (*json)["quantum"].asInt() : 2;

        // Get Priority Mode (e.g., 1 for "Higher Value = Higher Priority", 2 for "Lower Value = Higher Priority")
        int priorityMode = (*json).isMember("priorityMode") ? (*json)["priorityMode"].asInt() : 1;

        // 2. Run the selected Algorithm
        if (algorithmType == 1)
        {
            solveFCFS(processes);
        }
        else if (algorithmType == 2)
        {
            solveSJF(processes);
        }
        else if (algorithmType == 3)
        {
            solveSRTF(processes);
        }
        else if (algorithmType == 4)
        {
            solveHRRN(processes);
        }
        else if (algorithmType == 5)
        {
            solvePriorityNonPreemptive(processes, priorityMode);
        }
        else if (algorithmType == 6)
        {
            solvePriorityPreemptive(processes, priorityMode);
        }
        else if (algorithmType == 7)
        {
            solveRR(processes, quantum);
        }

        // 3. Prepare the JSON Response for React
        Json::Value result;
        result["status"] = "success";

        Json::Value calculatedData(Json::arrayValue);
        for (const auto &p : processes)
        {
            Json::Value item;
            item["id"] = p.id;
            item["waitingTime"] = p.waitingTime;
            item["turnAroundTime"] = p.turnAroundTime;
            item["completionTime"] = p.completionTime;
            calculatedData.append(item);
        }
        result["data"] = calculatedData;

        auto resp = HttpResponse::newHttpJsonResponse(result);

        // Manual CORS (Drogon also has a CORS filter, but this works for testing)
        resp->addHeader("Access-Control-Allow-Origin", "*");
        callback(resp);
    }
};