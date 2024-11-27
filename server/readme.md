# Meisterwerk Invoicing API Sample
Sample project to provide a mock API for frontend development purposes.

# Requeriments
- go 1.22+
- node v20+

## Installation
- Clone this repo
- Make sure you have go 1.22+ installed locally
- Setup env `cp .env.default .env`
- Run process `go run main.go serve`


If everything is ok you should see:

```
2024/11/05 15:33:41 Server started at http://127.0.0.1:8090
├─ REST API: http://127.0.0.1:8090/api/
└─ Admin UI: http://127.0.0.1:8090/_/
```

## DB seed
In order to have data to test you can run our db seeder
- Run the service with `go run main.go serve` (if it is not running)
- Make sure you have node 20+ installed
- `cd seeder`
- Run `npm install`
- Run `node seedProducts.js`
- Run `node seedQuotes.js`

## API Resources

### Products
#### Endpoints
- GET /api/collections/products/records
- GET /api/collections/products/records/:id
- POST /api/collections/products/records
- PATCH /api/collections/products/records/:id
- DELETE /api/collections/products/records/:id
#### Sample resource response
```json
{
  "attributes": null,
  "collectionId": "t4wz0elig5i32iq",
  "collectionName": "products",
  "created": "2024-11-05 19:53:27.795Z",
  "description": "Discover the mixed new Table with an exciting mix of Wooden ingredients",
  "id": "wiy85tyuenvms13",
  "in_stock": false,
  "price": 455.49,
  "title": "",
  "updated": "2024-11-05 19:53:27.795Z"
}
```
Info about filtering, pagination, and sorting: https://pocketbase.io/docs/api-records/#crud-actions

### Quotes
#### Endpoints
- GET /api/collections/quotes/records
- GET /api/collections/quotes/records/:id
- POST /api/collections/quotes/records
- PATCH /api/collections/quotes/records/:id
- DELETE /api/collections/quotes/records/:id
#### Sample resource response

```json
{
  "collectionId": "y66tekbxndznk5u",
  "collectionName": "quotes",
  "created": "2024-11-05 19:53:31.576Z",
  "customer_info": {
    "address": "85712 Ruben Run",
    "city": "Murrieta",
    "country": "Democratic People's Republic of Korea",
    "email": "Cristal.Murazik0@yahoo.com",
    "name": "Byron Hyatt",
    "phone": "787.478.2905"
  },
  "description": "",
  "id": "zi9g1uple1k78ci",
  "items": [
    {
      "price": 53.29,
      "product_name": "Fantastic Plastic Soap",
      "quantity": 1,
      "subtotal": 53.29
    },
    {
      "price": 985.39,
      "product_name": "Refined Wooden Table",
      "quantity": 9,
      "subtotal": 8868.51
    }
  ],
  "status": "ACCEPTED",
  "subtotal": 8921.80,
  "total": 10260.07,
  "total_tax": 1338.27,
  "updated": "2024-11-05 19:53:31.576Z",
  "valid_until": "2024-11-06 14:08:22.156Z"
}
```
  Info about filtering, pagination, and sorting: https://pocketbase.io/docs/api-records/#crud-actions