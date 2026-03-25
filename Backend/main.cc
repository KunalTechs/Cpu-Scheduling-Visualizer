#include <drogon/drogon.h>
#include <iostream>
#include <vector>
#include <iomanip>
#include "process.h"

// Tell the compiler about both functions
void solveFCFS(std::vector<Process> &processes);
void solveSJF(std::vector<Process> &processes);
void solveRR(std::vector<Process>& processes, int quantum);
void solveSRTF(std::vector<Process> &processes);
void solveHRRN(std::vector<Process> &processes);
void solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);
void solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher);

void printTable(const std::vector<Process>& processes, std::string title) {
    std::cout << "\n--- " << title << " ---\n";
    std::cout << std::left << std::setw(5) << "ID" 
              << std::setw(8) << "Arr" 
              << std::setw(8) << "Burst" 
              << std::setw(8) << "End" 
              << std::setw(8) << "Wait" << "\n";
    
    for (const auto& p : processes) {
        std::cout << std::left << std::setw(5) << p.id 
                  << std::setw(8) << p.arrivalTime 
                  << std::setw(8) << p.burstTime 
                  << std::setw(8) << p.completionTime 
                  << std::setw(8) << p.waitingTime << "\n";
    }
}

void displayStats(const std::vector<Process>& processes, std::string tittle) {
    double totalWait = 0;
    double totalTAT = 0;
    int totalWorkDone = 0; // Sum of all burst times
    int n = processes.size();
    int maxCompletion = 0;

    for (const auto& p : processes) {
        totalWait += p.waitingTime;
        totalTAT += p.turnaroundTime;
        totalWorkDone += p.burstTime; // Add up all the work the CPU actually did
        
        if (p.completionTime > maxCompletion) {
            maxCompletion = p.completionTime;
        }
    }

    // Calculation: Total Time minus the time spent working
    int totalIdleTime = maxCompletion - totalWorkDone;

    std::cout << "\n=== Stats for " << tittle << " ===\n";
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Average Waiting Time    : " << totalWait / n << " ms\n";
    std::cout << "Average Turnaround Time : " << totalTAT / n << " ms\n";
    
    // NEW STATS:
    std::cout << "Total CPU Idle Time     : " << totalIdleTime << " ms\n";
    if (maxCompletion > 0) {
        double utilization = ((double)totalWorkDone / maxCompletion) * 100;
        std::cout << "CPU Utilization         : " << utilization << " %\n";
        std::cout << "Throughput              : " << (double)n / maxCompletion << " processes/ms\n";
    }
    std::cout << "===========================\n";
}


#include <drogon/drogon.h>
#include <iostream>
#include <cstdlib>

int main() {
    // 1. Get Port from Environment (High-Level move)
    const char* portEnv = std::getenv("PORT");
    int port = portEnv ? std::stoi(portEnv) : 8080;

    // 2. Configure CORS (Required for React to talk to C++)
    drogon::app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &, const drogon::HttpResponsePtr &resp) {
        resp->addHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Your React URL
        resp->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp->addHeader("Access-Control-Allow-Credentials", "true");
    });

    // 3. A simple "Health Check" route for testing
    drogon::app().registerHandler("/", [](const drogon::HttpRequestPtr& req, 
        std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setBody("<h1>CPU Scheduling API is Online</h1>");
        callback(resp);
    });

    // 4. Start the Server
    std::cout << "--- Starting C++ Backend on Port " << port << " ---" << std::endl;
    
    drogon::app()
        .addListener("0.0.0.0", port)
        .setThreadNum(16) // Performance optimization for high-concurrency
        .run();

    return 0;
}