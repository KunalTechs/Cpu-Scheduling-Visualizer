#include "process.h"
#include <vector>
#include <algorithm>

std::vector<GanttBlock> solveFCFS(std::vector<Process>& processes) {
    std::vector<GanttBlock> timeline; // To store the execution path

    // 1. Sort by arrival time (with ID as tie-breaker)
    std::sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime == b.arrivalTime) {
            return a.id < b.id; 
        }
        return a.arrivalTime < b.arrivalTime;
    });

    int currentTime = 0;
    
    for (auto& p : processes) {
        // If CPU is idle, jump to the next process arrival time
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }

        // --- RECORD FOR GANTT CHART ---
        int startTime = currentTime;
        int endTime = currentTime + p.burstTime;
        timeline.push_back({p.id, startTime, endTime});

        // Calculate Process Stats
        p.completionTime = endTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = std::max(0, p.turnaroundTime - p.burstTime);
        
        // Update clock
        currentTime = p.completionTime;
    }

    return timeline; // Return this to your Drogon handler
}