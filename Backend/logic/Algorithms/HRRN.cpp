#include "process.h"
#include <vector>

void solveHRRN(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);

    while (completed != n)
    {
        int idx = -1;
        double maxRR = -1.0;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                double wait = currentTime - processes[i].arrivalTime;
                double rr = (wait + processes[i].burstTime) / processes[i].burstTime;

                // 1. New Highest RR found
                if (rr > maxRR)
                {
                    maxRR = rr;
                    idx = i;
                }
                // 2. Tie-breaker: If RR is exactly the same
                else if (std::abs(rr - maxRR) < 1e-9)
                { // Use a small epsilon for double comparison
                    if (idx != -1)
                    {
                        if (processes[i].burstTime < processes[idx].burstTime)
                        {
                            idx = i;
                        }
                        else if (processes[i].burstTime == processes[idx].burstTime)
                        {
                            // Tie-breaker: arrivalTime
                            if (processes[i].arrivalTime < processes[idx].arrivalTime)
                            {
                                idx = i;
                            }
                            // final Tie-breaker: If they arrived at the exact same time, pick the lower ID
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
            // Cpu IdealTime
            currentTime++;
        }
    }
}