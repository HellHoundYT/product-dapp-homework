import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { CONTRACT_ADDRESS, PRODUCT_REGISTRY_ABI } from "./contract.js";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
};

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(Number(timestamp) * 1000));
}

function App() {
  const [account, setAccount] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isConfigured = Boolean(CONTRACT_ADDRESS);

  const getReadContract = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask не знайдено");
    if (!isConfigured) throw new Error("Не задано VITE_CONTRACT_ADDRESS");
    const provider = new BrowserProvider(window.ethereum);
    return new Contract(CONTRACT_ADDRESS, PRODUCT_REGISTRY_ABI, provider);
  }, [isConfigured]);

  const loadProducts = useCallback(async () => {
    if (!window.ethereum || !isConfigured) return;
    try {
      const contract = await getReadContract();
      const result = await contract.getProducts();
      setProducts(
        result.map((product, index) => ({
          id: index,
          name: product.name,
          description: product.description,
          price: product.price,
          creator: product.creator,
          createdAt: product.createdAt,
          imageUrl: product.imageUrl,
        })),
      );
    } catch (err) {
      setError(err.shortMessage || err.message || "Не вдалося завантажити продукти");
    }
  }, [getReadContract, isConfigured]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => setAccount(accounts[0] || "");
    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
  }, []);

  const connectWallet = async () => {
    setError("");
    try {
      if (!window.ethereum) throw new Error("Встановіть MetaMask");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0] || "");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Не вдалося підключити гаманець");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createProduct = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (!window.ethereum) throw new Error("Встановіть MetaMask");
      if (!isConfigured) throw new Error("Не задано VITE_CONTRACT_ADDRESS");
      if (!account) await connectWallet();

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PRODUCT_REGISTRY_ABI, signer);

      const tx = await contract.createProduct(
        form.name.trim(),
        form.description.trim(),
        parseEther(form.price),
        form.imageUrl.trim(),
      );

      setMessage("Транзакцію надіслано. Очікуємо підтвердження…");
      await tx.wait();
      setForm(EMPTY_FORM);
      setMessage("Продукт успішно створено у смартконтракті");
      await loadProducts();
    } catch (err) {
      setError(err.shortMessage || err.reason || err.message || "Помилка створення продукту");
    } finally {
      setBusy(false);
    }
  };

  const stats = useMemo(() => ({ count: products.length }), [products]);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Solidity Product Registry</span>
          <h1>Каталог продуктів у блокчейні</h1>
          <p>
            Створення продуктів виконується через смартконтракт. Автор і час
            створення фіксуються блокчейном автоматично.
          </p>
        </div>
        <div className="wallet-card">
          <span>Підключений акаунт</span>
          <strong>{account ? shortAddress(account) : "Не підключено"}</strong>
          <button className="secondary" onClick={connectWallet}>
            {account ? "Змінити акаунт" : "Підключити MetaMask"}
          </button>
        </div>
      </section>

      {!isConfigured && (
        <div className="notice warning">
          Додайте адресу розгорнутого контракту у frontend/.env як
          VITE_CONTRACT_ADDRESS.
        </div>
      )}

      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="grid">
        <article className="panel form-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Create</span>
              <h2>Новий продукт</h2>
            </div>
          </div>

          <form onSubmit={createProduct}>
            <label>
              Назва продукту
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Наприклад, Mechanical Keyboard"
                required
              />
            </label>

            <label>
              Опис
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Короткий опис продукту"
                rows="4"
                required
              />
            </label>

            <label>
              Ціна, ETH
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.05"
                type="number"
                min="0"
                step="0.000001"
                required
              />
            </label>

            <label>
              URL картинки
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                type="url"
                required
              />
            </label>

            <button className="primary" disabled={busy} type="submit">
              {busy ? "Створення…" : "Створити продукт"}
            </button>
          </form>
        </article>

        <article className="panel table-panel">
          <div className="section-heading table-heading">
            <div>
              <span className="eyebrow">Blockchain data</span>
              <h2>Продукти</h2>
            </div>
            <div className="table-actions">
              <span className="counter">{stats.count} записів</span>
              <button className="secondary compact" onClick={loadProducts}>
                Оновити
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Опис</th>
                  <th>Ціна</th>
                  <th>Адреса акаунта</th>
                  <th>Дата створення</th>
                  <th>Картинка</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="empty" colSpan="6">
                      Продуктів поки немає. Створіть перший запис.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={`${product.creator}-${product.createdAt}-${product.id}`}>
                      <td className="product-name">{product.name}</td>
                      <td className="description">{product.description}</td>
                      <td className="price">{formatEther(product.price)} ETH</td>
                      <td>
                        <code title={product.creator}>{shortAddress(product.creator)}</code>
                      </td>
                      <td>{formatDate(product.createdAt)}</td>
                      <td>
                        <a
                          className="image-link"
                          href={product.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Відкрити оригінальне зображення"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display = "grid";
                            }}
                          />
                          <span className="image-fallback">Немає превʼю</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
