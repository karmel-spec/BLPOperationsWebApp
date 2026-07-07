# Hermes Agent Console Bridge

This Agent Console local API can route selected BLP agents to their local Hermes API servers. The first wired agent is Arnold.

## Arnold local runtime

Arnold's Hermes profile is expected to run a private API server on localhost:

```env
API_SERVER_ENABLED=true
API_SERVER_HOST=127.0.0.1
API_SERVER_PORT=8643
API_SERVER_MODEL_NAME=arnold
API_SERVER_KEY=<stored outside git>
```

Do not expose this port directly to the public internet. The browser talks to the BLP local API on `127.0.0.1:8787`; the local API talks to Hermes.

## Local API environment

The local API reads agent runtime configuration from `data/agent-runtime.json` when present, otherwise from `data/agent-runtime.example.json`.

Create a local-only config if needed:

```bash
cp data/agent-runtime.example.json data/agent-runtime.json
```

Set agent API keys before starting the local API. For Arnold only:

```bash
export HERMES_ARNOLD_API_SERVER_KEY="$(security find-generic-password -s blp-agent-console -a arnold:api_server_key -w)"
export BLP_CONSOLE_API_PORT=8787
node scripts/local-api.mjs
```

For every currently prepared local Hermes profile:

```bash
for agent in arnold ivory melody eddy addie brandy collin desie lee marcus rajeesh sharie yolanda; do
  env_name="HERMES_$(printf '%s' "$agent" | tr '[:lower:]' '[:upper:]')_API_SERVER_KEY"
  export "$env_name=$(security find-generic-password -s blp-agent-console -a "$agent:api_server_key" -w)"
done
export BLP_CONSOLE_API_PORT=8787
node scripts/local-api.mjs
```

`data/agent-runtime.json` and raw API keys should not be committed.

## Smoke tests

Check local API health:

```bash
curl http://127.0.0.1:8787/api/health
```

Check Arnold through the local bridge:

```bash
curl http://127.0.0.1:8787/api/agents/arnold/health
```

Submit an Arnold run:

```bash
curl -X POST http://127.0.0.1:8787/api/agents/arnold/runs \
  -H "Content-Type: application/json" \
  -d '{"input":"Arnold, confirm you are connected to the BLP Agent Console."}'
```

The response should include a Hermes `run_id` and an audit record.

## Safety boundary

Arnold may draft sales/customer communications, but customer-facing sends remain human-approved only. The first live bridge supports chat/task dispatch; cron management, training writes, and direct customer sending should be added in later gated phases.
