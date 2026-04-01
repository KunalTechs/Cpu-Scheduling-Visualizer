#include "process.h"
#include <vector>
#include <climits>
#include <algorithm>

std::vector<GanttBlock> solveSJF(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0;
    int completed = 0;
    std::vector<bool> isCompleted(n, false);
    std::vector<GanttBlock> timeline; 

    while (completed != n)
    {
        int idx = -1;
        int minBurst = INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                if (processes[i].burstTime < minBurst)
                {
                    minBurst = processes[i].burstTime;
                    idx = i;
                }
                else if (processes[i].burstTime == minBurst)
                {
                    // Tie-breaker 1: Earlier Arrival Time
                    if (idx != -1)
                    {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) idx = i;
                        // Tie-breaker 2: String ID comparison
                        else if (processes[i].arrivalTime == processes[idx].arrivalTime)
                        {
                            if (processes[i].id < processes[idx].id) idx = i;
                        }
                    }
                }
            }
        }

        if (idx != -1)
        {
            int startTime = currentTime;
            int endTime = currentTime + processes[idx].burstTime;
            timeline.push_back({processes[idx].id, startTime, endTime});

            processes[idx].completionTime = endTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;

            currentTime = endTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // --- UPDATED IDLE LOGIC ---
            int nextArrival = INT_MAX;
            for (int i = 0; i < n; i++) {
                if (!isCompleted[i] && processes[i].arrivalTime > currentTime) {
                    nextArrival = std::min(nextArrival, processes[i].arrivalTime);
                }
            }

            if (nextArrival != INT_MAX) {
                // Record the Idle period for the Gantt Chart
                timeline.push_back({"IDLE", currentTime, nextArrival});
                currentTime = nextArrival;
            } else {
                currentTime++;
            }
        }
    }
    return timeline;
}