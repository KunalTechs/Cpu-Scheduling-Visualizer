#pragma once
#include <drogon/HttpController.h>
#include <vector>
#include "process.h"

using namespace drogon;

class Simulator : public HttpController<Simulator>
{
public:
  METHOD_LIST_BEGIN
  // 1. Matches React: http://localhost:8081/api/simulate
  ADD_METHOD_TO(Simulator::runSimulation, "/api/simulate", Post, Options, "JwtCookieFilter");
  ADD_METHOD_TO(Simulator::compareAll, "/api/compare", Post, Options, "JwtCookieFilter");
  METHOD_LIST_END

  void runSimulation(const HttpRequestPtr &req,
                     std::function<void(const HttpResponsePtr &)> &&callback);
                     void compareAll(const HttpRequestPtr &req, 
                     std::function<void(const HttpResponsePtr &)> &&callback);

private:
//helper for switch algo compare
 Json::Value runSpecificAlgo(const std::string &algoName, const Json::Value &processes, int quantum, bool isHighPriorityHigher);

};