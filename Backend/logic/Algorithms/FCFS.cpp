#include "process.h"
#include <vector>
#include <algorithm>

void solveFCFS(std::vector<Process>& processes) {
    // 1. Sort by arrival time
    std::sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime == b.arrivalTime) {
            return a.id < b.id; // Tie-breaker
        }
        return a.arrivalTime < b.arrivalTime;
    });

    int currentTime = 0;
    for (auto& p : processes) {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }

        p.completionTime = currentTime + p.burstTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        
        currentTime = p.completionTime;
    }
}