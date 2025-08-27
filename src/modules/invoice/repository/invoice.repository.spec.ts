import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import InvoiceItem from "../domain/invoice-item.entity";
import Invoice from "../domain/invoice.entity";
import InvoiceRepository from "./invoice.repository";
import InvoiceModel from "./invoice.model";
import InvoiceItemModel from "./invoice-item.model";

describe("InvoiceRepository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const repository = new InvoiceRepository();

    const address = new Address(
      "Street 1",
      "100",
      "Apt 10",
      "City",
      "ST",
      "12345"
    );
    const items = [
      new InvoiceItem({ id: new Id("i1"), name: "Item 1", price: 50 }),
      new InvoiceItem({ id: new Id("i2"), name: "Item 2", price: 70 }),
    ];
    const invoice = new Invoice({
      id: new Id("inv-1"),
      name: "John Doe",
      document: "1234567890",
      address,
      items,
    });

    await repository.generate(invoice);

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: invoice.id.id },
      include: [InvoiceItemModel],
    });

    expect(invoiceDb).toBeDefined();
    expect(invoiceDb.id).toBe("inv-1");
    expect(invoiceDb.name).toBe("John Doe");
    expect(invoiceDb.document).toBe("1234567890");
    expect(invoiceDb.street).toBe("Street 1");
    expect(invoiceDb.number).toBe("100");
    expect(invoiceDb.complement).toBe("Apt 10");
    expect(invoiceDb.city).toBe("City");
    expect(invoiceDb.state).toBe("ST");
    expect(invoiceDb.zipCode).toBe("12345");
    expect(invoiceDb.items.length).toBe(2);
    expect(invoiceDb.items[0].name).toBe("Item 1");
    expect(invoiceDb.items[1].name).toBe("Item 2");
  });

  it("should find an invoice", async () => {
    await InvoiceModel.create(
      {
        id: "inv-2",
        name: "Jane Smith",
        document: "9876543210",
        street: "Main St",
        number: "200",
        complement: "Suite 2",
        city: "Town",
        state: "TS",
        zipCode: "54321",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "a",
            invoiceId: "inv-2",
            name: "Product A",
            price: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "b",
            invoiceId: "inv-2",
            name: "Product B",
            price: 20,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      { include: [InvoiceItemModel] }
    );

    const repository = new InvoiceRepository();
    const invoice = await repository.find("inv-2");

    expect(invoice.id.id).toBe("inv-2");
    expect(invoice.name).toBe("Jane Smith");
    expect(invoice.document).toBe("9876543210");
    expect(invoice.address.street).toBe("Main St");
    expect(invoice.address.number).toBe("200");
    expect(invoice.address.complement).toBe("Suite 2");
    expect(invoice.address.city).toBe("Town");
    expect(invoice.address.state).toBe("TS");
    expect(invoice.address.zipCode).toBe("54321");
    expect(invoice.items.length).toBe(2);
    expect(invoice.items[0].name).toBe("Product A");
    expect(invoice.items[1].name).toBe("Product B");
    expect(invoice.total).toBe(30);
  });
});

