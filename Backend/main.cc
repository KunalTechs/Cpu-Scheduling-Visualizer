#include <iostream>
#include <vector>
#include <iomanip>
#include "process.h"

// Tell the compiler about both functions
void solveFCFS(std::vector<Process> &processes);
void solveSJF(std::vector<Process> &processes);

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
    int n = processes.size();
    int maxCompletion = 0;

    for (const auto& p : processes) {
        totalWait += p.waitingTime;
        totalTAT += p.turnaroundTime;
        if (p.completionTime > maxCompletion) maxCompletion =p.completionTime;
    }

    std::cout << "\n=== Stats for " << tittle << " ===\n";
    std::cout << std::fixed << std::setprecision(2);
   std::cout << "Average Waiting Time    : " << totalWait / n << " ms\n";
    std::cout << "Average Turnaround Time : " << totalTAT / n << " ms\n";

    // Throughput = Total Processes / Total Time taken
    if (maxCompletion > 0) {
        std::cout << "Throughput              : " << (double)n / maxCompletion << " processes/ms\n";
    }
    std::cout << "===========================\n";
}


int main() {
    std::vector<Process> data = {
    Process(1, 0, 20), // P1: Arrives at 0, takes 20ms (The "Truck")
    Process(2, 0, 2),  // P2: Arrives at 0, takes 2ms  (The "Bike")
    Process(3, 0, 1)   // P3: Arrives at 0, takes 1ms  (The "Scooter")
};

    std::vector<Process> fcfsData = data;
    std::vector<Process> sjfData = data;

    // Run FCFS
    solveFCFS(fcfsData);
    printTable(fcfsData, "FCFS Results");
    displayStats(fcfsData, "FCFS");

    // Run SJF
    solveSJF(sjfData);
    printTable(sjfData, "SJF Results");
    displayStats(sjfData, "SJF");

    return 0;
}