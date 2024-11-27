import { faker } from "@faker-js/faker";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

async function seedProducts() {
  const productsCollection = pb.collection("products");
  const numProducts = 100;

  for (let i = 0; i < numProducts; i++) {
    const product = {
      title: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price(5, 500, 2)),
      description: faker.commerce.productDescription(),
    };

    try {
      await productsCollection.create(product);
      console.log(`Product ${i + 1} created`);
    } catch (error) {
      console.error("Error", error);
    }
  }

  console.log(`Created ${numProducts} products.`);
}

seedProducts();
