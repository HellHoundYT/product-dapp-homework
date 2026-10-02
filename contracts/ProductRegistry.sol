// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProductRegistry {
    struct Product {
        string name;
        string description;
        uint256 price;
        address creator;
        uint256 createdAt;
        string imageUrl;
    }

    Product[] private products;

    event ProductCreated(
        uint256 indexed productId,
        string name,
        uint256 price,
        address indexed creator,
        uint256 createdAt,
        string imageUrl
    );

    function createProduct(
        string calldata name,
        string calldata description,
        uint256 price,
        string calldata imageUrl
    ) external {
        require(bytes(name).length > 0, "Name is required");
        require(bytes(description).length > 0, "Description is required");
        require(price > 0, "Price must be greater than zero");
        require(bytes(imageUrl).length > 0, "Image URL is required");

        products.push(
            Product({
                name: name,
                description: description,
                price: price,
                creator: msg.sender,
                createdAt: block.timestamp,
                imageUrl: imageUrl
            })
        );

        uint256 productId = products.length - 1;

        emit ProductCreated(
            productId,
            name,
            price,
            msg.sender,
            block.timestamp,
            imageUrl
        );
    }

    function getProducts() external view returns (Product[] memory) {
        return products;
    }

    function getProduct(uint256 index) external view returns (Product memory) {
        require(index < products.length, "Product does not exist");
        return products[index];
    }

    function productCount() external view returns (uint256) {
        return products.length;
    }
}
