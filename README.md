ngrok authtoken <api key>
ngrok http 3000  --response-header-add="Access-Control-Allow-Origin:*" --host-header=rewrite



curl --location 'localhost:3000/api/v1/bond/transfer' \
--header 'Content-Type: application/json' \
--data '{
    "address":"0x5bEFf8b4Ee55642D8c4ce0E25d91407C8D6bAd28",
    "amount":10,
    "contract":"0x6560112FE83cD1EDb5A54c458D5a6D92e1FD3070"
}'