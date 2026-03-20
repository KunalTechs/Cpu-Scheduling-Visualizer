#include "process.h"
#include <vector>

void solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);

    while (completed != n)
    {
        int idx = -1;
        // Start with the "worst" possible priority based on the mode
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                bool isBetter = false;
                if (isHighPriorityHigher)
                {
                    if (processes[i].priority > bestPriority)
                        isBetter = true;  // Bigger is better:- higher value = higher priority
                }
                else
                {
                    if (processes[i].priority < bestPriority)
                        isBetter = true; // Smaller is better:- smaller value =  higher priority
                }

                if (isBetter)
                {
                    bestPriority = processes[i].priority;
                    idx = i;
                }
                // Tie Breaker FCFS:- by arrival time
                else if (processes[i].priority == bestPriority)
                {
                    if (idx == -1 || processes[i].arrivalTime < processes[idx].arrivalTime)
                    {
                        idx = i;
                    }
                }
                // If Arrival Times are also tied, use ID
                else if (processes[i].arrivalTime == processes[idx].arrivalTime)
                {
                    if (processes[i].id < processes[idx].id)
                    {
                        idx = i;
                    }
                }
            }
        }
        if (idx != -1)
        {
            processes[idx].completionTime = currentTime + processes[idx].burstTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            currentTime = processes[idx].completionTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            currentTime++;
        }
    }
}