const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../lib/utilities");

const router = express.Router();

const cartsFilePath = path.join(__dirname, "carts.json");
const productsFilePath = path.join(__dirname, "./products/products.json");

router.get("/", async (req, res, next) => {
  try {
    const cartDB = await readDB(cartsFilePath);
    if (cartDB.length > 0) {
      res.status(201).send(cartDB);
    } else {
      const err = {};
      err.httpStatusCode = 404;
      err.message = "The cart database is empty dood";
      next(err);
    }
  } catch (err) {
    err.httpStatueCode = 404;
    next(err);
  }
});

router.get("/:cartID", async (req, res, next) => {
  try {
    const cartDB = await readDB(cartsFilePath);
    const selectedCart = cartDB.findIndex(
      (cart) => cart._id === req.params.cartID
    );
    if (selectedCart !== -1) {
      res.status(201).send(cartDB[selectedCart]);
    } else {
      const err = {};
      err.httpStatusCode = 404;
      err.message = "There is no cart with that ID dood";
      next(err);
    }
  } catch (err) {
    err.httpStatueCode = 404;
    next(err);
  }
});

router.post(
  "/",
  [
    check("ownerId").exists().withMessage("We need your unique id"),
    check("name").exists().withMessage("You need to give your first name"),
    check("surname").exists().withMessage("You need to give your surname"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const cartDB = await readDB(cartsFilePath);
      const newCart = { ...req.body, _id: uniqid(), products: [], total: 0 };
      cartDB.push(newCart);
      await writeDB(cartsFilePath, cartDB);
      res.status(201).send(cartDB);
    }
  }
);

router.put("/:cartID/add-to-cart/:productID", async (req, res, next) => {
  try {
    const cartDB = await readDB(cartsFilePath);
    if (cartDB.length > 0) {
      const selectedCart = cartDB.findIndex(
        (cart) => cart._id === req.params.cartID
      );
      if (selectedCart !== -1) {
        cartDB[selectedCart].products.push(req.params.productID);
        await writeDB(cartsFilePath, cartDB);
        res.status(201).send(cartDB);
      } else {
        const err = {};
        err.httpStatusCode = 404;
        err.message = "There is no cart with that ID dood";
        next(err);
      }
    } else {
      const err = {};
      err.httpStatusCode = 404;
      err.message = "The cart database is empty dood";
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:cartID/remove-from-cart/:productID",
  async (req, res, next) => {
    try {
      const cartDB = await readDB(cartsFilePath);
      if (cartDB.length > 0) {
        const selectedCart = cartDB.findIndex(
          (cart) => cart._id === req.params.cartID
        );
        if (selectedCart !== -1) {
          const alteredProducts = cartDB[selectedCart].products.filter(
            (product) => product !== req.params.productID
          );
          cartDB[selectedCart].products = alteredProducts;
          await writeDB(cartsFilePath, cartDB);
          res.status(201).send(cartDB);
        } else {
          const err = {};
          err.httpStatusCode = 404;
          err.message = "There is no cart with that ID dood";
          next(err);
        }
      } else {
        const err = {};
        err.httpStatusCode = 404;
        err.message = "The cart database is empty dood";
        next(err);
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
