import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployFixture() {
  const [owner, alice] = await ethers.getSigners();
  const registry = await ethers.deployContract("ProductRegistry");
  await registry.waitForDeployment();
  return { registry, owner, alice };
}

describe("ProductRegistry", function () {
  it("creates a product and stores all required fields", async function () {
    const { registry, alice } = await networkHelpers.loadFixture(deployFixture);
    const price = ethers.parseEther("1.25");

    await expect(
      registry
        .connect(alice)
        .createProduct(
          "Laptop",
          "Work laptop",
          price,
          "https://images.example.com/laptop.jpg",
        ),
    ).to.emit(registry, "ProductCreated");

    expect(await registry.productCount()).to.equal(1n);

    const product = await registry.getProduct(0);
    expect(product.name).to.equal("Laptop");
    expect(product.description).to.equal("Work laptop");
    expect(product.price).to.equal(price);
    expect(product.creator).to.equal(alice.address);
    expect(product.createdAt).to.be.greaterThan(0n);
    expect(product.imageUrl).to.equal(
      "https://images.example.com/laptop.jpg",
    );
  });

  it("returns all created products", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);

    await registry.createProduct(
      "Phone",
      "Smartphone",
      ethers.parseEther("0.5"),
      "https://images.example.com/phone.jpg",
    );

    await registry.createProduct(
      "Tablet",
      "Portable tablet",
      ethers.parseEther("0.8"),
      "https://images.example.com/tablet.jpg",
    );

    const products = await registry.getProducts();
    expect(products).to.have.length(2);
    expect(products[0].name).to.equal("Phone");
    expect(products[1].name).to.equal("Tablet");
  });

  it("rejects invalid product data", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);

    await expect(
      registry.createProduct(
        "",
        "Description",
        ethers.parseEther("1"),
        "https://images.example.com/item.jpg",
      ),
    ).to.be.revertedWith("Name is required");

    await expect(
      registry.createProduct(
        "Item",
        "Description",
        0,
        "https://images.example.com/item.jpg",
      ),
    ).to.be.revertedWith("Price must be greater than zero");
  });

  it("rejects reading a missing product", async function () {
    const { registry } = await networkHelpers.loadFixture(deployFixture);
    await expect(registry.getProduct(0)).to.be.revertedWith(
      "Product does not exist",
    );
  });
});
