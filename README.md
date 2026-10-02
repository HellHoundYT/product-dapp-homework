# Product Registry DApp

Домашня робота з Solidity та frontend інтеграцією.

## Завдання

Контракт зберігає продукти з полями:

- назва продукту
- опис
- ціна
- адреса акаунта, який створив продукт
- часова мітка створення
- URL картинки

Frontend дозволяє підключити MetaMask, створити новий продукт через смартконтракт і показати всі продукти у таблиці з назвою, описом, ціною, адресою автора, датою створення та зображенням.

## Технології

- Solidity 0.8.28
- Hardhat 3
- Mocha + Chai + ethers
- React 19
- Vite 8
- ethers v6

## Структура

```text
contracts/ProductRegistry.sol
ignition/modules/ProductRegistry.ts
test/ProductRegistry.test.ts
frontend/src/App.jsx
frontend/src/contract.js
frontend/src/styles.css
hardhat.config.ts
package.json
```

## 1. Встановлення залежностей контракту

```bash
npm install
npx hardhat build
npx hardhat test
```

## 2. Локальна мережа

У першому терміналі:

```bash
npx hardhat node
```

## 3. Деплой контракту

У другому терміналі:

```bash
npx hardhat ignition deploy ./ignition/modules/ProductRegistry.ts --network localhost
```

Скопіюйте адресу `ProductRegistryModule#ProductRegistry` з результату деплою.

## 4. Налаштування frontend

```bash
cd frontend
npm install
```

Скопіюйте `.env.example` у `.env` і вкажіть адресу контракту:

```env
VITE_CONTRACT_ADDRESS=0x...
```

Після цього:

```bash
npm run dev
```

## MetaMask і localhost

Для локальної перевірки додайте у MetaMask мережу Hardhat:

```text
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Імпортуйте один із тестових приватних ключів, які Hardhat показує після запуску `npx hardhat node`.

## Контракт

### createProduct

Frontend викликає:

```solidity
createProduct(
    string name,
    string description,
    uint256 price,
    string imageUrl
)
```

Адреса автора береться з `msg.sender`, а дата створення з `block.timestamp`, тому користувач не може підмінити ці поля через форму.

### getProducts

Frontend отримує весь масив через:

```solidity
getProducts() external view returns (Product[] memory)
```

## Примітка про ціну

У контракті ціна зберігається у wei. У формі frontend користувач вводить ETH, після чого `ethers.parseEther()` перетворює значення у wei. Для таблиці `ethers.formatEther()` виконує зворотне перетворення.
