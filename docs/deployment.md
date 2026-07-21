# Deployment

## Canonical repository

- Public repository: `https://github.com/Doppp/explorables`
- SSH remote: `git@github.com:Doppp/explorables.git`
- Default/deployment branch: `master`

The repository already existed with one licence commit. The specification was
attached without rewriting that history. Never force-push or create a `main`
deployment branch.

## GitHub Pages

`.github/workflows/pages.yml` installs the pinned Node 24 and pnpm 11 versions
from the lockfile, validates and tests the repository, builds `apps/site`,
uploads its static output, and deploys through the `github-pages` environment.
It runs on pushes to `master` and manual dispatch.

Repository Pages settings must use GitHub Actions as the build type. The REST
equivalent after the workflow exists is:

```bash
gh api --method POST repos/Doppp/explorables/pages \
  -f build_type=workflow
```

If Pages already exists with a different source, use `PUT` instead. The
implementation run records the actual API result in
`docs/implementation-status.md`.

## Custom domain

The static artifact includes `CNAME` containing `explorables.ai`, and the Pages
API/settings must separately set the same domain:

```bash
gh api --method PUT repos/Doppp/explorables/pages \
  -f cname=explorables.ai \
  -F https_enforced=true
```

HTTPS enforcement can succeed only after GitHub has issued the certificate and
DNS is valid.

## External DNS records

At the authoritative DNS provider for `explorables.ai`, configure the apex with
all four current GitHub Pages IPv4 records:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

IPv6 may additionally use:

```text
@  AAAA  2606:50c0:8000::153
@  AAAA  2606:50c0:8001::153
@  AAAA  2606:50c0:8002::153
@  AAAA  2606:50c0:8003::153
```

For the recommended `www` redirect, add:

```text
www  CNAME  Doppp.github.io.
```

Do not add wildcard records. Domain ownership should also be verified under the
GitHub account or organisation to reduce takeover risk.

Verify propagation with:

```bash
dig explorables.ai A +noall +answer
dig explorables.ai AAAA +noall +answer
dig www.explorables.ai CNAME +noall +answer
```

DNS may take up to 24 hours to propagate. After it resolves, re-enable HTTPS in
Pages settings if certificate issuance did not complete automatically.

## References

- [Publishing with a custom GitHub Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Managing a GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Claude Code Desktop preview servers](https://code.claude.com/docs/en/desktop#configure-preview-servers)
