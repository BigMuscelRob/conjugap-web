# Infrastructure

## Nginx

Config location on server: `/etc/nginx/sites-enabled/conjugap`
Source of truth: `infra/nginx/conjugap.conf`

### Rate Limit Zones
Add to `/etc/nginx/nginx.conf` inside the `http {}` block:

```nginx
limit_req_zone $binary_remote_addr zone=api_general:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=api_complete:10m rate=5r/m;
```

### Deploy changes
```bash
sudo cp infra/nginx/conjugap.conf /etc/nginx/sites-enabled/conjugap
sudo nginx -t
sudo systemctl reload nginx
```

## PM2

App runs as `conjugap` process.
```bash
pm2 status        # check status
pm2 logs conjugap # view logs
pm2 restart conjugap # restart after deploy
```
