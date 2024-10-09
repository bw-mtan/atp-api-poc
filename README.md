ngrok authtoken <api key>
ngrok http 3000  --response-header-add="Access-Control-Allow-Origin:*" --host-header=rewrite
