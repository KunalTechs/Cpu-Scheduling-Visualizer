#include "process.h"
#include <vector>
#include <climits> 

void solvePriorityNonPreemptive(std::vector<Process> &processes, bool isHighPriorityHigher)
{
    int n = processes.size();
    if (n == 0) return;

    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);

    while (completed != n)
    {
        int idx = -1;
        int bestPriority = isHighPriorityHigher ? INT_MIN : INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                bool isBetter = false;
                if (isHighPriorityHigher) {
                    if (processes[i].priority > bestPriority) isBetter = true;
                } else {
                    if (processes[i].priority < bestPriority) isBetter = true;
                }

                if (isBetter)
                {
                    bestPriority = processes[i].priority;
                    idx = i;
                }
                // --- TIE BREAKERS START HERE ---
                else if (processes[i].priority == bestPriority)
                {
                    // If multiple processes have same priority, pick earlier Arrival (FCFS)
                    if (idx == -1 || processes[i].arrivalTime < processes[idx].arrivalTime)
                    {
                        idx = i;
                    }
                    // If Arrival Times are also tied, pick lower ID
                    else if (processes[i].arrivalTime == processes[idx].arrivalTime)
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
            processes[idx].completionTime = currentTime + processes[idx].burstTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            
            currentTime = processes[idx].completionTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // CPU is idle, wait for the next process to arrive
            currentTime++;
        }
    }
}