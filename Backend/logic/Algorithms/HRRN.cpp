#include "process.h"
#include <vector>
#include <cmath>

std::vector<GanttBlock> solveHRRN(std::vector<Process> &processes)
{
    int n = processes.size();
    int currentTime = 0, completed = 0;
    std::vector<bool> isCompleted(n, false);
    std::vector<GanttBlock> timeline;

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

                if (rr > maxRR) {
                    maxRR = rr;
                    idx = i;
                }
                else if (std::abs(rr - maxRR) < 1e-9) {
                    // Tie-breakers: Burst Time -> Arrival -> ID
                    if (idx != -1) {
                        if (processes[i].burstTime < processes[idx].burstTime) idx = i;
                        else if (processes[i].burstTime == processes[idx].burstTime) {
                            if (processes[i].arrivalTime < processes[idx].arrivalTime) idx = i;
                            else if (processes[i].arrivalTime == processes[idx].arrivalTime) {
                                if (processes[i].id < processes[idx].id) idx = i;
                            }
                        }
                    }
                }
            }
        }

        if (idx != -1)
        {
            timeline.push_back({processes[idx].id, currentTime, currentTime + processes[idx].burstTime});

            currentTime += processes[idx].burstTime;
            processes[idx].completionTime = currentTime;
            processes[idx].turnaroundTime = processes[idx].completionTime - processes[idx].arrivalTime;
            processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
            
            isCompleted[idx] = true;
            completed++;
        }
        else
        {
            // --- IDLE LOGIC ---
            int nextArrival = -1;
            for(int i=0; i<n; i++) {
                if(!isCompleted[i]) {
                    if(nextArrival == -1 || processes[i].arrivalTime < nextArrival)
                        nextArrival = processes[i].arrivalTime;
                }
            }

            if(nextArrival != -1) {
                // Record the IDLE gap from currentTime to the next process arrival
                timeline.push_back({"IDLE", currentTime, nextArrival});
                currentTime = nextArrival;
            } else {
                currentTime++;
            }
        }
    }
    return timeline;
}