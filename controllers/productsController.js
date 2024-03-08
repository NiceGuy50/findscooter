import express from "express";
const router = express.Router();
import isAuth from "../services/isAuth.js";
import Product from "../models/productModel.js";
import geodist from "geodist";

router.post("/getAllScooters", (req, res) => {
  const { lat, long } = req.body;
  console.log(lat);
  console.log(long);

  Product.findAll()
    .then(async results => {
      let allProducts = [];
      results.foreach(async element => {
        const dist = await geodist(
          { lat: lat, lon: long },
          { lat: element.currentLocationLat, lon: element.currentLocationLong }
        );

        const product = {
          id: element.id,
          model: element.productModel,
          battery: element.battery,
          dist: dist,
        };
        allProducts.push(product);
      });

      return res.status(200).json({ message: allProducts });
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

router.post("/addProduct", (req, res) => {
  const { productType, currentLocationLat, currentLocationLong, productModel } =
    req.body;

  Product.create({
    productType: productType,
    currentLocationLat: currentLocationLat,
    currentLocationLong: currentLocationLong,
    productModel: productModel,
    isAvailable: true,
    battery: 100,
  })
    .then(product_added => {
      return res.status(200).json({ message: product_added });
    })
    .catch(error => {
      return res.status(500).json({ message: error });
    });
});

export default router;
