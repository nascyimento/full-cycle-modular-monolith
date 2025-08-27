import request from "supertest";
import { createApp } from "../../api/app";
import { migration } from "../../infra/db/sequelize";

describe("Clients API (E2E)", () => {
  const app = createApp();

  beforeAll(async () => {
    await migration.up();
  });

  afterAll(async () => {
    await migration.down();
  });

  it("should create a client", async () => {
    const res = await request(app)
      .post("/clients")
      .send({
        id: "c100",
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

    expect(res.body).toEqual({
      id: "c100",
      name: "John Doe",
      email: "john@example.com",
      document: "1234567890",
    });
  });
});

