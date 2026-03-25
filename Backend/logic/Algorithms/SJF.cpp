#include "process.h"
#include <vector>
#include <climits>

void solveSJF(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0;
    int completed = 0;
    std::vector<bool> isCompleted(n, false);

    while (completed != n)
    {
        int idx = -1;
        int minBurst = INT_MAX;

        // Find the shortest job among processes that have arrived
        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                // Inside solveSJF loop...
                if (processes[i].burstTime < minBurst)
                {
                    minBurst = processes[i].burstTime;
                    idx = i;
                }
                else if (processes[i].burstTime == minBurst)
                {
                    if (idx != -1)
                    { // Safety Check
                        if (processes[i].arrivalTime < processes[idx].arrivalTime)
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
                    else
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
            currentTime++; // No process arrived yet
        }
    }
}
