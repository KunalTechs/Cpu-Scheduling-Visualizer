#include "process.h"
#include <vector>
#include <climits> 

void solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    if (n == 0) return;

    int currentTime = 0;
    int completed = 0;
    std::vector<int> remainingTime(n);
    for (int i = 0; i < n; i++)
        remainingTime[i] = processes[i].burstTime;

    while (completed != n)
    {
        int idx = -1;
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++)
        {
            // Only consider processes that have arrived and aren't finished
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0)
            {
                bool isStrictlyBetter = false;
                if (isHighPriorityHigher) {
                    if (processes[i].priority > bestPriority) isStrictlyBetter = true;
                } else {
                    if (processes[i].priority < bestPriority) isStrictlyBetter = true;
                }

                if (isStrictlyBetter)
                {
                    bestPriority = processes[i].priority;
                    idx = i;
                }
                // Tie-breaker: If priorities are equal
                else if (processes[i].priority == bestPriority)
                {
                    // If we have an existing choice, compare them
                    if (idx != -1) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        } else if (processes[i].arrivalTime == processes[idx].arrivalTime) {
                            if (processes[i].id < processes[idx].id) {
                                idx = i;
                            }
                        }
                    } else {
                        idx = i; // First process found at this priority level
                    }
                }
            }
        }

        if (idx != -1) 
        {
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
            // CPU is idle
            currentTime++;
        }
    }
}