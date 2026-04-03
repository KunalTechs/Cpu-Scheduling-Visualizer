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
  METHOD_LIST_END

  void runSimulation(const HttpRequestPtr &req,
                     std::function<void(const HttpResponsePtr &)> &&callback);
};