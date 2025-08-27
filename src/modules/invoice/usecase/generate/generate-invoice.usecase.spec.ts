import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => {
  return {
    generate: jest.fn(),
    find: jest.fn(),
  };
};

describe("Generate invoice usecase unit test", () => {
  it("should generate an invoice", async () => {
    const invoiceRepository = MockRepository();
    const usecase = new GenerateInvoiceUseCase(invoiceRepository as any);

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

    const result = await usecase.execute(input);

    expect(invoiceRepository.generate).toHaveBeenCalled();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.document).toBe(input.document);
    expect(result.street).toBe(input.street);
    expect(result.number).toBe(input.number);
    expect(result.complement).toBe(input.complement);
    expect(result.city).toBe(input.city);
    expect(result.state).toBe(input.state);
    expect(result.zipCode).toBe(input.zipCode);
    expect(result.items.length).toBe(2);
    expect(result.total).toBe(120);
  });
});

