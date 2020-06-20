const errors = require("restify-errors");
const rjwt = require('restify-jwt-community');
const request = require('request');
const config = require('../config');
const Customer = require("../models/Customer");

module.exports = (server) => {
  server.get("/customers", async (req, res, next) => {
    try {
      const customers = await Customer.find({});
      res.send(customers);
      next();
    } catch (err) {
      return next(new errors.InvalidContentError(err));
    }
  });

  server.get("/customers/:id", async (req, res, next) => {
    try {
      const customer = await Customer.findById(req.params.id);
      res.send(customer);
      next();
    } catch (err) {
      return next(
        new errors.ResourceNotFoundError(
          `There is no customer with id ${req.params.id}`
        )
      );
    }
  });

  // server.post("/customers", rjwt({secret: config.JWT_SECRET}), async (req, res, next) => {
  // to auth only specif routes use the above format and remove from index.js line 11
  server.post("/customers", async (req, res, next) => {
    if (!req.is("application/json")) {
      return next(new errors.InvalidContentError('Expects "application/json"'));
    }

    const { name, email, balance } = req.body;

    const customer = new Customer({
      name,
      email,
      balance,
    });
    try {
      const newCustomer = await customer.save();
      res.send(201);
      next();
    } catch (err) {
      return next(new errors.InternalError(err.message));
    }
  });

  server.put("/customers/:id", async (req, res, next) => {
    if (!req.is("application/json")) {
      return next(new errors.InvalidContentError('Expects "application/json"'));
    }
    try {
      const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id },
        req.body
      );
      res.send(200);
      next();
    } catch (err) {
      return next(
        new errors.ResourceNotFoundError(
          `There is no customer with id ${req.params.id}`
        )
      );
    }
  });

  server.del("/customers/:id", async (req, res, next) => {
    try {
      const customer = await Customer.findOneAndRemove({ _id: req.params.id });
      res.send(204);
      next();
    } catch (err) {
      return next(
        new errors.ResourceNotFoundError(
          `There is no customer with id ${req.params.id}`
        )
      );
    }
  });

  server.get('/api', (req, res, next) => {
    request('http://dummy.restapiexample.com/api/v1/employees', {json: true}, (err, resp, body) => {
        if (err) throw err;
        res.json(body);
    });
  });

  server.get("/api/post2", (req, res) => {
    var data = {
        IATA_OrderRetrieveRQ: {
          Request: {
            OrderFilterCriteria: {
              Order: {
                OrderID: "NWE9GB"
              }
            }
          }
        }
    };
    var headers = {
      'Username': "OTI195",
      'Password': "Indigo@2019",
      'BaseUrl': "https://indigo.goomo.team",
      'Accept': 'application/json',
      'Content-Type':'application/json'
    };
    request.post(
      {
        url:
          "http://localhost:8090/indigo-connector-service/order-retrieve/V1.0",
        json: data,
        headers: headers
      },
      (err, resp, body) => {
        if (err) throw err;
        res.json(body);
      }
    );
  });
};
