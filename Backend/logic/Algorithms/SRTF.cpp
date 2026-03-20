#include "process.h"
#include <vector>

void solveSRTF(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0, completed = 0;
    std::vector<int> remainingTime(n);
    for (int i = 0; i < n; i++)
        remainingTime[i] = processes[i].burstTime;

    while (completed != n)
    {
        int idx = -1;
        int minRemaining = INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0)
            {
                // Condition 1: We found a strictly shorter remaining time
                if (remainingTime[i] < minRemaining)
                {
                    minRemaining = remainingTime[i];
                    idx = i;
                }
                // Condition 2: Tie-breaker if remaining times are EQUAL
                else if (remainingTime[i] == minRemaining)
                {
                    if (idx == -1)
                    {
                        idx = i;
                    }
                    else if (processes[i].arrivalTime < processes[idx].arrivalTime)
                    {
                        idx = i;
                    }
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
            // Cpu IdealTime
            currentTime++;
        }
    }
}