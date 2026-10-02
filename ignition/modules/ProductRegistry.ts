import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProductRegistryModule", (m) => {
  const productRegistry = m.contract("ProductRegistry");
  return { productRegistry };
});
