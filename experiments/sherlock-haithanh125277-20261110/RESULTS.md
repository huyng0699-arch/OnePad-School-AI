# Sherlock scan result: `haithanh125277`

- Date: 2026-11-10 (Asia/Ho_Chi_Minh)
- Repository: [sherlock-project/sherlock](https://github.com/sherlock-project/sherlock)
- Version: Sherlock v0.16.2; source commit `c588d7c8b476df9f9c84912a05d1430fb8cdcdae`
- Environment: GitHub Actions, Python 3.12
- [Actual completed GitHub Actions run](https://github.com/huyng0699-arch/OnePad-School-AI/actions/runs/42725548452)
- [Raw logs and text results (artifact, expires after 2 days)](https://github.com/huyng0699-arch/OnePad-School-AI/actions/runs/42725548452/artifacts/13723140545)

## Command
```bash
git clone --depth 1 https://github.com/sherlock-project/sherlock.git sherlock-upstream
python -m pip install ./sherlock-upstream
sherlock haithanh125277 --timeout 12 --print-found --no-color --txt --folderoutput results
```

## Raw result

```text
[*] Checking username haithanh125277 on:
[+] Trakt: https://www.trakt.tv/users/haithanh125277
[*] Search completed with 1 results
Total Websites Username Detected On : 1
```

## Interpretation

**Sherlock returned 1 detection, on Trakt.** This is an automated match, not independently validated evidence that a user profile exists. An attempt to independently access this URL returned a tool access error, so its existence remains **unverified**. A direct web search did not establish a verified profile.

This username also has **zero Sherlock detections on all other platforms tested**, but this does **not** establish that the username is unused elsewhere or that no other accounts exist.

**Caution:** Trakt was detected for every variant of a different user tested in a prior run; this pattern raises the possibility of systematic false positives in this provider. Do not infer a person's identity from a username-only match.

This test uses only publicly accessible username checks and does not assert any relationship to a real person's identity.
