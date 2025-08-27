import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import InvoiceItem from "../../domain/invoice-item.entity";
import Invoice from "../../domain/invoice.entity";
import InvoiceGateway from "../../gateway/invoice.gateway";
import {
  GenerateInvoiceUseCaseInputDto,
  GenerateInvoiceUseCaseOutputDto,
} from "./generate-invoice.dto";

export default class GenerateInvoiceUseCase implements UseCaseInterface {
  constructor(private invoiceRepository: InvoiceGateway) {}

  async execute(
    input: GenerateInvoiceUseCaseInputDto
  ): Promise<GenerateInvoiceUseCaseOutputDto> {
    const address = new Address(
      input.street,
      input.number,
      input.complement,
      input.city,
      input.state,
      input.zipCode
    );

    const items = input.items.map((i) => new InvoiceItem({ id: new Id(i.id), name: i.name, price: i.price }));

    const invoice = new Invoice({
      id: new Id(),
      name: input.name,
      document: input.document,
      address,
      items,
    });

    await this.invoiceRepository.generate(invoice);

    return {
      id: invoice.id.id,
      name: invoice.name,
      document: invoice.document,
      street: invoice.address.street,
      number: invoice.address.number,
      complement: invoice.address.complement,
      city: invoice.address.city,
      state: invoice.address.state,
      zipCode: invoice.address.zipCode,
      items: invoice.items.map((i) => ({ id: i.id.id, name: i.name, price: i.price })),
      total: invoice.total,
    };
  }
}
