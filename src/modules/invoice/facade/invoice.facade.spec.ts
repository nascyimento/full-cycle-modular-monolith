import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import InvoiceModel from "../repository/invoice.model";
import InvoiceItemModel from "../repository/invoice-item.model";

describe("InvoiceFacade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
      name: "John Doe",
      document: "1234567890",
      street: "Street 1",
      number: "100",
      complement: "Apt 10",
      city: "City",
      state: "ST",
      zipCode: "12345",
      items: [
        { id: "i1", name: "Item 1", price: 50 },
        { id: "i2", name: "Item 2", price: 70 },
      ],
    };

    const output = await facade.generate(input);

    expect(output.id).toBeDefined();
    expect(output.name).toBe(input.name);
    expect(output.document).toBe(input.document);
    expect(output.street).toBe(input.street);
    expect(output.number).toBe(input.number);
    expect(output.complement).toBe(input.complement);
    expect(output.city).toBe(input.city);
    expect(output.state).toBe(input.state);
    expect(output.zipCode).toBe(input.zipCode);
    expect(output.items.length).toBe(2);
    expect(output.total).toBe(120);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const gen = await facade.generate({
      name: "Jane Smith",
      document: "9876543210",
      street: "Main St",
      number: "200",
      complement: "Suite 2",
      city: "Town",
      state: "TS",
      zipCode: "54321",
      items: [
        { id: "a", name: "Product A", price: 10 },
        { id: "b", name: "Product B", price: 20 },
      ],
    });

    const found = await facade.find({ id: gen.id });

    expect(found.id).toBe(gen.id);
    expect(found.name).toBe("Jane Smith");
    expect(found.document).toBe("9876543210");
    expect(found.address.street).toBe("Main St");
    expect(found.items.length).toBe(2);
    expect(found.total).toBe(30);
    expect(found.createdAt).toBeInstanceOf(Date);
  });
});

