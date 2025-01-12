# use node.js 12
source ~/.nvm/nvm.sh
nvm use 12

npm i
npm run build
rm -r -f "../service/public"
mkdir "../service/public"
cp -r "build/." "../service/public"
