import { Dispatch, SetStateAction, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { useProduct } from "../contexts/products";
import { FormData } from "../types/types";
import Dots from "../components/loadingDots";

interface Field {
    label: string;
    name: keyof FormData;
    type: string;
    placeholder: string;
}

interface ProductForm {
    type: string;
    loadingType: string;
    style?: {
        bg: string;
        titleColor: string;
        labelColor: string;
        inputColor: string;
    };
    formData: FormData;
    setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
    defaultFormData?: FormData;
    handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit?: (
        e: React.ChangeEvent<HTMLFormElement>,
        setIsLoading?: Dispatch<SetStateAction<boolean>>,
    ) => Promise<void>;
    setVisibility?: (to: "flex" | "hidden") => void;
}

interface EditProduct {
    productId: number;
    defaultFormData: FormData;
    setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

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

export function CreateProduct() {
    const { createProduct, formOpen, setFormVisibility } = useProduct();
    const [message, setMessage] = useState<{
        type: string;
        message: string;
    } | null>(null);

    const defaultFormData: FormData = {
        productname: "",
        category: "",
        buyingprice: 0,
        sellingprice: 0,
        quantity: 0,
        unit: "",
        expirydate: new Date().toISOString().slice(0, 16),
        threshold: 0,
    };
    const [formData, setFormData] = useState<FormData>(defaultFormData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value, type } = e.target;

        type === "number"
            ? setFormData((prevData) => ({
                  ...prevData,
                  [name]: !Number.isNaN(value)
                      ? value.length > 1
                          ? value.replace(/^0+(?=[\s\S])/, "")
                          : Number(value)
                      : 0,
              }))
            : setFormData((prevData) => ({
                  ...prevData,
                  [name]: value,
              }));
    };

    const handleSubmit = async (
        e: React.ChangeEvent<HTMLFormElement>,
        setIsLoading?: Dispatch<SetStateAction<boolean>>,
    ) => {
        e.preventDefault();

        const data = {
            ...formData,
            buyingprice: +formData.buyingprice,
            sellingprice: +formData.sellingprice,
            quantity: +formData.quantity,
            threshold: +formData.threshold,
        };
        const message = await createProduct(data);

        setIsLoading && setIsLoading(false);
        if (message === "Success") {
            setFormData(defaultFormData);
            setVisibility("hidden");
        }
    };

    const setVisibility = (to: "flex" | "hidden") => {
        setMessage(null);
        setFormVisibility(to);
    };

    return (
        <div
            className={`fixed inset-0 bg-black/55 ${formOpen} items-center justify-center z-50`}
            onMouseDown={() => {
                setFormVisibility("hidden");
            }}
        >
            <ProductForm
                type="Create Product"
                loadingType="Creating Product"
                formData={formData}
                setFormData={setFormData}
                defaultFormData={defaultFormData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                setVisibility={setVisibility}
            />
        </div>
    );
}

export function EditProduct({
    productId,
    defaultFormData,
    setSelected,
}: EditProduct) {
    const { editProduct, editFormOpen, setEditFormVisibility } = useProduct();
    const [formData, setFormData] = useState<FormData>(defaultFormData);

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

        editProduct(formData, productId);
        setFormData(defaultFormData);
        setEditFormVisibility("hidden");
        setSelected([]);
    };

    const setVisibility = (to: "flex" | "hidden") => {
        setEditFormVisibility(to);
    };

    return (
        <div
            className={`fixed inset-0 bg-black/55 ${editFormOpen} items-center justify-center z-50`}
            onMouseDown={() => {
                setSelected([]);
                setEditFormVisibility("hidden");
            }}
        >
            <ProductForm
                type="Edit Product"
                loadingType="Editing Product"
                formData={formData}
                setFormData={setFormData}
                defaultFormData={defaultFormData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                setVisibility={setVisibility}
            />
        </div>
    );
}

export const ProductForm = ({
    type,
    loadingType,
    style,
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    defaultFormData,
    setVisibility,
}: ProductForm) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const readOnly = type === "Product To Be Sold" ? true : false;

    return (
        <>
            <form
                className={`flex flex-col w-165 rounded-lg ${style ? style.bg : "bg-gray-100 dark:bg-black"} shadow-xl p-8 border border-gray-900 gap-8 select-none`}
                onSubmit={(e) => {
                    setIsLoading(true);
                    e.preventDefault();
                    handleSubmit && handleSubmit(e, setIsLoading);
                }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h2
                    className={`font-playfair uppercase tracking-wider text-blue-600 text-2xl font-bold ${style ? style.titleColor : ""}`}
                >
                    {type}
                </h2>

                <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                    {fields.map((field) => (
                        <Fragment key={field.name}>
                            <label
                                htmlFor={field.name}
                                className={`self-center font-medium ${style ? style.labelColor : "text-gray-600"} dark:text-gray-300`}
                            >
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className={`w-full p-2.5 border border-gray-600 rounded-lg text-base ${style ? style.inputColor : "text-gray-900 dark:text-gray-300"} outline-none ${readOnly ? "" : "focus:ring-1 focus:ring-gray-500"}`}
                                required
                                min={field.type === "number" ? 0 : undefined}
                                step={field.type === "number" ? "1" : undefined}
                                readOnly={readOnly}
                            />
                        </Fragment>
                    ))}
                </div>
                <div
                    className={
                        type === "Product To Be Sold"
                            ? "hidden"
                            : "flex justify-end gap-4"
                    }
                >
                    <button
                        onClick={() => {
                            // remove selected products
                            if (setFormData && defaultFormData)
                                setFormData(defaultFormData);
                            if (setVisibility) setVisibility("hidden");
                        }}
                        className="px-5 py-2 border border-gray-600 rounded-md hover:border-gray-700 text-black hover:text-gray-800 dark:text-white dark:hover:text-gray-400 hover:cursor-pointer"
                        type="button"
                    >
                        Discard
                    </button>

                    <button
                        className="px-5 py-2 flex justify-center items-center gap-3 rounded-lg bg-blue-500 dark:bg-blue-600 hover:cursor-pointer text-white"
                        type="submit"
                    >
                        {isLoading ? loadingType : type}
                        <Dots isLoading={isLoading} />
                    </button>
                </div>
            </form>
        </>
    );
};
