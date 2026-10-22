-- how.nixfred.com request analytics (Workers Analytics Engine, dataset how_nixfred_requests).
-- Written by functions/_middleware.js for /mcp and /api/* only.
-- Columns: index1 = route, blob1 = route, blob2 = method, blob3 = status class, double1 = status, double2 = latency ms.
-- Nothing else is stored: no IP, no question text, no identifiers.
-- Run with: curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/analytics_engine/sql -H "Authorization: Bearer $TOKEN" --data-binary @-

-- Requests, errors and latency per route, last 24 hours
SELECT blob1 AS route,
       SUM(_sample_interval) AS requests,
       SUM(IF(double1 >= 500, _sample_interval, 0)) AS errors_5xx,
       SUM(IF(double1 = 429, _sample_interval, 0)) AS rate_limited,
       quantileWeighted(0.5)(double2, _sample_interval) AS p50_ms,
       quantileWeighted(0.95)(double2, _sample_interval) AS p95_ms
FROM how_nixfred_requests
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY route
ORDER BY requests DESC;

-- Daily volume per route, last 30 days
SELECT toStartOfDay(timestamp) AS day, blob1 AS route, SUM(_sample_interval) AS requests
FROM how_nixfred_requests
WHERE timestamp > NOW() - INTERVAL '30' DAY
GROUP BY day, route
ORDER BY day, route;

-- Status mix for the MCP endpoint, last 7 days
SELECT double1 AS status, blob2 AS method, SUM(_sample_interval) AS requests
FROM how_nixfred_requests
WHERE index1 = 'mcp' AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY status, method
ORDER BY requests DESC;
