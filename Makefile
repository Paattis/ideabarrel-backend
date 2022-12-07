update_prod:
	pm2 stop app 
	git pull --rebase 
	npm install 
	npx tsc
	npx prisma migrate deploy 
	pm2 stop app 
	pm2 start dist/src/index.js --name 'app'
