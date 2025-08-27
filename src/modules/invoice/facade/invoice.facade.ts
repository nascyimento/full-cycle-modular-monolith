import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import InvoiceFacadeInterface, {
  FindInvoiceFacadeInputDto,
  FindInvoiceFacadeOutputDto,
  GenerateInvoiceFacadeInputDto,
  GenerateInvoiceFacadeOutputDto,
} from "./invoice.facade.interface";

export interface UseCasesProps {
  findUsecase: UseCaseInterface;
  generateUsecase: UseCaseInterface;
}

export default class InvoiceFacade implements InvoiceFacadeInterface {
  private _findUsecase: UseCaseInterface;
  private _generateUsecase: UseCaseInterface;

  constructor(props: UseCasesProps) {
    this._findUsecase = props.findUsecase;
    this._generateUsecase = props.generateUsecase;
  }

  async find(
    input: FindInvoiceFacadeInputDto
  ): Promise<FindInvoiceFacadeOutputDto> {
    return this._findUsecase.execute(input);
  }

  async generate(
    input: GenerateInvoiceFacadeInputDto
  ): Promise<GenerateInvoiceFacadeOutputDto> {
    return this._generateUsecase.execute(input);
  }
}

