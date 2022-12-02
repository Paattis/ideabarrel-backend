deploy_prod:
	pm2 stop app && git pull --rebase && npm install && npx prisma migrate deploy && npm run daemon

