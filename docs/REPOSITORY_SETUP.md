# Canonical repository setup

The implementation agent is authorised to create:

```text
git@github.com:Doppp/explorables.git
```

Requirements:

- Public repository
- Default branch: `master`
- SSH remote: `git@github.com:Doppp/explorables.git`
- No force-pushes
- Preserve existing history if the repository already exists

Suggested preflight:

```bash
gh auth status
gh repo view Doppp/explorables
```

If the repository does not exist:

```bash
git init -b master
git add .
git commit -m "Add explorables product specification"
gh repo create Doppp/explorables --public --source=. --remote=origin --push
git remote set-url origin git@github.com:Doppp/explorables.git
```

If the repository already exists, inspect and use it rather than recreating it.
