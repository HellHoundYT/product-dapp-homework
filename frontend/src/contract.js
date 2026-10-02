export const PRODUCT_REGISTRY_ABI = [
  "function createProduct(string name, string description, uint256 price, string imageUrl)",
  "function getProducts() view returns (tuple(string name, string description, uint256 price, address creator, uint256 createdAt, string imageUrl)[])",
  "function productCount() view returns (uint256)",
  "event ProductCreated(uint256 indexed productId, string name, uint256 price, address indexed creator, uint256 createdAt, string imageUrl)"
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
