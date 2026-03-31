#include "process.h"
#include <vector>
#include <cmath>

std::vector<GanttBlock> solveHRRN(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);
    std::vector<GanttBlock> timeline; // To store execution path

    while (completed != n)
    {
        int idx = -1;
        double maxRR = -1.0;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && !isCompleted[i])
            {
                double wait = (double)currentTime - processes[i].arrivalTime;
                double rr = (wait + processes[i].burstTime) / (double)processes[i].burstTime;

                // 1. New Highest RR found
                if (rr > maxRR)
                {
                    maxRR = rr;
                    idx = i;
                }
                // 2. Tie-breakers
                else if (std::abs(rr - maxRR) < 1e-9)
                {
                    if (idx != -1)
                    {
                        // Priority 1: Shorter Burst Time
                        if (processes[i].burstTime < processes[idx].burstTime)
                        {
                            idx = i;
                        }
                        else if (processes[i].burstTime == processes[idx].burstTime)
                        {
                            // Priority 2: Earlier Arrival
                            if (processes[i].arrivalTime < processes[idx].arrivalTime)
                            {
                                idx = i;
                            }
                            // Priority 3: String ID Comparison
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
            // --- RECORD FOR GANTT CHART ---
            int startTime = currentTime;
            int endTime = currentTime + processes[idx].burstTime;
            timeline.push_back({processes[idx].id, startTime, endTime});

            // Update stats
            processes[idx].completionTime = endTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            
            currentTime = endTime;
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // CPU is idle - either move to next arrival or increment
            // Find the next arriving process to skip ahead
            int nextArrival = -1;
            for(int i=0; i<n; i++) {
                if(!isCompleted[i]) {
                    if(nextArrival == -1 || processes[i].arrivalTime < nextArrival)
                        nextArrival = processes[i].arrivalTime;
                }
            }
            if(nextArrival != -1) currentTime = nextArrival;
            else currentTime++;
        }
    }
    return timeline;
}