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
    std::vector<GanttBlock> timeline; // To store the execution path

    while (completed != n)
    {
        int idx = -1;
        int minBurst = INT_MAX;

        // Find the shortest job among processes that have arrived
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
                        if (processes[i].arrivalTime < processes[idx].arrivalTime)
                        {
                            idx = i;
                        }
                        // Tie-breaker 2: String ID comparison (P1 < P2)
                        else if (processes[i].arrivalTime == processes[idx].arrivalTime)
                        {
                            if (processes[i].id < processes[idx].id)
                            {
                                idx = i;
                            }
                        }
                    }
                    else
                    {
                        idx = i;
                    }
                }
            }
        }

        if (idx != -1)
        {
            // --- RECORD FOR GANTT CHART ---
            int startTime = currentTime;
            int endTime = currentTime + processes[idx].burstTime;
            timeline.push_back({processes[idx].id, startTime, endTime});

            // Calculate Results
            processes[idx].completionTime = endTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = std::max(0, processes[idx].turnaroundTime - processes[idx].burstTime);

            currentTime = endTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // CPU is Idle: Jump to the next arriving process to avoid useless loops
            int nextArrival = INT_MAX;
            for (int i = 0; i < n; i++) {
                if (!isCompleted[i] && processes[i].arrivalTime > currentTime) {
                    nextArrival = std::min(nextArrival, processes[i].arrivalTime);
                }
            }
            if (nextArrival != INT_MAX) currentTime = nextArrival;
            else currentTime++;
        }
    }
    return timeline;
}