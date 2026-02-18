# Tasks — I1.7 Cloudflare R2 Storage

- [ ] Add `django-storages==1.14.2` and `boto3==1.34.0` to `backend/requirements.txt`
- [ ] Add R2 config vars to `backend/speechef/settings/base.py`
- [ ] Add conditional `DEFAULT_FILE_STORAGE` block to `production.py`
- [ ] Add R2 env vars to `.env.example`
- [ ] Run `python manage.py check` — should pass (no R2 vars in dev)
- [ ] Create Cloudflare R2 bucket named `speechef-media` (manual step — needs Cloudflare account)
- [ ] Generate R2 API token with Object Read & Write permissions (manual step)
- [ ] Set R2 env vars in Railway production environment (manual step)
- [ ] Deploy and upload a test profile image — verify URL points to R2 domain
