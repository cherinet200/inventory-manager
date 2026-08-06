import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { useAuth } from "../contexts/auth";
import { useProduct } from "../contexts/products";

export interface FormData {
    productname: string;
    category: string;
    buyingprice: number;
    sellingprice: number;
    quantity: number;
    unit: string;
    expirydate: string;
    threshold: number;
}

interface Field {
    label: string;
    name: keyof FormData;
    type: string;
    placeholder: string;
}

function CreateProduct() {
    // const { token } = useAuth();
    const { createProduct, formOpen, setFormVisibility } = useProduct();

    const [formData, setFormData] = useState<FormData>({
        productname: "",
        category: "",
        buyingprice: 0,
        sellingprice: 0,
        quantity: 0,
        unit: "",
        expirydate: new Date().toISOString().slice(0, 16),
        threshold: 0,
    });
    const fields: Field[] = [
        {
            label: "Product Name",
            name: "productname",
            type: "text",
            placeholder: "Enter product name",
        },
        {
            label: "Category",
            name: "category",
            type: "text",
            placeholder: "Enter category",
        },
        {
            label: "Buying Price",
            name: "buyingprice",
            type: "number",
            placeholder: "Enter buying price",
        },
        {
            label: "Selling Price",
            name: "sellingprice",
            type: "number",
            placeholder: "Enter selling price",
        },
        {
            label: "Quantity",
            name: "quantity",
            type: "number",
            placeholder: "Enter product quantity",
        },
        {
            label: "Threshold Value",
            name: "threshold",
            type: "number",
            placeholder: "Enter threshold value",
        },
        {
            label: "Unit",
            name: "unit",
            type: "text",
            placeholder: "Enter product unit",
        },
        {
            label: "Expiry Date",
            name: "expirydate",
            type: "datetime-local",
            placeholder: "",
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

        createProduct(formData);
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/55 ${formOpen} items-center justify-center z-50`}
            >
                <form
                    className="flex flex-col w-165 rounded-lg bg-gray-100 dark:bg-black shadow-xl p-8 border border-gray-900 gap-8"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-2xl font-semibold">New Product</h2>

                    <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
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
                                    className="w-full p-2.5 border border-gray-600 rounded-lg text-base text-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-gray-400"
                                    required
                                />
                            </Fragment>
                        ))}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setFormVisibility("hidden")}
                            className="px-5 py-2 border border-gray-600 rounded-md hover:border-gray-700 hover:text-gray-400 hover:cursor-pointer"
                            type="button"
                        >
                            Discard
                        </button>

                        <button
                            className="px-5 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 hover:cursor-pointer text-white"
                            type="submit"
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default CreateProduct;
