import request from "supertest";
import { createApp } from "../../api/app";
import { migration } from "../../infra/db/sequelize";
// This spec interacts only via HTTP

describe("Invoice API (E2E)", () => {
  const app = createApp();

  beforeAll(async () => {
    await migration.up();
  });

  afterAll(async () => {
    await migration.down();
  });

  it("should return an invoice by id", async () => {
    await request(app)
      .post("/clients")
      .send({
        id: "c10",
        name: "Alice",
        email: "alice@example.com",
        document: "11122233344",
        address: {
          street: "Main",
          number: "1",
          complement: "",
          city: "Town",
          state: "TS",
          zipCode: "00000",
        },
      })
      .expect(201);

    await request(app)
      .post("/products")
      .send({ id: "x1", name: "X1", description: "DX1", purchasePrice: 120, stock: 5 })
      .expect(201);

    const checkoutRes = await request(app)
      .post("/checkout/")
      .send({ clientId: "c10", products: [{ productId: "x1" }] })
      .expect(200);

    expect(checkoutRes.body.invoiceId).toBeTruthy();
    const invoiceId = checkoutRes.body.invoiceId;

    const res = await request(app).get(`/invoice/${invoiceId}`).expect(200);
    expect(res.body.id).toBe(invoiceId);
    expect(res.body.name).toBe("Alice");
    expect(res.body.document).toBe("11122233344");
    expect(res.body.address).toEqual({ street: "Main", number: "1", complement: "", city: "Town", state: "TS", zipCode: "00000" });
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0]).toEqual({ id: "x1", name: "X1", price: 120 });
    expect(res.body.total).toBe(120);
    expect(res.body.createdAt).toBeTruthy();
  });
});
