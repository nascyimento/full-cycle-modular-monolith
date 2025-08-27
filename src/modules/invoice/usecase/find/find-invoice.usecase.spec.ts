import Id from "../../../@shared/domain/value-object/id.value-object";
import Address from "../../../@shared/domain/value-object/address";
import InvoiceItem from "../../domain/invoice-item.entity";
import Invoice from "../../domain/invoice.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";

const address = new Address(
  "Main St",
  "123",
  "Apt 1",
  "Town",
  "TS",
  "54321"
);

const items = [
  new InvoiceItem({ id: new Id("a"), name: "Product A", price: 10 }),
  new InvoiceItem({ id: new Id("b"), name: "Product B", price: 20 }),
];

const invoice = new Invoice({
  id: new Id("inv-1"),
  name: "Jane Smith",
  document: "9876543210",
  address,
  items,
});

const MockRepository = () => {
  return {
    find: jest.fn().mockReturnValue(Promise.resolve(invoice)),
    generate: jest.fn(),
  };
};

describe("Find invoice usecase unit test", () => {
  it("should find an invoice", async () => {
    const repository = MockRepository();
    const usecase = new FindInvoiceUseCase(repository as any);

    const result = await usecase.execute({ id: "inv-1" });

    expect(repository.find).toHaveBeenCalledWith("inv-1");
    expect(result.id).toBe("inv-1");
    expect(result.name).toBe("Jane Smith");
    expect(result.document).toBe("9876543210");
    expect(result.address.street).toBe("Main St");
    expect(result.address.number).toBe("123");
    expect(result.address.complement).toBe("Apt 1");
    expect(result.address.city).toBe("Town");
    expect(result.address.state).toBe("TS");
    expect(result.address.zipCode).toBe("54321");
    expect(result.items.length).toBe(2);
    expect(result.items[0].id).toBe("a");
    expect(result.items[1].id).toBe("b");
    expect(result.total).toBe(30);
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});

