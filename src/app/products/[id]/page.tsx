"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "@/app/products/[id]/SingleProductPage.module.css";

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
}

const ProductPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedProduct, setEditedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await api.getData(`products/${id}`);
                if (!data || typeof data !== "object") {
                    throw new Error("Невірний формат відповіді");
                }
                setProduct(data);
                setEditedProduct(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Помилка завантаження товару");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editedProduct) {
            setEditedProduct({ ...editedProduct, [e.target.name]: e.target.value });
        }
    };

    const handleUpdate = async () => {
        try {
            await api.putData(`products/${id}`, editedProduct);
            toast.success("Товар оновлено успішно!");
            window.location.href = `/products/${id}`;
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Помилка при оновленні товару");
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return;
        try {
            await api.deleteData("products", Number(id));
            toast.success("Товар видалено!");
            router.push("/products");
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Помилка при видаленні товару");
            }
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (error) return <p>Помилка: {error}</p>;
    if (!product) return <p>Товар не знайдено</p>;

    return (
        <div className={styles.container}>
            {isEditing ? (
                <div className={styles.editForm}>
                    <h2>Редагувати товар</h2>
                    <input type="text" name="name" value={editedProduct?.name} onChange={handleEditChange} />
                    <textarea name="description" value={editedProduct?.description} onChange={handleEditChange} />
                    <input type="number" name="price" value={editedProduct?.price} onChange={handleEditChange} />
                    <input type="text" name="category" value={editedProduct?.category} onChange={handleEditChange} />
                    <button type="button" onClick={handleUpdate}>Зберегти</button>
                    <button type="button" className={styles.cancel} onClick={() => setIsEditing(false)}>Скасувати</button>
                </div>
            ) : (
                <div className={styles.productDetails}>
                    <h1>{product.name}</h1>
                    <p><strong>Опис:</strong> {product.description}</p>
                    <p><strong>Ціна:</strong> {product.price} грн</p>
                    <p><strong>Категорія:</strong> {product.category}</p>
                    <button type="button" onClick={() => setIsEditing(true)}>Редагувати</button>
                    <button type="button" className={styles.delete} onClick={handleDelete}>Видалити</button>
                    <button type="button" className={styles.cancel} onClick={() => window.location.href = `/products`}>На головну</button>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
