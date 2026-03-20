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


int main() {

    std::vector<Process> data = {
        Process(1, 2, 10, 1), 
        Process(2, 2, 2, 5),  
        Process(3, 4, 4, 3),  
        Process(4, 6, 1, 4)
    };

    std::vector<Process> fcfsData = data;
    std::vector<Process> sjfData = data;
    std::vector<Process> rrData = data;
    std::vector<Process> srtfData = data;
    std::vector<Process> hrrnData = data;
    std::vector<Process> psnpData = data;
    std::vector<Process> pspData = data;

    // Run FCFS
    solveFCFS(fcfsData);
    printTable(fcfsData, "FCFS Results");
    displayStats(fcfsData, "FCFS");

    // Run SJF
    solveSJF(sjfData);
    printTable(sjfData, "SJF Results");
    displayStats(sjfData, "SJF");

     //3. RUN SRTF
    solveSRTF(srtfData);
    printTable(srtfData, "SRTF Results");
    displayStats(srtfData, "SRTF");

     //4. RUN HRRN
    solveHRRN(hrrnData);
    printTable(hrrnData, "HRRN Results");
    displayStats(hrrnData, "HRRN");

    int priorityChoice;
    std::cout << "\nPriority Mode:\n1. Higher Value = Higher Priority\n2. Lower Value = Higher Priority\nChoice: ";
    std::cin >> priorityChoice;

    bool isHighHigher = (priorityChoice == 1);

     //5. RUN PSNP
    solvePriorityNonPreemptive(psnpData, isHighHigher);
    printTable(psnpData, "PSNP Results");
    displayStats(psnpData, "PSNP");

     //6. RUN PSP
    solvePriorityPreemptive(pspData, isHighHigher);
    printTable(pspData, "PSP Results");
    displayStats(pspData, "PSP");

    // 7. Run Round Robin 
    // Dynamic Round Robin Quantum
    int userQuantum;
    std::cout << "\nEnter Time Quantum for Round Robin: ";
    std::cin >> userQuantum;

    if (userQuantum <= 0) {
        std::cout << "Invalid quantum! Defaulting to 2.\n";
        userQuantum = 2;
    }
    solveRR(rrData, userQuantum);
    std::string rrTitle = "Round Robin (q=" + std::to_string(userQuantum) + ")";
    printTable(rrData, "RR Results");
    displayStats(rrData, "Round Robin  (q=" + std::to_string(userQuantum) + ")");



    return 0;
}