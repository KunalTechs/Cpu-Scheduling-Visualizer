#include "process.h"
#include <vector>
#include <climits> 

std::vector<GanttBlock> solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    std::vector<GanttBlock> timeline;
    if (n == 0) return timeline;

    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);

    while (completed != n)
    {
        int idx = -1;
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++) {
    if (processes[i].arrivalTime <= currentTime && !isCompleted[i]) {
        bool isBetter = false;
        if (idx == -1) {
            isBetter = true;
        } else {
            if (isHighPriorityHigher) {
                if (processes[i].priority > bestPriority) isBetter = true;
            } else {
                if (processes[i].priority < bestPriority) isBetter = true;
            }

            // Tie-breaker only if priorities are equal
            if (processes[i].priority == bestPriority) {
                if (processes[i].arrivalTime < processes[idx].arrivalTime) isBetter = true;
                else if (processes[i].arrivalTime == processes[idx].arrivalTime && processes[i].id < processes[idx].id) isBetter = true;
            }
        }

        if (isBetter) {
            bestPriority = processes[i].priority;
            idx = i;
        }
    }
}

        if (idx != -1)
        {
            // --- RECORD FOR GANTT CHART ---
            int startTime = currentTime;
            int endTime = currentTime + processes[idx].burstTime;
            timeline.push_back({processes[idx].id, startTime, endTime});

            // Update Statistics
            processes[idx].completionTime = endTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            
            currentTime = endTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // CPU is idle, jump to the next arriving process or increment
            int nextArrival = INT_MAX;
            for(int i=0; i<n; i++) {
                if(!isCompleted[i] && processes[i].arrivalTime > currentTime) {
                    if(processes[i].arrivalTime < nextArrival) nextArrival = processes[i].arrivalTime;
                }
            }
            if(nextArrival != INT_MAX) currentTime = nextArrival;
            else currentTime++;
        }
    }
    return timeline;
}