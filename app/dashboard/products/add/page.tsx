// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   Upload,
//   X,
//   Plus,
//   Trash2,
//   Tag,
//   Scale,
//   Ruler,
//   Zap,
//   RotateCcw,
//   BarChart3,
//   Truck,
//   FileText,
// } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { ProductService } from "@/lib/api";
// import { toast } from "sonner";
// import Link from "next/link";
// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";

// // --- Types Definition ---
// type ProductCategory =
//   | "Engine"
//   | "Brake"
//   | "Electrical"
//   | "Body"
//   | "Accessories"
//   | "Suspension"
//   | "Transmission"
//   | "Interior"
//   | "Exterior"
//   | "Service Parts";

// interface CompatibleModel {
//   modelName: string;
//   yearFrom: number;
//   yearTo?: number;
//   variant?: string;
//   fuelType: "Petrol" | "Diesel" | "CNG" | "EV" | "Universal"; // 🔥 Added
// }

// interface ProductFormData {
//   name: string;
//   partNumber: string;
//   description: string;
//   category: ProductCategory;
//   subcategory: string;
//   price: number;
//   discountPrice?: number;
//   // 🔥 New Pricing Fields
//   gstRate: number;
//   hsnCode: string;

//   stock: number;
//   lowStockThreshold: number;
//   maxOrderQuantity: number; // 🔥 Added

//   warrantyPeriod: string;
//   manufacturer: string;
//   originCountry: string; // 🔥 Added

//   compatibleModels: CompatibleModel[];
//   tags: string[];
//   isActive: boolean;

//   // 🔥 New Features Objects
//   flashSale: {
//     isActive: boolean;
//     salePrice?: number;
//     startTime?: string;
//     endTime?: string;
//   };
//   inventoryAnalytics: {
//     reorderLevel: number;
//     leadTimeDays: number;
//     supplierEmail: string;
//   };
//   returnPolicy: {
//     isReturnable: boolean;
//     returnWindowDays: number;
//     restockingFee: number;
//   };
//   shippingInfo: {
//     weight: number;
//     length: number;
//     width: number;
//     height: number;
//   };
// }

// interface SpecificationItem {
//   key: string;
//   value: string;
// }

// const CATEGORIES: ProductCategory[] = [
//   "Engine",
//   "Brake",
//   "Electrical",
//   "Body",
//   "Accessories",
//   "Suspension",
//   "Transmission",
//   "Interior",
//   "Exterior",
//   "Service Parts",
// ];

// const HYUNDAI_MODELS = [
//   "i10",
//   "i20",
//   "Venue",
//   "Verna",
//   "Creta",
//   "Alcazar",
//   "Tucson",
//   "Elantra",
//   "Kona",
//   "Ioniq 5",
//   "Santro",
//   "Grand i10",
//   "Aura",
//   "Exter",
// ];

// const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "EV", "Universal"];

// export default function AddProductPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [images, setImages] = useState<File[]>([]);
//   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");

//   // --- Main Form Data ---
//   const [formData, setFormData] = useState<ProductFormData>({
//     name: "",
//     partNumber: "",
//     description: "",
//     category: "Engine",
//     subcategory: "",
//     price: 0,
//     discountPrice: undefined,
//     gstRate: 18, // Default 18%
//     hsnCode: "",
//     stock: 0,
//     lowStockThreshold: 5,
//     maxOrderQuantity: 10,
//     warrantyPeriod: "No Warranty",
//     manufacturer: "Hyundai Mobis",
//     originCountry: "India",
//     compatibleModels: [],
//     tags: [],
//     isActive: true,
//     // New Defaults
//     flashSale: {
//       isActive: false,
//       salePrice: 0,
//       startTime: "",
//       endTime: "",
//     },
//     inventoryAnalytics: {
//       reorderLevel: 10,
//       leadTimeDays: 7,
//       supplierEmail: "",
//     },
//     returnPolicy: {
//       isReturnable: true,
//       returnWindowDays: 7,
//       restockingFee: 0,
//     },
//     shippingInfo: {
//       weight: 0,
//       length: 0,
//       width: 0,
//       height: 0,
//     },
//   });

//   const [specifications, setSpecifications] = useState<SpecificationItem[]>([
//     { key: "", value: "" },
//   ]);

//   const [currentModel, setCurrentModel] = useState<CompatibleModel>({
//     modelName: "",
//     yearFrom: new Date().getFullYear(),
//     yearTo: undefined,
//     variant: "",
//     fuelType: "Universal",
//   });

//   const searchParams = useSearchParams();
//   const cloneId = searchParams.get("cloneId");

//   // --- Handlers ---

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length + images.length > 5) {
//       toast.error("Maximum 5 images allowed");
//       return;
//     }
//     setImages([...images, ...files]);
//     files.forEach((file) => {
//       const reader = new FileReader();
//       reader.onloadend = () =>
//         setImagePreviews((prev) => [...prev, reader.result as string]);
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (index: number) => {
//     setImages(images.filter((_, i) => i !== index));
//     setImagePreviews(imagePreviews.filter((_, i) => i !== index));
//   };

//   const addCompatibleModel = () => {
//     if (!currentModel.modelName) {
//       toast.error("Please select a model");
//       return;
//     }
//     setFormData((prev) => ({
//       ...prev,
//       compatibleModels: [...prev.compatibleModels, currentModel],
//     }));
//     // Reset but keep some defaults
//     setCurrentModel({
//       modelName: "",
//       yearFrom: new Date().getFullYear(),
//       yearTo: undefined,
//       variant: "",
//       fuelType: "Universal",
//     });
//   };

//   const removeCompatibleModel = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       compatibleModels: prev.compatibleModels.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSpecChange = (
//     index: number,
//     field: "key" | "value",
//     value: string,
//   ) => {
//     const newSpecs = [...specifications];
//     newSpecs[index][field] = value;
//     setSpecifications(newSpecs);
//   };

//   const addSpecRow = () =>
//     setSpecifications([...specifications, { key: "", value: "" }]);
//   const removeSpecRow = (index: number) => {
//     setSpecifications(specifications.filter((_, i) => i !== index));
//   };

//   const handleAddTag = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && tagInput.trim()) {
//       e.preventDefault();
//       if (!formData.tags.includes(tagInput.trim())) {
//         setFormData((prev) => ({
//           ...prev,
//           tags: [...prev.tags, tagInput.trim()],
//         }));
//       }
//       setTagInput("");
//     }
//   };

//   const removeTag = (tagToRemove: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((tag) => tag !== tagToRemove),
//     }));
//   };

//   // --- Submit Handler ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (images.length === 0) {
//       toast.error("Please upload at least one image");
//       return;
//     }

//     if (formData.compatibleModels.length === 0) {
//       toast.error("Please add at least one compatible model");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const data = new FormData();

//       // Basic Fields
//       data.append("name", formData.name);
//       data.append("partNumber", formData.partNumber);
//       data.append("description", formData.description);
//       data.append("category", formData.category);
//       if (formData.subcategory)
//         data.append("subcategory", formData.subcategory);
//       data.append("manufacturer", formData.manufacturer);
//       data.append("originCountry", formData.originCountry);
//       data.append("isActive", formData.isActive.toString());

//       // Pricing & Tax
//       data.append("price", formData.price.toString());
//       if (formData.discountPrice)
//         data.append("discountPrice", formData.discountPrice.toString());
//       data.append("gstRate", formData.gstRate.toString());
//       data.append("hsnCode", formData.hsnCode);

//       // Stock
//       data.append("stock", formData.stock.toString());
//       data.append("lowStockThreshold", formData.lowStockThreshold.toString());
//       data.append("maxOrderQuantity", formData.maxOrderQuantity.toString());
//       data.append("warrantyPeriod", formData.warrantyPeriod);

//       // Complex Fields (JSON.stringify for Backend Parsing)
//       data.append(
//         "compatibleModels",
//         JSON.stringify(formData.compatibleModels),
//       );
//       data.append("tags", JSON.stringify(formData.tags));
//       data.append("flashSale", JSON.stringify(formData.flashSale));
//       data.append(
//         "inventoryAnalytics",
//         JSON.stringify(formData.inventoryAnalytics),
//       );
//       data.append("returnPolicy", JSON.stringify(formData.returnPolicy));
//       data.append("shippingInfo", JSON.stringify(formData.shippingInfo));

//       // Specifications Map
//       const specsObject = specifications.reduce(
//         (acc, curr) => {
//           if (curr.key.trim() && curr.value.trim()) {
//             acc[curr.key.trim()] = curr.value.trim();
//           }
//           return acc;
//         },
//         {} as Record<string, string>,
//       );
//       data.append("specifications", JSON.stringify(specsObject));

//       // Images
//       images.forEach((image) => data.append("images", image));

//       await ProductService.create(data);

//       toast.success("Product created successfully!");
//       router.push("/dashboard/products");
//     } catch (error: any) {
//       console.error("Create product error:", error);
//       toast.error(error.response?.data?.message || "Failed to create product");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 pb-20">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-center gap-4"
//       >
//         <Link href="/dashboard/products">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="rounded-xl bg-white/5 p-2 backdrop-blur-sm transition-colors hover:bg-white/10"
//           >
//             <ArrowLeft className="h-5 w-5 text-white" />
//           </motion.button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-white">Add New Product</h1>
//           <p className="mt-1 text-gray-400">Create a new spare part listing</p>
//         </div>
//       </motion.div>

//       {/* Form */}
//       <motion.form
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         onSubmit={handleSubmit}
//         className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm"
//       >
//         <div className="space-y-8">
//           {/* 1. Basic Information */}
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-white">
//                 Basic Information
//               </h2>
//               {/* Active Toggle */}
//               <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
//                 <span className="text-sm font-medium text-gray-300">
//                   Status:
//                 </span>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.isActive}
//                     onChange={(e) =>
//                       setFormData({ ...formData, isActive: e.target.checked })
//                     }
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
//                   <span className="ms-3 text-sm font-medium text-white">
//                     {formData.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </label>
//               </div>
//             </div>

//             <div className="grid gap-6 md:grid-cols-2">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Product Name *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="e.g., Front Brake Pad Set"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Part Number *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.partNumber}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       partNumber: e.target.value.toUpperCase(),
//                     })
//                   }
//                   className="form-input"
//                   placeholder="e.g., 58101-C9A70"
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Description *
//                 </label>
//                 <textarea
//                   required
//                   rows={4}
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="Detailed product description..."
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Category *
//                 </label>
//                 <select
//                   required
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       category: e.target.value as ProductCategory,
//                     })
//                   }
//                   className="form-input"
//                 >
//                   {CATEGORIES.map((cat) => (
//                     <option
//                       key={cat}
//                       value={cat}
//                       style={{ backgroundColor: "#1f2937", color: "white" }}
//                     >
//                       {cat}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Subcategory
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.subcategory}
//                   onChange={(e) =>
//                     setFormData({ ...formData, subcategory: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="e.g., Brake Pads"
//                 />
//               </div>
//               {/* 🔥 New Fields: Origin & Manufacturer */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Manufacturer
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.manufacturer}
//                   onChange={(e) =>
//                     setFormData({ ...formData, manufacturer: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="e.g., Hyundai Mobis"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Origin Country
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.originCountry}
//                   onChange={(e) =>
//                     setFormData({ ...formData, originCountry: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="e.g., India"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 2. Pricing & Stock (Updated with GST & HSN) */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Pricing & Inventory
//             </h2>
//             <div className="grid gap-6 md:grid-cols-4">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Price (₹) *
//                 </label>
//                 <input
//                   type="number"
//                   required
//                   min="0"
//                   value={formData.price}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       price: parseFloat(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Discount Price (₹)
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={formData.discountPrice || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       discountPrice: e.target.value
//                         ? parseFloat(e.target.value)
//                         : undefined,
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               {/* 🔥 GST */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   GST Rate (%)
//                 </label>
//                 <select
//                   value={formData.gstRate}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       gstRate: parseFloat(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 >
//                   <option value="0" style={{ backgroundColor: "#1f2937" }}>
//                     0%
//                   </option>
//                   <option value="5" style={{ backgroundColor: "#1f2937" }}>
//                     5%
//                   </option>
//                   <option value="12" style={{ backgroundColor: "#1f2937" }}>
//                     12%
//                   </option>
//                   <option value="18" style={{ backgroundColor: "#1f2937" }}>
//                     18%
//                   </option>
//                   <option value="28" style={{ backgroundColor: "#1f2937" }}>
//                     28%
//                   </option>
//                 </select>
//               </div>
//               {/* 🔥 HSN */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   HSN Code
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.hsnCode}
//                   onChange={(e) =>
//                     setFormData({ ...formData, hsnCode: e.target.value })
//                   }
//                   className="form-input"
//                   placeholder="e.g., 8708"
//                 />
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Stock Quantity *
//                 </label>
//                 <input
//                   type="number"
//                   required
//                   min="0"
//                   value={formData.stock}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       stock: parseInt(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Low Stock Alert
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={formData.lowStockThreshold}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       lowStockThreshold: parseInt(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               {/* 🔥 Max Order Qty */}
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Max Qty / User
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={formData.maxOrderQuantity}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       maxOrderQuantity: parseInt(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Warranty
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.warrantyPeriod}
//                   onChange={(e) =>
//                     setFormData({ ...formData, warrantyPeriod: e.target.value })
//                   }
//                   className="form-input"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 🔥 3. Flash Sale Section */}
//           <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-2">
//                 <Zap className="h-5 w-5 text-yellow-400" />
//                 <h2 className="text-xl font-semibold text-white">Flash Sale</h2>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={formData.flashSale.isActive}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       flashSale: {
//                         ...formData.flashSale,
//                         isActive: e.target.checked,
//                       },
//                     })
//                   }
//                   className="sr-only peer"
//                 />
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
//               </label>
//             </div>

//             {formData.flashSale.isActive && (
//               <div className="grid gap-6 md:grid-cols-3">
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-300">
//                     Sale Price (₹)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={formData.flashSale.salePrice}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         flashSale: {
//                           ...formData.flashSale,
//                           salePrice: parseFloat(e.target.value),
//                         },
//                       })
//                     }
//                     className="form-input border-yellow-500/30"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-300">
//                     Start Time
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={formData.flashSale.startTime}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         flashSale: {
//                           ...formData.flashSale,
//                           startTime: e.target.value,
//                         },
//                       })
//                     }
//                     className="form-input border-yellow-500/30"
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-300">
//                     End Time
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={formData.flashSale.endTime}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         flashSale: {
//                           ...formData.flashSale,
//                           endTime: e.target.value,
//                         },
//                       })
//                     }
//                     className="form-input border-yellow-500/30"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 4. Logistics & Policy (Shipping, Return, Inventory) */}
//           <div className="grid gap-8 md:grid-cols-2">
//             {/* Shipping */}
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <Truck className="h-5 w-5 text-blue-400" />
//                 <h2 className="text-xl font-semibold text-white">
//                   Shipping & Dimensions
//                 </h2>
//               </div>
//               <div className="grid gap-4 md:grid-cols-2 rounded-xl bg-white/5 p-4 border border-white/10">
//                 <div>
//                   <label className="text-xs text-gray-400 mb-1 block">
//                     Weight (kg)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.shippingInfo.weight}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         shippingInfo: {
//                           ...formData.shippingInfo,
//                           weight: parseFloat(e.target.value),
//                         },
//                       })
//                     }
//                     className="form-input"
//                     placeholder="0.0"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 mb-1 block">
//                     Length (cm)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.shippingInfo.length}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         shippingInfo: {
//                           ...formData.shippingInfo,
//                           length: parseFloat(e.target.value),
//                         },
//                       })
//                     }
//                     className="form-input"
//                     placeholder="L"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 mb-1 block">
//                     Width (cm)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.shippingInfo.width}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         shippingInfo: {
//                           ...formData.shippingInfo,
//                           width: parseFloat(e.target.value),
//                         },
//                       })
//                     }
//                     className="form-input"
//                     placeholder="W"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 mb-1 block">
//                     Height (cm)
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.shippingInfo.height}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         shippingInfo: {
//                           ...formData.shippingInfo,
//                           height: parseFloat(e.target.value),
//                         },
//                       })
//                     }
//                     className="form-input"
//                     placeholder="H"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Return Policy & Analytics */}
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <RotateCcw className="h-5 w-5 text-orange-400" />
//                 <h2 className="text-xl font-semibold text-white">
//                   Policy & Analytics
//                 </h2>
//               </div>
//               <div className="space-y-4 rounded-xl bg-white/5 p-4 border border-white/10">
//                 <div className="flex items-center justify-between">
//                   <label className="text-sm text-gray-300">
//                     Is Returnable?
//                   </label>
//                   <input
//                     type="checkbox"
//                     checked={formData.returnPolicy.isReturnable}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         returnPolicy: {
//                           ...formData.returnPolicy,
//                           isReturnable: e.target.checked,
//                         },
//                       })
//                     }
//                     className="h-5 w-5 rounded bg-gray-700 border-gray-600"
//                   />
//                 </div>
//                 {formData.returnPolicy.isReturnable && (
//                   <div className="flex gap-4">
//                     <div className="flex-1">
//                       <label className="text-xs text-gray-400 mb-1 block">
//                         Window (Days)
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.returnPolicy.returnWindowDays}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             returnPolicy: {
//                               ...formData.returnPolicy,
//                               returnWindowDays: parseInt(e.target.value),
//                             },
//                           })
//                         }
//                         className="form-input"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <label className="text-xs text-gray-400 mb-1 block">
//                         Restocking Fee (₹)
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.returnPolicy.restockingFee}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             returnPolicy: {
//                               ...formData.returnPolicy,
//                               restockingFee: parseFloat(e.target.value),
//                             },
//                           })
//                         }
//                         className="form-input"
//                       />
//                     </div>
//                   </div>
//                 )}
//                 <div>
//                   <label className="text-xs text-gray-400 mb-1 block">
//                     Supplier Email (For Auto-Reorder)
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.inventoryAnalytics.supplierEmail}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         inventoryAnalytics: {
//                           ...formData.inventoryAnalytics,
//                           supplierEmail: e.target.value,
//                         },
//                       })
//                     }
//                     className="form-input"
//                     placeholder="supplier@example.com"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 5. Compatible Models (Updated with Fuel Type & Variant) */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Compatible Models
//             </h2>
//             <div className="mb-4 grid gap-4 md:grid-cols-6 p-4 rounded-xl bg-white/5 border border-white/10 items-end">
//               <div className="md:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Model *
//                 </label>
//                 <select
//                   value={currentModel.modelName}
//                   onChange={(e) =>
//                     setCurrentModel({
//                       ...currentModel,
//                       modelName: e.target.value,
//                     })
//                   }
//                   className="form-input"
//                 >
//                   <option value="" style={{ backgroundColor: "#1f2937" }}>
//                     Select Model
//                   </option>
//                   {HYUNDAI_MODELS.map((model) => (
//                     <option
//                       key={model}
//                       value={model}
//                       style={{ backgroundColor: "#1f2937" }}
//                     >
//                       {model}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="md:col-span-1">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Year From
//                 </label>
//                 <input
//                   type="number"
//                   value={currentModel.yearFrom}
//                   onChange={(e) =>
//                     setCurrentModel({
//                       ...currentModel,
//                       yearFrom: parseInt(e.target.value),
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div className="md:col-span-1">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Year To
//                 </label>
//                 <input
//                   type="number"
//                   value={currentModel.yearTo || ""}
//                   placeholder="Present"
//                   onChange={(e) =>
//                     setCurrentModel({
//                       ...currentModel,
//                       yearTo: e.target.value
//                         ? parseInt(e.target.value)
//                         : undefined,
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               {/* 🔥 Fuel Type */}
//               <div className="md:col-span-1">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Fuel
//                 </label>
//                 <select
//                   value={currentModel.fuelType}
//                   onChange={(e) =>
//                     setCurrentModel({
//                       ...currentModel,
//                       fuelType: e.target.value as any,
//                     })
//                   }
//                   className="form-input"
//                 >
//                   {FUEL_TYPES.map((f) => (
//                     <option
//                       key={f}
//                       value={f}
//                       style={{ backgroundColor: "#1f2937" }}
//                     >
//                       {f}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* 🔥 Variant */}
//               <div className="md:col-span-1">
//                 <div className="flex flex-col h-full justify-between">
//                   <label className="mb-2 block text-sm font-medium text-gray-300">
//                     Variant
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       placeholder="All/SX"
//                       value={currentModel.variant}
//                       onChange={(e) =>
//                         setCurrentModel({
//                           ...currentModel,
//                           variant: e.target.value,
//                         })
//                       }
//                       className="form-input w-24"
//                     />
//                     <Button
//                       type="button"
//                       onClick={addCompatibleModel}
//                       variant="primary"
//                       className="h-[42px] px-3"
//                     >
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {formData.compatibleModels.length > 0 && (
//               <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
//                 {formData.compatibleModels.map((model, index) => (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="flex items-center justify-between rounded-lg border border-white/10 bg-blue-500/10 p-3"
//                   >
//                     <div className="text-sm">
//                       <p className="font-semibold text-blue-200">
//                         {model.modelName}{" "}
//                         <span className="text-xs text-blue-400">
//                           ({model.fuelType})
//                         </span>
//                       </p>
//                       <p className="text-blue-300/70 text-xs">
//                         {model.yearFrom} - {model.yearTo || "Present"}{" "}
//                         {model.variant ? `• ${model.variant}` : ""}
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeCompatibleModel(index)}
//                       className="text-red-400 hover:text-red-300"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 6. Specifications */}
//           <div>
//             <div className="flex items-center gap-2 mb-4">
//               <Ruler className="h-5 w-5 text-purple-400" />
//               <h2 className="text-xl font-semibold text-white">
//                 Specifications
//               </h2>
//             </div>
//             <div className="space-y-3">
//               {specifications.map((spec, index) => (
//                 <div key={index} className="flex gap-4">
//                   <input
//                     type="text"
//                     placeholder="Key (e.g. Material)"
//                     value={spec.key}
//                     onChange={(e) =>
//                       handleSpecChange(index, "key", e.target.value)
//                     }
//                     className="form-input flex-1"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Value (e.g. Steel)"
//                     value={spec.value}
//                     onChange={(e) =>
//                       handleSpecChange(index, "value", e.target.value)
//                     }
//                     className="form-input flex-1"
//                   />
//                   {index > 0 && (
//                     <button
//                       type="button"
//                       onClick={() => removeSpecRow(index)}
//                       className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
//                     >
//                       <Trash2 className="h-5 w-5" />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <Button
//                 type="button"
//                 onClick={addSpecRow}
//                 variant="secondary"
//                 size="sm"
//                 className="mt-2"
//               >
//                 <Plus className="h-4 w-4 mr-2" /> Add Specification
//               </Button>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 7. Tags */}
//           <div>
//             <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
//               <Tag className="h-4 w-4" /> Product Tags
//             </label>
//             <input
//               type="text"
//               value={tagInput}
//               onChange={(e) => setTagInput(e.target.value)}
//               onKeyDown={handleAddTag}
//               className="form-input"
//               placeholder="Type a tag and press Enter (e.g., 'oem', 'fast-moving')"
//             />
//             <div className="mt-3 flex flex-wrap gap-2">
//               {formData.tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-200 border border-blue-500/30"
//                 >
//                   {tag}
//                   <button
//                     type="button"
//                     onClick={() => removeTag(tag)}
//                     className="hover:text-white"
//                   >
//                     <X className="h-3 w-3" />
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 8. Images */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Product Images
//             </h2>
//             <div className="space-y-4">
//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-12 transition-colors hover:border-blue-500/50 hover:bg-white/10">
//                 <Upload className="mb-3 h-12 w-12 text-gray-400" />
//                 <span className="text-sm font-medium text-white">
//                   Click to upload images
//                 </span>
//                 <span className="mt-1 text-xs text-gray-400">
//                   PNG, JPG up to 5MB (Max 5 images)
//                 </span>
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//               </label>
//               {imagePreviews.length > 0 && (
//                 <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
//                   {imagePreviews.map((preview, index) => (
//                     <motion.div
//                       key={index}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
//                     >
//                       <img
//                         src={preview}
//                         alt={`Preview ${index + 1}`}
//                         className="h-full w-full object-cover"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute right-2 top-2 rounded-full bg-red-500 p-1 opacity-0 transition-opacity group-hover:opacity-100"
//                       >
//                         <X className="h-4 w-4 text-white" />
//                       </button>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-4 pt-4">
//             <Button
//               type="submit"
//               variant="primary"
//               size="lg"
//               isLoading={isLoading}
//               className="flex-1"
//             >
//               Create Product
//             </Button>
//             <Link href="/dashboard/products" className="flex-1">
//               <Button
//                 type="button"
//                 variant="secondary"
//                 size="lg"
//                 className="w-full"
//               >
//                 Cancel
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </motion.form>

//       {/* Input Styles (Keeping your original consistent styles) */}
//       <style jsx global>{`
//         .form-input {
//           width: 100%;
//           border-radius: 0.75rem;
//           border-width: 1px;
//           border-color: rgba(255, 255, 255, 0.1);
//           background-color: rgba(255, 255, 255, 0.05);
//           padding-left: 1rem;
//           padding-right: 1rem;
//           padding-top: 0.75rem;
//           padding-bottom: 0.75rem;
//           color: white;
//           backdrop-filter: blur(4px);
//           transition: all 150ms;
//         }
//         .form-input:focus {
//           border-color: rgba(59, 130, 246, 0.5);
//           background-color: rgba(255, 255, 255, 0.1);
//           outline: 2px solid transparent;
//         }
//         .form-input::placeholder {
//           color: #9ca3af;
//         }
//         input[type="date"]::-webkit-calendar-picker-indicator,
//         input[type="datetime-local"]::-webkit-calendar-picker-indicator {
//           filter: invert(1);
//           opacity: 0.6;
//           cursor: pointer;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Tag,
  Scale,
  Ruler,
  Zap,
  RotateCcw,
  BarChart3,
  Truck,
  FileText,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { ProductService } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

// --- Types Definition ---
type ProductCategory =
  | "Engine"
  | "Brake"
  | "Electrical"
  | "Body"
  | "Accessories"
  | "Suspension"
  | "Transmission"
  | "Interior"
  | "Exterior"
  | "Service Parts";

interface CompatibleModel {
  modelName: string;
  yearFrom: number;
  yearTo?: number;
  variant?: string;
  fuelType: "Petrol" | "Diesel" | "CNG" | "EV" | "Universal";
}

interface ProductFormData {
  name: string;
  partNumber: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  discountPrice?: number;
  gstRate: number;
  hsnCode: string;
  stock: number;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  warrantyPeriod: string;
  manufacturer: string;
  originCountry: string;
  compatibleModels: CompatibleModel[];
  tags: string[];
  isActive: boolean;
  flashSale: {
    isActive: boolean;
    salePrice: number;
    startTime: string;
    endTime: string;
  };
  inventoryAnalytics: {
    reorderLevel: number;
    leadTimeDays: number;
    supplierEmail: string;
  };
  returnPolicy: {
    isReturnable: boolean;
    returnWindowDays: number;
    restockingFee: number;
  };
  shippingInfo: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
}

interface SpecificationItem {
  key: string;
  value: string;
}

const CATEGORIES: ProductCategory[] = [
  "Engine",
  "Brake",
  "Electrical",
  "Body",
  "Accessories",
  "Suspension",
  "Transmission",
  "Interior",
  "Exterior",
  "Service Parts",
];

const HYUNDAI_MODELS = [
  "i10",
  "i20",
  "Venue",
  "Verna",
  "Creta",
  "Alcazar",
  "Tucson",
  "Elantra",
  "Kona",
  "Ioniq 5",
  "Santro",
  "Grand i10",
  "Aura",
  "Exter",
];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "EV", "Universal"];

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get("cloneId");

  const [isLoading, setIsLoading] = useState(false);
  const [isCloningImages, setIsCloningImages] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- Main Form Data ---
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    partNumber: "",
    description: "",
    category: "Engine",
    subcategory: "",
    price: 0,
    discountPrice: 0,
    gstRate: 18,
    hsnCode: "",
    stock: 0,
    lowStockThreshold: 5,
    maxOrderQuantity: 10,
    warrantyPeriod: "No Warranty",
    manufacturer: "Hyundai Mobis",
    originCountry: "India",
    compatibleModels: [],
    tags: [],
    isActive: true,
    flashSale: {
      isActive: false,
      salePrice: 0,
      startTime: "",
      endTime: "",
    },
    inventoryAnalytics: {
      reorderLevel: 10,
      leadTimeDays: 7,
      supplierEmail: "",
    },
    returnPolicy: {
      isReturnable: true,
      returnWindowDays: 7,
      restockingFee: 0,
    },
    shippingInfo: {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
    },
  });

  const [specifications, setSpecifications] = useState<SpecificationItem[]>([
    { key: "", value: "" },
  ]);

  const [currentModel, setCurrentModel] = useState<CompatibleModel>({
    modelName: "",
    yearFrom: new Date().getFullYear(),
    yearTo: undefined,
    variant: "",
    fuelType: "Universal",
  });

  // 🔥 CLONE LOGIC: Robust Handling
  useEffect(() => {
    const fetchCloneData = async () => {
      if (!cloneId) return;
      try {
        setIsLoading(true);
        const res = await ProductService.getById(cloneId);

        // ⭐ Correctly Extract Product from Response
        // Response Structure: { success: true, message: "...", data: { product: { ... } } }
        const product =
          res.data?.data?.product || res.data?.product || res.data;

        if (product) {
          // 1. Map Form Data
          setFormData({
            name: product.name ? `${product.name} (Copy)` : "",
            partNumber: product.partNumber || "",
            description: product.description || "",
            category: product.category || "Engine",
            subcategory: product.subcategory || "",
            price: product.price || 0,
            discountPrice: product.discountPrice || 0,
            gstRate: product.gstRate || 18,
            hsnCode: product.hsnCode || "",
            stock: product.stock || 0,
            lowStockThreshold: product.lowStockThreshold || 5,
            maxOrderQuantity: product.maxOrderQuantity || 10,
            warrantyPeriod: product.warrantyPeriod || "No Warranty",
            manufacturer: product.manufacturer || "Hyundai Mobis",
            originCountry: product.originCountry || "India",
            compatibleModels: product.compatibleModels || [],
            tags: product.tags || [],
            isActive: true, // New clone starts active

            // Nested Objects with Fallbacks
            flashSale: {
              isActive: product.flashSale?.isActive || false,
              salePrice: product.flashSale?.salePrice || 0,
              // Handle Date Strings correctly for input type="datetime-local"
              startTime: product.flashSale?.startTime
                ? new Date(product.flashSale.startTime)
                    .toISOString()
                    .slice(0, 16)
                : "",
              endTime: product.flashSale?.endTime
                ? new Date(product.flashSale.endTime).toISOString().slice(0, 16)
                : "",
            },
            inventoryAnalytics: {
              reorderLevel: product.inventoryAnalytics?.reorderLevel || 10,
              leadTimeDays: product.inventoryAnalytics?.leadTimeDays || 7,
              supplierEmail: product.inventoryAnalytics?.supplierEmail || "",
            },
            returnPolicy: {
              isReturnable: product.returnPolicy?.isReturnable ?? true,
              returnWindowDays: product.returnPolicy?.returnWindowDays || 7,
              restockingFee: product.returnPolicy?.restockingFee || 0,
            },
            shippingInfo: {
              weight: product.shippingInfo?.weight || 0,
              length: product.shippingInfo?.length || 0,
              width: product.shippingInfo?.width || 0,
              height: product.shippingInfo?.height || 0,
            },
          });

          // 2. Handle Specifications (Object -> Array)
          if (
            product.specifications &&
            typeof product.specifications === "object"
          ) {
            const specArray = Object.entries(product.specifications).map(
              ([key, value]) => ({ key, value: String(value) }),
            );
            setSpecifications(
              specArray.length > 0 ? specArray : [{ key: "", value: "" }],
            );
          }

          // 3. Handle Images (Convert Cloudinary URLs -> File Objects)
          if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length > 0
          ) {
            setIsCloningImages(true);
            try {
              const filePromises = product.images.map(
                async (img: any, index: number) => {
                  // Ensure we get the URL string correctly
                  const imgUrl = typeof img === "string" ? img : img.url;

                  if (!imgUrl) return null;

                  // Fetch the image as a blob
                  const response = await fetch(imgUrl);
                  const blob = await response.blob();

                  // Create a File object (simulating user upload)
                  return new File([blob], `cloned_image_${index}.jpg`, {
                    type: blob.type,
                  });
                },
              );

              const files = (await Promise.all(filePromises)).filter(
                Boolean,
              ) as File[];

              setImages(files);

              // Set Previews
              setImagePreviews(
                product.images.map((img: any) =>
                  typeof img === "string" ? img : img.url,
                ),
              );

              toast.success(`Cloned ${files.length} images successfully`);
            } catch (imgError) {
              console.error("Failed to clone images:", imgError);
              toast.warning(
                "Could not automatically clone images. Please re-upload.",
              );
            } finally {
              setIsCloningImages(false);
            }
          }
        }
      } catch (error) {
        console.error("Clone error:", error);
        toast.error("Failed to load product data for cloning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloneData();
  }, [cloneId]);
  // --- Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages([...images, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const addCompatibleModel = () => {
    if (!currentModel.modelName) {
      toast.error("Please select a model");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      compatibleModels: [...prev.compatibleModels, currentModel],
    }));
    setCurrentModel({
      modelName: "",
      yearFrom: new Date().getFullYear(),
      yearTo: undefined,
      variant: "",
      fuelType: "Universal",
    });
  };

  const removeCompatibleModel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compatibleModels: prev.compatibleModels.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpecRow = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpecRow = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (formData.compatibleModels.length === 0) {
      toast.error("Please add at least one compatible model");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();

      // Append Fields
      data.append("name", formData.name);
      data.append("partNumber", formData.partNumber);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (formData.subcategory)
        data.append("subcategory", formData.subcategory);
      data.append("manufacturer", formData.manufacturer);
      data.append("originCountry", formData.originCountry);
      data.append("isActive", formData.isActive.toString());
      data.append("price", formData.price.toString());
      if (formData.discountPrice)
        data.append("discountPrice", formData.discountPrice.toString());
      data.append("gstRate", formData.gstRate.toString());
      data.append("hsnCode", formData.hsnCode);
      data.append("stock", formData.stock.toString());
      data.append("lowStockThreshold", formData.lowStockThreshold.toString());
      data.append("maxOrderQuantity", formData.maxOrderQuantity.toString());
      data.append("warrantyPeriod", formData.warrantyPeriod);

      data.append(
        "compatibleModels",
        JSON.stringify(formData.compatibleModels),
      );
      data.append("tags", JSON.stringify(formData.tags));
      data.append("flashSale", JSON.stringify(formData.flashSale));
      data.append(
        "inventoryAnalytics",
        JSON.stringify(formData.inventoryAnalytics),
      );
      data.append("returnPolicy", JSON.stringify(formData.returnPolicy));
      data.append("shippingInfo", JSON.stringify(formData.shippingInfo));

      const specsObject = specifications.reduce(
        (acc, curr) => {
          if (curr.key.trim() && curr.value.trim()) {
            acc[curr.key.trim()] = curr.value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      );
      data.append("specifications", JSON.stringify(specsObject));

      images.forEach((image) => data.append("images", image));

      await ProductService.create(data);
      toast.success("Product created successfully!");
      router.push("/dashboard/products");
    } catch (error: any) {
      console.error("Create error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Styles ---
  const labelClass =
    "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const inputClass =
    "w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:border-blue-500 bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500 dark:focus:bg-white/10";
  const cardClass =
    "rounded-2xl border p-8 backdrop-blur-sm bg-white border-zinc-200 shadow-sm dark:bg-white/[0.02] dark:border-white/10";
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/dashboard/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border p-2 transition-colors bg-white border-zinc-200 hover:bg-zinc-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            <ArrowLeft className={`h-5 w-5 ${textPrimary}`} />
          </motion.button>
        </Link>
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>
            {cloneId ? "Clone Product" : "Add New Product"}
          </h1>
          <p className={`mt-1 ${textSecondary}`}>
            Create a new spare part listing
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className={cardClass}
      >
        <div className="space-y-8">
          {/* 1. Basic Information */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                Basic Information
              </h2>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
                <span className={`text-sm font-medium ${textSecondary}`}>
                  Status:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 dark:bg-gray-700"></div>
                  <span className={`ms-3 text-sm font-medium ${textPrimary}`}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., Front Brake Pad Set"
                />
              </div>
              <div>
                <label className={labelClass}>Part Number *</label>
                <input
                  type="text"
                  required
                  value={formData.partNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className={inputClass}
                  placeholder="e.g., 58101-C9A70"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Detailed product description..."
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ProductCategory,
                    })
                  }
                  className={inputClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="text-zinc-900 bg-white dark:bg-gray-800 dark:text-white"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Subcategory</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., Brake Pads"
                />
              </div>
              <div>
                <label className={labelClass}>Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., Hyundai Mobis"
                />
              </div>
              <div>
                <label className={labelClass}>Origin Country</label>
                <input
                  type="text"
                  value={formData.originCountry}
                  onChange={(e) =>
                    setFormData({ ...formData, originCountry: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., India"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 2. Pricing & Stock */}
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${textPrimary}`}>
              Pricing & Inventory
            </h2>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <label className={labelClass}>Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Discount Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountPrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPrice: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>GST Rate (%)</label>
                <select
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gstRate: parseFloat(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <option
                      key={rate}
                      value={rate}
                      className="text-zinc-900 bg-white dark:bg-gray-800 dark:text-white"
                    >
                      {rate}%
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>HSN Code</label>
                <input
                  type="text"
                  value={formData.hsnCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hsnCode: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., 8708"
                />
              </div>

              <div>
                <label className={labelClass}>Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Low Stock Alert</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Qty / User</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxOrderQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOrderQuantity: parseInt(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Warranty</label>
                <input
                  type="text"
                  value={formData.warrantyPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyPeriod: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 3. Flash Sale */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-500/20 dark:bg-yellow-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  Flash Sale
                </h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.flashSale.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flashSale: {
                        ...formData.flashSale,
                        isActive: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-yellow-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {formData.flashSale.isActive && (
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Sale Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.flashSale.salePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flashSale: {
                          ...formData.flashSale,
                          salePrice: parseFloat(e.target.value),
                        },
                      })
                    }
                    className={`${inputClass} border-yellow-300 dark:border-yellow-500/30`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.flashSale.startTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flashSale: {
                          ...formData.flashSale,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className={`${inputClass} border-yellow-300 dark:border-yellow-500/30`}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.flashSale.endTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flashSale: {
                          ...formData.flashSale,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className={`${inputClass} border-yellow-300 dark:border-yellow-500/30`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 4. Shipping Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                Shipping & Dimensions
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4 rounded-xl border p-4 bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shippingInfo.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingInfo: {
                        ...formData.shippingInfo,
                        weight: parseFloat(e.target.value),
                      },
                    })
                  }
                  className={inputClass}
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className={labelClass}>Length (cm)</label>
                <input
                  type="number"
                  value={formData.shippingInfo.length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingInfo: {
                        ...formData.shippingInfo,
                        length: parseFloat(e.target.value),
                      },
                    })
                  }
                  className={inputClass}
                  placeholder="L"
                />
              </div>
              <div>
                <label className={labelClass}>Width (cm)</label>
                <input
                  type="number"
                  value={formData.shippingInfo.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingInfo: {
                        ...formData.shippingInfo,
                        width: parseFloat(e.target.value),
                      },
                    })
                  }
                  className={inputClass}
                  placeholder="W"
                />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  value={formData.shippingInfo.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingInfo: {
                        ...formData.shippingInfo,
                        height: parseFloat(e.target.value),
                      },
                    })
                  }
                  className={inputClass}
                  placeholder="H"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 🔥 5. Policy & Analytics (RESTORED) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                Policy & Analytics
              </h2>
            </div>
            <div className="space-y-4 rounded-xl border p-4 bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
              {/* Return Policy */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${textSecondary}`}>
                  Is Returnable?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.returnPolicy.isReturnable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        returnPolicy: {
                          ...formData.returnPolicy,
                          isReturnable: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-700"></div>
                </label>
              </div>

              {formData.returnPolicy.isReturnable && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Return Window (Days)</label>
                    <input
                      type="number"
                      value={formData.returnPolicy.returnWindowDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnPolicy: {
                            ...formData.returnPolicy,
                            returnWindowDays: parseInt(e.target.value),
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Restocking Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.returnPolicy.restockingFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnPolicy: {
                            ...formData.returnPolicy,
                            restockingFee: parseFloat(e.target.value),
                          },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {/* Inventory Analytics */}
              <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-zinc-200 dark:border-white/10">
                <div>
                  <label className={labelClass}>Reorder Level</label>
                  <input
                    type="number"
                    value={formData.inventoryAnalytics.reorderLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventoryAnalytics: {
                          ...formData.inventoryAnalytics,
                          reorderLevel: parseInt(e.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Lead Time (Days)</label>
                  <input
                    type="number"
                    value={formData.inventoryAnalytics.leadTimeDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventoryAnalytics: {
                          ...formData.inventoryAnalytics,
                          leadTimeDays: parseInt(e.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Supplier Email</label>
                  <input
                    type="email"
                    value={formData.inventoryAnalytics.supplierEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventoryAnalytics: {
                          ...formData.inventoryAnalytics,
                          supplierEmail: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 6. Compatible Models */}
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${textPrimary}`}>
              Compatible Models
            </h2>
            <div className="mb-4 grid gap-4 md:grid-cols-6 p-4 rounded-xl border bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10 items-end">
              <div className="md:col-span-2">
                <label className={labelClass}>Model *</label>
                <select
                  value={currentModel.modelName}
                  onChange={(e) =>
                    setCurrentModel({
                      ...currentModel,
                      modelName: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option
                    value=""
                    className="text-zinc-900 bg-white dark:bg-gray-800 dark:text-white"
                  >
                    Select Model
                  </option>
                  {HYUNDAI_MODELS.map((model) => (
                    <option
                      key={model}
                      value={model}
                      className="text-zinc-900 bg-white dark:bg-gray-800 dark:text-white"
                    >
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Year From</label>
                <input
                  type="number"
                  value={currentModel.yearFrom}
                  onChange={(e) =>
                    setCurrentModel({
                      ...currentModel,
                      yearFrom: parseInt(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Year To</label>
                <input
                  type="number"
                  value={currentModel.yearTo || ""}
                  placeholder="Present"
                  onChange={(e) =>
                    setCurrentModel({
                      ...currentModel,
                      yearTo: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Fuel</label>
                <select
                  value={currentModel.fuelType}
                  onChange={(e) =>
                    setCurrentModel({
                      ...currentModel,
                      fuelType: e.target.value as any,
                    })
                  }
                  className={inputClass}
                >
                  {FUEL_TYPES.map((f) => (
                    <option
                      key={f}
                      value={f}
                      className="text-zinc-900 bg-white dark:bg-gray-800 dark:text-white"
                    >
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <div className="flex gap-2">
                  <div className="w-full">
                    <label className={labelClass}>Variant</label>
                    <input
                      type="text"
                      placeholder="All/SX"
                      value={currentModel.variant}
                      onChange={(e) =>
                        setCurrentModel({
                          ...currentModel,
                          variant: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <Button
                      type="button"
                      onClick={addCompatibleModel}
                      variant="primary"
                      className="h-[46px] px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {formData.compatibleModels.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {formData.compatibleModels.map((model, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between rounded-lg border p-3 bg-blue-50 border-blue-100 dark:border-white/10 dark:bg-blue-500/10"
                  >
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {model.modelName}{" "}
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          ({model.fuelType})
                        </span>
                      </p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-300/70">
                        {model.yearFrom} - {model.yearTo || "Present"}{" "}
                        {model.variant ? `• ${model.variant}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCompatibleModel(index)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 7. Specifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                Specifications
              </h2>
            </div>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Key (e.g. Material)"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, "key", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Steel)"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, "value", e.target.value)
                    }
                    className={inputClass}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeSpecRow(index)}
                      className="p-3 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addSpecRow}
                variant="secondary"
                size="sm"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Specification
              </Button>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 8. Tags */}
          <div>
            <label
              className={`mb-2 flex items-center gap-2 text-sm font-medium ${textSecondary}`}
            >
              <Tag className="h-4 w-4" /> Product Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className={inputClass}
              placeholder="Type a tag and press Enter (e.g., 'oem', 'fast-moving')"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border
                    bg-blue-50 text-blue-700 border-blue-200 
                    dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-white/10" />

          {/* 9. Images */}
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${textPrimary}`}>
              Product Images
            </h2>
            <div className="space-y-4">
              <label
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors
                border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-blue-500 
                dark:border-white/20 dark:bg-white/5 dark:hover:border-blue-500/50 dark:hover:bg-white/10"
              >
                <Upload className="mb-3 h-12 w-12 text-zinc-400 dark:text-gray-400" />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {isCloningImages
                    ? "Cloning images..."
                    : "Click to upload images"}
                </span>
                <span className={`mt-1 text-xs ${textSecondary}`}>
                  PNG, JPG up to 5MB (Max 5 images)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isCloningImages}
                />
              </label>
              {isCloningImages && (
                <div className="text-center py-4">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500 mx-auto" />
                  <p className="text-xs text-zinc-500 mt-2">
                    Downloading original images...
                  </p>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading || isCloningImages}
              className="flex-1"
            >
              Create Product
            </Button>
            <Link href="/dashboard/products" className="flex-1">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
