import request from "supertest";
import { createApp } from "../../api/app";
import { migration } from "../../infra/db/sequelize";

describe("Products API (E2E)", () => {
  const app = createApp();

  beforeAll(async () => {
    await migration.up();
  });

  afterAll(async () => {
    await migration.down();
  });

  it("should create a product in product-adm", async () => {
    const res = await request(app)
      .post("/products")
      .send({
        id: "p100",
        name: "Product 100",
        description: "Desc 100",
        purchasePrice: 80,
        stock: 10,
      })
      .expect(201);

    expect(res.body).toEqual({
      id: "p100",
      name: "Product 100",
      description: "Desc 100",
      purchasePrice: 80,
      stock: 10,
    });
  });
});

