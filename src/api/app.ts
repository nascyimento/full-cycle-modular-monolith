import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import ClientRepository from "../modules/client-adm/repository/client.repository";
import AddClientUseCase from "../modules/client-adm/usecase/add-client/add-client.usecase";
import FindClientUseCase from "../modules/client-adm/usecase/find-client/find-client.usecase";
import InvoiceRepository from "../modules/invoice/repository/invoice.repository";
import FindInvoiceUseCase from "../modules/invoice/usecase/find/find-invoice.usecase";
import GenerateInvoiceUseCase from "../modules/invoice/usecase/generate/generate-invoice.usecase";
import TransactionRepository from "../modules/payment/repository/transaction.repository";
import ProcessPaymentUseCase from "../modules/payment/usecase/process-payment/process-payment.usecase";
import ProductAdmRepository from "../modules/product-adm/repository/product.repository";
import AddProductUseCase from "../modules/product-adm/usecase/add-product/add-product.usecase";
import CheckStockUseCase from "../modules/product-adm/usecase/check-stock/check-stock.usecase";
import FindProductAdmUseCase from "../modules/product-adm/usecase/find-product/find-product.usecase";
import StoreCatalogProductRepository from "../modules/store-catalog/repository/product.repository";

export function createApp() {
  const app = express();
  app.use(express.json());

  // Instantiate repositories
  const clientRepo = new ClientRepository();
  const productAdmRepo = new ProductAdmRepository();
  const storeRepo = new StoreCatalogProductRepository();
  const transactionRepo = new TransactionRepository();
  const invoiceRepo = new InvoiceRepository();

  // Instantiate use cases
  const addClientUC = new AddClientUseCase(clientRepo);
  const findClientUC = new FindClientUseCase(clientRepo);
  const addProductAdmUC = new AddProductUseCase(productAdmRepo);
  const checkStockUC = new CheckStockUseCase(productAdmRepo);
  const findProductAdmUC = new FindProductAdmUseCase(productAdmRepo);
  const processPaymentUC = new ProcessPaymentUseCase(transactionRepo);
  const generateInvoiceUC = new GenerateInvoiceUseCase(invoiceRepo);
  const findInvoiceUC = new FindInvoiceUseCase(invoiceRepo);

  app.post("/products", async (req: Request, res: Response) => {
    try {
      const { id, name, description, purchasePrice, stock } = req.body || {};
      if (!name || !description || purchasePrice == null || stock == null) {
        return res.status(400).json({ message: "Missing product fields" });
      }

      await addProductAdmUC.execute({ id, name, description, purchasePrice, stock } as any);
      // Store-catalog is read-only; no creation here.

      return res.status(201).json({ id, name, description, purchasePrice, stock });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Internal error" });
    }
  });

  app.post("/clients", async (req: Request, res: Response) => {
    try {
      const { id, name, email, document, address } = req.body || {};
      if (!name || !email || !document || !address) {
        return res.status(400).json({ message: "Missing client fields" });
      }
      if (
        !address.street || !address.number || address.complement === undefined ||
        !address.city || !address.state || !address.zipCode
      ) {
        return res.status(400).json({ message: "Invalid address" });
      }

      await addClientUC.execute({ id, name, email, document, address } as any);
      return res.status(201).json({ id, name, email, document });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Internal error" });
    }
  });

  app.post("/checkout/", async (req: Request, res: Response) => {
    try {
      const { clientId, products } = req.body || {};
      if (!clientId || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      // 1) Validate client exists
      const client = await findClientUC.execute({ id: clientId });
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // 2) Load products from product-adm (price from purchasePrice) and check stock
      const items: { id: string; name: string; price: number }[] = [];
      for (const p of products) {
        const pid = p?.productId;
        if (!pid) return res.status(400).json({ message: "Invalid product id" });

        const productAdm = await findProductAdmUC.execute({ id: pid });
        if (!productAdm) {
          return res.status(404).json({ message: `Product ${pid} not found` });
        }

        const stock = await checkStockUC.execute({ productId: pid });
        if (!stock || stock.stock <= 0) {
          return res.status(400).json({ message: `Product ${pid} is not available` });
        }

        items.push({ id: productAdm.id, name: productAdm.name, price: productAdm.purchasePrice });
      }

      const total = items.reduce((sum, i) => sum + i.price, 0);
      const orderId = uuidv4();

      // 3) Process payment
      const payment = await processPaymentUC.execute({ orderId, amount: total });

      // 4) Generate invoice only if approved
      let invoiceId: string | null = null;
      if (payment.status === "approved") {
        const inv = await generateInvoiceUC.execute({
          name: client.name,
          document: client.document,
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement,
          city: client.address.city,
          state: client.address.state,
          zipCode: (client.address as any).zipCode,
          items,
        });
        invoiceId = inv.id;
      }

      return res.status(200).json({
        id: orderId,
        invoiceId,
        status: payment.status,
        total,
        products: products.map((p: any) => ({ productId: p.productId })),
      });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Internal error" });
    }
  });

  app.get("/invoice/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const output = await findInvoiceUC.execute({ id });
      if (!output) return res.status(404).json({ message: "Invoice not found" });

      return res.status(200).json(output);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Internal error" });
    }
  });

  return app;
}
