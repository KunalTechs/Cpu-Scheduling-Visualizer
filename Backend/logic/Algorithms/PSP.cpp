#include "process.h"
#include <vector>
#include <climits> 

std::vector<GanttBlock> solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    std::vector<GanttBlock> timeline;
    if (n == 0) return timeline;

    int currentTime = 0, completed = 0;
    std::vector<int> remainingTime(n);
    for (int i = 0; i < n; i++)
        remainingTime[i] = processes[i].burstTime;

    while (completed != n)
    {
        int idx = -1;
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0)
            {
                bool isBetter = false;
                if (idx == -1) {
                    isBetter = true;
                } else {
                    if (isHighPriorityHigher) {
                        if (processes[i].priority > bestPriority) isBetter = true;
                    } else {
                        if (processes[i].priority < bestPriority) isBetter = true;
                    }

                    // Tie-breaker
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
            // --- GANTT CHART MERGE LOGIC ---
            // We ONLY merge if the LAST block in the timeline is the SAME process
            // AND that block ended exactly at currentTime.
            if (!timeline.empty() && timeline.back().id == processes[idx].id && timeline.back().end == currentTime) {
                timeline.back().end++;
            } else {
                timeline.push_back({processes[idx].id, currentTime, currentTime + 1});
            }

            remainingTime[idx]--;
            currentTime++;

            if (remainingTime[idx] == 0)
            {
                completed++;
                processes[idx].completionTime = currentTime;
                processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
                processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            }
        }
        else
        {
            currentTime++; // CPU Idle
        }
    }
    return timeline;
}