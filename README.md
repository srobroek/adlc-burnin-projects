# adlc-burnin-projects

Where the ADLC burn-in's agents build their projects. Each project lives in
`projects/<slug>/` with its own `check.sh`; `projects/_faults/` holds injected faults and is
never checked. Tools are pinned in the root `mise.toml`.

Run the check of every project changed against `origin/main`:

```sh
bash scripts/check.sh          # --list prints which projects it would check
```

CI (`burnin-gate`) runs the same script on pull requests into `main` only.
