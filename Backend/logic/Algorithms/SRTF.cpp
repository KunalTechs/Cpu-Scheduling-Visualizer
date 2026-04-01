#include "process.h"
#include <vector>
#include <climits> 

std::vector<GanttBlock> solveSRTF(std::vector<Process> &processes)
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
        int minRemaining = INT_MAX;

        for (int i = 0; i < n; i++)
        {
            if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0)
            {
                if (remainingTime[i] < minRemaining)
                {
                    minRemaining = remainingTime[i];
                    idx = i;
                }
                else if (remainingTime[i] == minRemaining)
                {
                    if (idx != -1) {
                        if (processes[i].arrivalTime < processes[idx].arrivalTime) {
                            idx = i;
                        } else if (processes[i].arrivalTime == processes[idx].arrivalTime) {
                            if (processes[i].id < processes[idx].id) {
                                idx = i;
                            }
                        }
                    }
                }
            }
        }

        if (idx != -1)
        {
            // --- GANTT CHART BLOCK MERGING ---
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
            // --- UPDATED IDLE LOGIC ---
            int nextArrival = INT_MAX;
            for(int i=0; i<n; i++) {
                if(remainingTime[i] > 0 && processes[i].arrivalTime > currentTime) {
                    if(processes[i].arrivalTime < nextArrival) nextArrival = processes[i].arrivalTime;
                }
            }

            if(nextArrival != INT_MAX) {
                // Record IDLE block for the timeline
                if (!timeline.empty() && timeline.back().id == "IDLE" && timeline.back().end == currentTime) {
                    timeline.back().end = nextArrival;
                } else {
                    timeline.push_back({"IDLE", currentTime, nextArrival});
                }
                currentTime = nextArrival;
            } else {
                currentTime++;
            }
        }
    }
    return timeline;
}