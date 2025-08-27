import { Sequelize } from "sequelize-typescript";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { ProductModel as ProductAdmModel } from "../../modules/product-adm/repository/product.model";
import StoreProductModel from "../../modules/store-catalog/repository/product.model";
import InvoiceModel from "../../modules/invoice/repository/invoice.model";
import InvoiceItemModel from "../../modules/invoice/repository/invoice-item.model";

export type OrmInstances = {
  client: Sequelize;
  productAdm: Sequelize;
  store: Sequelize;
  payment: Sequelize;
  invoice: Sequelize;
};

export const orm: OrmInstances = {
  client: new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false }),
  productAdm: new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false }),
  store: new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false }),
  payment: new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false }),
  invoice: new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false }),
};

export const migration = {
  async up() {
    orm.client.addModels([ClientModel]);
    await orm.client.sync({ force: true });

    orm.productAdm.addModels([ProductAdmModel]);
    await orm.productAdm.sync({ force: true });

    orm.store.addModels([StoreProductModel]);
    await orm.store.sync({ force: true });

    orm.payment.addModels([TransactionModel]);
    await orm.payment.sync({ force: true });

    orm.invoice.addModels([InvoiceModel, InvoiceItemModel]);
    await orm.invoice.sync({ force: true });
  },
  async down() {
    await orm.invoice.drop();
    await orm.payment.drop();
    await orm.store.drop();
    await orm.productAdm.drop();
    await orm.client.drop();
  },
};

