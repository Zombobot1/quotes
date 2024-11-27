import { faker } from "@faker-js/faker";
import PocketBase from "pocketbase";

// Configure connection to your PocketBase instance
const pb = new PocketBase("http://127.0.0.1:8090"); // Adjust the URL if necessary

// Function to generate and seed quotes
async function seedQuotes() {
  const quotesCollection = pb.collection("quotes"); // Ensure this collection exists in PocketBase
  const numQuotes = 100; // Number of quotes to create

  // List of possible statuses for quotes
  const statuses = ["ACCEPTED", "DRAFT", "SENT", "REJECTED", "EXPIRED"];

  // Loop to generate and insert quotes
  for (let i = 0; i < numQuotes; i++) {
    // Generate a random number of items in each quote (between 1 and 5 products)
    const numItems = faker.number.int({ min: 1, max: 5 }); // Use faker.number.int() for generating random numbers
    let items = [];
    let subtotal = 0;

    // Create products for this quote
    for (let j = 0; j < numItems; j++) {
      const quantity = faker.number.int({ min: 1, max: 10 }); // Product quantity
      const price = parseFloat(faker.commerce.price(10, 500, 2)); // Product price
      const itemSubtotal = quantity * price; // Calculate the subtotal for each product

      items.push({
        product_name: faker.commerce.productName(), // Product name
        quantity: quantity,
        price: price,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal; // Add this item's subtotal to the total quote subtotal
    }

    // Calculate tax (e.g., 15% of the subtotal)
    const totalTax = subtotal * 0.15;

    // Calculate the total (subtotal + total_tax)
    const total = subtotal + totalTax;

    // Generate a random valid_until date (e.g., within the next 30 days)
    const validUntil = faker.date.soon(30);

    // Generate a rich text description for the quote
    const descripcion = faker.lorem.paragraphs(3); // 3 paragraphs of text

    // Construct the full quote object
    const quote = {
      date: faker.date.past(), // Random past date for the quote
      customer_info: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
      },
      status: faker.helpers.arrayElement(statuses), // Random status for the quote
      items: items, // Array of products in the quote
      subtotal: subtotal, // Total amount of the products
      total_tax: totalTax, // Calculated tax for the quote
      total: total, // Final total amount (subtotal + total_tax)
      valid_until: validUntil, // Expiry date for the quote
      descripcion: descripcion, // Rich text description
    };

    try {
      // Insert the quote into the database
      await quotesCollection.create(quote);
      console.log(`Quote ${i + 1} created`);
    } catch (error) {
      console.error("Error creating quote:", error);
    }
  }

  console.log(`Successfully created ${numQuotes} quotes.`);
}

// Run the function to seed the quotes
seedQuotes();
