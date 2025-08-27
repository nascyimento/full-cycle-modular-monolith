import request from "supertest";
import { createApp } from "../../api/app";
import { migration } from "../../infra/db/sequelize";

describe("Checkout API (E2E)", () => {
  const app = createApp();

  beforeAll(async () => {
    await migration.up();
  });

  afterAll(async () => {
    await migration.down();
  });

  it("should approve checkout when total >= 100", async () => {
    await request(app)
      .post("/clients")
      .send({
        id: "c1",
        name: "John Doe",
        email: "john@example.com",
        document: "1234567890",
        address: {
          street: "Street 1",
          number: "100",
          complement: "Apt 10",
          city: "City",
          state: "ST",
          zipCode: "12345",
        },
      })
      .expect(201);

    await request(app)
      .post("/products")
      .send({ id: "p1", name: "Product 1", description: "Desc 1", purchasePrice: 80, stock: 10 })
      .expect(201);
    await request(app)
      .post("/products")
      .send({ id: "p2", name: "Product 2", description: "Desc 2", purchasePrice: 30, stock: 5 })
      .expect(201);

    const res = await request(app)
      .post("/checkout/")
      .send({ clientId: "c1", products: [{ productId: "p1" }, { productId: "p2" }] })
      .expect(200);

    expect(res.body.status).toBe("approved");
    expect(res.body.total).toBe(110);
    expect(res.body.invoiceId).toBeTruthy();
  });

  it("should decline checkout when total < 100", async () => {
    await request(app)
      .post("/clients")
      .send({
        id: "c2",
        name: "Mary Jane",
        email: "mary@example.com",
        document: "9999999999",
        address: {
          street: "S2",
          number: "2",
          complement: "",
          city: "City",
          state: "ST",
          zipCode: "99999",
        },
      })
      .expect(201);

    await request(app)
      .post("/products")
      .send({ id: "p3", name: "Product 3", description: "Desc 3", purchasePrice: 50, stock: 10 })
      .expect(201);

    const res = await request(app)
      .post("/checkout/")
      .send({ clientId: "c2", products: [{ productId: "p3" }] })
      .expect(200);

    expect(res.body.status).toBe("declined");
    expect(res.body.total).toBe(50);
    expect(res.body.invoiceId).toBeNull();
  });
});

