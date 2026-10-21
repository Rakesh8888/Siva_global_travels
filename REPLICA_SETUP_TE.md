# Replica Skill — Siva Global Travels

## Added source
The official Replica Skill pack is linked into this repository as a Git submodule at `tools/replica-skill`.

- Official source: https://github.com/Jakeschincariol/replica-skill
- Pinned upstream commit: `77c9436fb3d18c3d58169efb8caf4fe906b0dc51`
- License: MIT (see the upstream `LICENSE` file)
- API keys: **not required for Replica itself**.
- Runtime: this is a development skill pack, not a website API or a feature that automatically runs inside the deployed Siva Global Travels website. To use the slash-command skills, use Claude Code or another compatible skill environment. Some integrations that you choose during a project (for example, a database, email, or payments provider) may separately require their own credentials.

## Get the files
After cloning this repository, initialize the linked source:

```bash
git submodule update --init --recursive
```

Then install the skill folders locally for Claude Code:

```bash
mkdir -p .claude/skills
cp -R tools/replica-skill/replica-* .claude/skills/
```

Restart/reopen the project in Claude Code. The upstream pack documents these skills: recon, architect, design, build, backend, test, diff, entrepreneur, brand, launch, and deploy. Run them in sequence as appropriate; they do not deploy or modify the live site merely by being added to this repository.

## Safety
Use Replica to recreate functionality and UX patterns with newly written code and your own branding/assets. Do not copy another site's source code, proprietary assets, text, trademarks, or private APIs. Review all generated changes before deploying.
