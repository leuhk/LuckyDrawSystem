# Lucky Draw System

## Objective

To create a new campagin with prizes that have different probabilites for end users to draw.

## Prerequisites

[node](https://nodejs.org/en/) v16.15.0 or newer.

# API documentation

To view detail documentation on API endpoint. [Click here to view swagger](https://leuhk.github.io/LuckyDrawSystem/)

# Get Started

## Installation

Download dependencies

```
npm install
```

Run development server

```
#please be reminded to add .env file before running the command.
npm run dev
```

Run Production server

```
npm run build
npm run start
```

Run linter

```
npm run lint
```

Run Test cases

```
npm run test
```

Alternatively, you can use docker compose to run

```
docker-compose up
```

# Demo

## 1. Generate a new campagin

please note

- start & end must be in the format of yyyy-mm-dd
- end date must be after the start date

```
curl --location --request POST 'http://localhost:8080/campagin/create' \
--header 'Content-Type: application/json' \
--data-raw '{
    "start":"2022-03-01",
    "end":"2023-01-02",
    "name":"new campagin test"
}'
```

Example Response

```
{
    "campagin_number": 176949
}
```

## 2. Add prizes to campagin

please note

- probabilities of the prize must add up to 100%
- must have only one default prize (Usually set to the "No Price" Prize. This will prevent the fall back scenario. e.g. Prize out of stocks.

```
curl --location --request PATCH 'http://localhost:8080/campagin/add-prizes' \
--header 'Content-Type: application/json' \
--data-raw '{
    "campaginNumber":176949,
    "prize":[
            {
        "name":"$5 Cash Coupon",
        "unlimited":false,
        "dailyQuota":100,
        "totalQuota":500,
        "probability":0.5,
        "default":false

            },
                        {
        "name":"$2 Cash Coupon",
        "unlimited":false,
        "dailyQuota":500,
        "totalQuota":5000,
        "probability":2,
        "default":false
            },
                                    {
        "name":"Buy 1 get 1 free coupon",
        "unlimited":true,
        "dailyQuota":0,
        "totalQuota":0,
        "probability":80,
        "default":false
            },
                                                {
        "name":"No Prize",
        "unlimited":true,
        "dailyQuota":0,
        "totalQuota":0,
        "probability":17.5,
        "default":true
            }

    ]

}'
```

Example Response

```
{
    "msg": "prize added successfully"
}
```

## 3. Lucky Draw from the campagin

please note

- mobile must be 8 digits only
- user will be rejected if already draw from the campagin on the same day
- If a prize is out of quota or reach daily limit, the draw will fall back to the default prize set earlier. E.g. "No Prize"

```
curl --location --request POST 'http://localhost:8080/campagin/draw' \
--header 'Content-Type: application/json' \
--data-raw '{
    "mobile":"21383296",
    "campaginNumber":176949
}'
```

Example Response

```
{
    "drawing_result": "Buy 1 get 1 free coupon"
}
```
