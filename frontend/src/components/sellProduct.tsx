import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { useProduct } from "../contexts/products";
import { ProductForm } from "./productForms";
import { SalesData, FormData } from "../types/types";

interface Field {
    label: string;
    name: keyof SalesData;
    type: string;
    placeholder: string;
}

interface SellProduct {
    productId: number;
    productData: FormData;
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

function SellProduct({ productId, productData, setSelected }: SellProduct) {
    const { sellProduct, salesFormOpen, setSalesFormVisibility } = useProduct();

    const defaultFormData: SalesData = {
        productId: productId,
        quantity: 0,
        price: 0,
        total: 0,
    };

    const [formData, setFormData] = useState<SalesData>(defaultFormData);

    const fields: Field[] = [
        {
            label: "Quantity",
            name: "quantity",
            type: "number",
            placeholder: "Enter quantity",
        },
        {
            label: "Price",
            name: "price",
            type: "number",
            placeholder: "Enter price",
        },
        {
            label: "Total",
            name: "total",
            type: "number",
            placeholder: "Enter total price",
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        type === "number"
            ? setFormData((prevData) => ({
                  ...prevData,
                  [name]: Number(value),
              }))
            : setFormData((prevData) => ({
                  ...prevData,
                  [name]: value,
              }));
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        sellProduct(formData);
        setFormData(defaultFormData);
        setSelected([]);
        setSalesFormVisibility("hidden");
    };

    const style = {
        bg: "bg-gray-100 dark:bg-black",
        titleColor: "dark:text-gray-300",
        labelColor: "dark:text-gray-500",
        inputColor: "text-gray-200 dark:text-gray-400",
    };

    return (
        <div
            className={`fixed inset-0 flex gap-30 bg-black/55 ${salesFormOpen} items-center justify-center z-50`}
            onMouseDown={() => {
                setSelected([]);
                setSalesFormVisibility("hidden");
            }}
        >
            <ProductForm
                type={"Product To Be Sold"}
                formData={productData}
                style={style}
            />
            <form
                className="flex flex-col w-100 rounded-lg bg-gray-100 dark:bg-black shadow-xl p-8 border border-gray-900 gap-10 select-none"
                onSubmit={handleSubmit}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold">Sell Product</h2>

                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                    {fields.map((field) => (
                        <Fragment key={field.name}>
                            <label
                                htmlFor={field.name}
                                className="self-center font-medium text-gray-600 dark:text-gray-300"
                            >
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={
                                    field.type === "number" &&
                                    formData[field.name] === 0
                                        ? ""
                                        : formData[field.name]
                                }
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className="w-full px-2.5 py-1.5 border border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-gray-400"
                                required
                            />
                        </Fragment>
                    ))}
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setSalesFormVisibility("hidden");
                            setFormData(defaultFormData);
                        }}
                        className="px-5 py-2 border border-gray-600 rounded-md hover:border-gray-700 hover:text-gray-400 hover:cursor-pointer"
                        type="button"
                    >
                        Discard
                    </button>

                    <button
                        className="px-5 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 hover:cursor-pointer text-white"
                        type="submit"
                    >
                        Sell Product
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SellProduct;
