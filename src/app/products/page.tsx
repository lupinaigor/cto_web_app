"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "@/app/products/ProductsPage.module.css";
import { usePathname, useSearchParams } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
}

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: ""
    });

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState<string>(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
    const [minPrice, setMinPrice] = useState<number | "">(searchParams.get("price_min") ? Number(searchParams.get("price_min")) : "");
    const [maxPrice, setMaxPrice] = useState<number | "">(searchParams.get("price_max") ? Number(searchParams.get("price_max")) : "");

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const data = await api.getData("products");
                if (!Array.isArray(data)) throw new Error("Invalid response format");
                setAllProducts(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Невідома помилка");
                }
            }
        };
        fetchAllProducts();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.getData(`products?${searchParams.toString()}`);
                if (!Array.isArray(data)) throw new Error("Invalid response format");
                setProducts(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Невідома помилка");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdProduct = await api.postData("products", {
                ...newProduct,
            });

            setProducts([...products, createdProduct]);
            toast.success("Товар додано успішно!");
            setShowForm(false);
            setNewProduct({ name: "", description: "", price: 0, category: "" });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Невідома помилка");
            }
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (selectedCategory) params.set("category", selectedCategory);
        if (minPrice !== "") params.set("price_min", minPrice.toString());
        if (maxPrice !== "") params.set("price_max", maxPrice.toString());

        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        window.history.pushState(null, "", pathname);
    };

    const categories = [...new Set(allProducts.map(p => p.category))];

    if (loading) return <div className={styles.container}><p>Завантаження...</p></div>;
    if (error) return <div className={styles.container}><p>Помилка: {error}</p></div>;

    return (
        <div className={styles.container}>
            <form onSubmit={handleFilterSubmit} className={styles.filterForm}>
                <input type="text" placeholder="Назва" value={search} onChange={e => setSearch(e.target.value)} />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">Усі категорії</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <input type="number" placeholder="Мін. ціна" value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : "")} />
                <input type="number" placeholder="Макс. ціна" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : "")} />
                <button type="submit">Фільтрувати</button>
                <button type="button" onClick={handleClearFilters}>Скасувати фільтрацію</button>
            </form>

            <button onClick={() => setShowForm(!showForm)}>Додати товар</button>
            {showForm && (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Назва" value={newProduct.name} onChange={handleInputChange} required />
                    <input type="text" name="description" placeholder="Опис" value={newProduct.description} onChange={handleInputChange} required />
                    <input type="number" name="price" placeholder="Ціна" value={newProduct.price} onChange={handleInputChange} required />
                    <input type="text" name="category" placeholder="Категорія" value={newProduct.category} onChange={handleInputChange} required />
                    <button type="submit">Створити</button>
                    <button onClick={() => setShowForm(!showForm)}>Скасувати</button>
                </form>
            )}

            <ul>
                {products.length > 0 ? (
                    products.map(product => (
                        <li key={`product-${product.id}`}>
                            <Link href={`/products/${product.id}`}>
                                <h3>{product.name}</h3>
                            </Link>
                            <p>Ціна: {product.price} грн</p>
                        </li>
                    ))
                ) : (
                    <p>Товари не знайдені</p>
                )}
            </ul>
        </div>
    );
};

export default ProductsPage;

