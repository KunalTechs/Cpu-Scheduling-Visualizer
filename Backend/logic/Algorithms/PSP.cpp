#include "process.h"
#include <vector>
#include <climits> 

void solvePriorityPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    int currentTime = 0;
    int completed = 0;
    std::vector<int> remainingTime(n);
    for (int i = 0; i < n; i++)
        remainingTime[i] = processes[i].burstTime;

    while (completed != n)
    {
        int idx = -1;
        // Start with the "worst" possible priority based on the mode
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0)
            {
                bool isBetter = false;
                if (isHighPriorityHigher)
                {
                    if (processes[i].priority > bestPriority)
                        isBetter = true; // Bigger is better:- higher value = higher priority
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
                // 2. Tie-breaker: If priorities are equal, use Arrival Time (FCFS)
                else if (processes[i].priority == bestPriority)
                {
                    if (idx != -1 && processes[i].arrivalTime < processes[idx].arrivalTime)
                    {
                        idx = i;
                    }
                    // 3. Final Tie-breaker: Lower ID
                    else if (idx != -1 && processes[i].arrivalTime == processes[idx].arrivalTime)
                    {
                        if (processes[i].id < processes[idx].id)
                        {
                            idx = i;
                        }
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