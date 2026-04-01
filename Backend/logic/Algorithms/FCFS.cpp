#include "process.h"
#include <vector>
#include <algorithm>

std::vector<GanttBlock> solveFCFS(std::vector<Process>& processes) {
    std::vector<GanttBlock> timeline;
    if (processes.empty()) return timeline;

    // 1. Sort by arrival time (with ID as tie-breaker)
    std::sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime == b.arrivalTime) return a.id < b.id; 
        return a.arrivalTime < b.arrivalTime;
    });

    int currentTime = 0;

    for (auto& p : processes) {
        // --- 2. HANDLE CPU IDLE TIME ---
        // If the current time is less than the process arrival, the CPU is IDLE
        if (currentTime < p.arrivalTime) {
            int idleStart = currentTime;
            int idleEnd = p.arrivalTime;
            
            // Add the IDLE block to the timeline
            timeline.push_back({"IDLE", idleStart, idleEnd});
            
            // Jump the clock to when the process actually arrives
            currentTime = p.arrivalTime;
        }

        // --- 3. RECORD PROCESS EXECUTION ---
        int startTime = currentTime;
        int endTime = currentTime + p.burstTime;
        
        timeline.push_back({p.id, startTime, endTime});

        // Update Process Statistics
        p.completionTime = endTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        
        // Update the global clock
        currentTime = endTime;
    }

    return timeline;
}