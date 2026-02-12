// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
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
//   Save,
//   Loader2,
//   Zap,
//   RotateCcw,
//   BarChart3,
// } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { ProductService } from "@/lib/api";
// import { toast } from "sonner";
// import Link from "next/link";
// import Image from "next/image";

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
// }

// interface ProductFormData {
//   name: string;
//   partNumber: string;
//   description: string;
//   category: ProductCategory;
//   subcategory: string;
//   price: number;
//   discountPrice?: number;
//   stock: number;
//   lowStockThreshold: number;
//   warrantyPeriod: string;
//   manufacturer: string;
//   compatibleModels: CompatibleModel[];
//   tags: string[];
//   isActive: boolean;
//   // 🔥 New Fields
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

// // Helper: Format Date for Input (YYYY-MM-DDTHH:mm)
// // Helper: Format Date correctly for datetime-local input (Local Time)
// const formatDateForInput = (dateString?: string) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);

//   // Get local date parts to match user's timezone
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");

//   // Return format: YYYY-MM-DDTHH:mm
//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// };

// export default function EditProductPage() {
//   const router = useRouter();
//   const { id } = useParams();

//   const [isFetching, setIsFetching] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   // Images State
//   const [existingImages, setExistingImages] = useState<
//     { url: string; publicId: string; _id?: string }[]
//   >([]);
//   const [newImages, setNewImages] = useState<File[]>([]);
//   const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

//   const [tagInput, setTagInput] = useState("");

//   // Form State
//   const [formData, setFormData] = useState<ProductFormData>({
//     name: "",
//     partNumber: "",
//     description: "",
//     category: "Engine",
//     subcategory: "",
//     price: 0,
//     discountPrice: undefined,
//     stock: 0,
//     lowStockThreshold: 5,
//     warrantyPeriod: "",
//     manufacturer: "",
//     compatibleModels: [],
//     tags: [],
//     isActive: true,
//     flashSale: { isActive: false, salePrice: 0, startTime: "", endTime: "" },
//     inventoryAnalytics: {
//       reorderLevel: 10,
//       leadTimeDays: 7,
//       supplierEmail: "",
//     },
//     returnPolicy: { isReturnable: true, returnWindowDays: 7, restockingFee: 0 },
//     shippingInfo: { weight: 0, length: 0, width: 0, height: 0 },
//   });

//   const [specifications, setSpecifications] = useState<SpecificationItem[]>([
//     { key: "", value: "" },
//   ]);
//   const [currentModel, setCurrentModel] = useState<CompatibleModel>({
//     modelName: "",
//     yearFrom: new Date().getFullYear(),
//     yearTo: undefined,
//     variant: "",
//   });

//   // --- 1. Fetch Product Data ---
//   useEffect(() => {
//     if (id) {
//       fetchProductData();
//     }
//   }, [id]);

//   const fetchProductData = async () => {
//     try {
//       const response = await ProductService.getById(id as string);
//       // Adjust based on your API response structure (e.g., response.data.data.product or response.data.product)
//       const product =
//         response.data.data?.product || response.data.product || response.data;

//       // Map API Data to State
//       setFormData({
//         name: product.name,
//         partNumber: product.partNumber,
//         description: product.description,
//         category: product.category as ProductCategory,
//         subcategory: product.subcategory || "",
//         price: product.price,
//         discountPrice: product.discountPrice,
//         stock: product.stock,
//         lowStockThreshold: product.lowStockThreshold || 5,
//         warrantyPeriod: product.warrantyPeriod || "",
//         manufacturer: product.manufacturer || "",
//         compatibleModels: product.compatibleModels || [],
//         tags: product.tags || [],
//         isActive: product.isActive,
//         // Map Nested Objects (with fallbacks)
//         flashSale: {
//           isActive: product.flashSale?.isActive || false,
//           salePrice: product.flashSale?.salePrice || 0,
//           startTime: formatDateForInput(product.flashSale?.startTime),
//           endTime: formatDateForInput(product.flashSale?.endTime),
//         },
//         inventoryAnalytics: product.inventoryAnalytics || {
//           reorderLevel: 10,
//           leadTimeDays: 7,
//           supplierEmail: "",
//         },
//         returnPolicy: product.returnPolicy || {
//           isReturnable: true,
//           returnWindowDays: 7,
//           restockingFee: 0,
//         },
//         shippingInfo: product.shippingInfo || {
//           weight: 0,
//           length: 0,
//           width: 0,
//           height: 0,
//         },
//       });

//       // Images
//       if (product.images) setExistingImages(product.images);

//       // Specifications (Object to Array)
//       if (product.specifications) {
//         const specsArray = Object.entries(product.specifications).map(
//           ([key, value]) => ({
//             key,
//             value: value as string,
//           }),
//         );
//         setSpecifications(
//           specsArray.length > 0 ? specsArray : [{ key: "", value: "" }],
//         );
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load product details");
//       router.push("/dashboard/products");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   // --- 2. Handlers ---

//   const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (existingImages.length + newImages.length + files.length > 5) {
//       toast.error("Maximum 5 images allowed total");
//       return;
//     }
//     setNewImages([...newImages, ...files]);
//     files.forEach((file) => {
//       const reader = new FileReader();
//       reader.onloadend = () =>
//         setNewImagePreviews((prev) => [...prev, reader.result as string]);
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeNewImage = (index: number) => {
//     setNewImages((prev) => prev.filter((_, i) => i !== index));
//     setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
//   };

//   // Delete Existing Image via API
//   const removeExistingImage = (index: number) => {
//     const imageToDelete = existingImages[index];
//     if (!imageToDelete?._id) return;

//     toast("Are you sure?", {
//       description: "This will permanently delete the image.",
//       action: {
//         label: "Delete",
//         onClick: async () => {
//           const loadingToast = toast.loading("Deleting image...");
//           try {
//             await ProductService.deleteImage(id as string, imageToDelete._id!);
//             setExistingImages((prev) => prev.filter((_, i) => i !== index));
//             toast.dismiss(loadingToast);
//             toast.success("Image deleted");
//           } catch (error: any) {
//             toast.dismiss(loadingToast);
//             toast.error("Failed to delete image");
//           }
//         },
//       },
//       cancel: {
//         label: "Cancel",
//         onClick: () => {
//           console.log("Toast cancelled");
//         },
//       },
//     });
//   };

//   // ... (Reused Logic: Compatible Models, Specs, Tags) ...
//   const addCompatibleModel = () => {
//     if (!currentModel.modelName) return toast.error("Select a model");
//     setFormData((p) => ({
//       ...p,
//       compatibleModels: [...p.compatibleModels, currentModel],
//     }));
//     setCurrentModel({
//       modelName: "",
//       yearFrom: new Date().getFullYear(),
//       yearTo: undefined,
//       variant: "",
//     });
//   };
//   const removeCompatibleModel = (i: number) => {
//     setFormData((p) => ({
//       ...p,
//       compatibleModels: p.compatibleModels.filter((_, idx) => idx !== i),
//     }));
//   };
//   const handleSpecChange = (i: number, f: "key" | "value", v: string) => {
//     const s = [...specifications];
//     s[i][f] = v;
//     setSpecifications(s);
//   };
//   const addSpecRow = () =>
//     setSpecifications([...specifications, { key: "", value: "" }]);
//   const removeSpecRow = (i: number) =>
//     setSpecifications(specifications.filter((_, idx) => idx !== i));
//   const handleAddTag = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && tagInput.trim()) {
//       e.preventDefault();
//       if (!formData.tags.includes(tagInput.trim()))
//         setFormData((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
//       setTagInput("");
//     }
//   };
//   const removeTag = (t: string) =>
//     setFormData((p) => ({ ...p, tags: p.tags.filter((tag) => tag !== t) }));

//   // --- 3. Submit Handler (Update) ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);

//     try {
//       const data = new FormData();

//       // Basic Fields
//       data.append("name", formData.name);
//       data.append("partNumber", formData.partNumber);
//       data.append("description", formData.description);
//       data.append("category", formData.category);
//       if (formData.subcategory)
//         data.append("subcategory", formData.subcategory);
//       data.append("price", formData.price.toString());
//       if (formData.discountPrice)
//         data.append("discountPrice", formData.discountPrice.toString());
//       data.append("stock", formData.stock.toString());
//       data.append("lowStockThreshold", formData.lowStockThreshold.toString());
//       data.append("warrantyPeriod", formData.warrantyPeriod);
//       data.append("manufacturer", formData.manufacturer);
//       data.append("isActive", formData.isActive.toString());

//       // Complex Fields (JSON.stringify)
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
//           if (curr.key.trim() && curr.value.trim())
//             acc[curr.key.trim()] = curr.value.trim();
//           return acc;
//         },
//         {} as Record<string, string>,
//       );
//       data.append("specifications", JSON.stringify(specsObject));

//       // New Images Only (Backend appends these to existing)
//       newImages.forEach((image) => data.append("images", image));

//       await ProductService.update(id as string, data);

//       toast.success("Product updated successfully!");
//       router.push("/dashboard/products");
//     } catch (error: any) {
//       console.error("Update error:", error);
//       toast.error(error.response?.data?.message || "Failed to update product");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isFetching) {
//     return (
//       <div className="flex h-[80vh] items-center justify-center">
//         <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-20">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-center gap-4"
//       >
//         <Link href="/dashboard/products">
//           <button className="rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10">
//             <ArrowLeft className="h-5 w-5 text-white" />
//           </button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-white">Edit Product</h1>
//           <p className="mt-1 text-gray-400">
//             Update product details and configuration
//           </p>
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
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={formData.isActive}
//                   onChange={(e) =>
//                     setFormData({ ...formData, isActive: e.target.checked })
//                   }
//                   className="sr-only peer"
//                 />
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
//                 <span className="ms-3 text-sm font-medium text-white">
//                   {formData.isActive ? "Active Listing" : "Draft"}
//                 </span>
//               </label>
//             </div>

//             <div className="grid gap-6 md:grid-cols-2">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Product Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Part Number
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
//                 />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Description
//                 </label>
//                 <textarea
//                   required
//                   rows={4}
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Category
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
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 2. Pricing & Stock */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Pricing & Stock
//             </h2>
//             <div className="grid gap-6 md:grid-cols-4">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Price (₹)
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
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Stock Quantity
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
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 🔥 3. Flash Sale */}
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
//                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
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
//                     className="form-input border-yellow-500/30 focus:border-yellow-500"
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
//                     className="form-input border-yellow-500/30 focus:border-yellow-500"
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
//                     className="form-input border-yellow-500/30 focus:border-yellow-500"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* 4. Shipping Info */}
//           <div>
//             <div className="flex items-center gap-2 mb-4">
//               <Scale className="h-5 w-5 text-blue-400" />
//               <h2 className="text-xl font-semibold text-white">
//                 Shipping & Dimensions
//               </h2>
//             </div>
//             <div className="grid gap-6 md:grid-cols-4">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Weight (kg)
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={formData.shippingInfo.weight}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       shippingInfo: {
//                         ...formData.shippingInfo,
//                         weight: parseFloat(e.target.value),
//                       },
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//               <div className="md:col-span-3">
//                 <label className="mb-2 block text-sm font-medium text-gray-300">
//                   Dimensions (L x W x H) in cm
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     placeholder="L"
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
//                     className="form-input w-full"
//                   />
//                   <input
//                     type="number"
//                     placeholder="W"
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
//                     className="form-input w-full"
//                   />
//                   <input
//                     type="number"
//                     placeholder="H"
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
//                     className="form-input w-full"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 5. Compatible Models & Specs (Same UI as Add Page) */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Compatible Models
//             </h2>
//             <div className="mb-4 grid gap-4 md:grid-cols-5 p-4 rounded-xl bg-white/5 border border-white/10">
//               <div className="md:col-span-2">
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
//                   <option value="">Select Model</option>
//                   {HYUNDAI_MODELS.map((model) => (
//                     <option
//                       key={model}
//                       value={model}
//                       style={{ backgroundColor: "#1f2937", color: "white" }}
//                     >
//                       {model}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <input
//                 type="number"
//                 placeholder="From"
//                 value={currentModel.yearFrom}
//                 onChange={(e) =>
//                   setCurrentModel({
//                     ...currentModel,
//                     yearFrom: parseInt(e.target.value),
//                   })
//                 }
//                 className="form-input"
//               />
//               <input
//                 type="number"
//                 placeholder="To"
//                 value={currentModel.yearTo || ""}
//                 onChange={(e) =>
//                   setCurrentModel({
//                     ...currentModel,
//                     yearTo: e.target.value
//                       ? parseInt(e.target.value)
//                       : undefined,
//                   })
//                 }
//                 className="form-input"
//               />
//               <div className="flex items-end">
//                 <Button
//                   type="button"
//                   onClick={addCompatibleModel}
//                   variant="primary"
//                 >
//                   <Plus className="h-4 w-4" /> Add
//                 </Button>
//               </div>
//             </div>
//             {formData.compatibleModels.length > 0 && (
//               <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
//                 {formData.compatibleModels.map((model, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between rounded-lg border border-white/10 bg-blue-500/10 p-3"
//                   >
//                     <div className="text-sm">
//                       <p className="font-semibold text-blue-200">
//                         {model.modelName}
//                       </p>
//                       <p className="text-blue-300/70 text-xs">
//                         {model.yearFrom} - {model.yearTo || "Present"}
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeCompatibleModel(index)}
//                       className="text-red-400 hover:text-red-300"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* 6. Specifications (Dynamic) */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">
//               Specifications
//             </h2>
//             <div className="space-y-3">
//               {specifications.map((spec, index) => (
//                 <div key={index} className="flex gap-4">
//                   <input
//                     type="text"
//                     placeholder="Key"
//                     value={spec.key}
//                     onChange={(e) =>
//                       handleSpecChange(index, "key", e.target.value)
//                     }
//                     className="form-input flex-1"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Value"
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
//                       className="p-3 rounded-xl bg-red-500/10 text-red-400"
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
//                 <Plus className="h-4 w-4 mr-2" /> Add
//               </Button>
//             </div>
//           </div>

//           {/* 7. Inventory & Returns */}
//           <div className="grid md:grid-cols-2 gap-8">
//             <div>
//               <h2 className="text-xl font-semibold text-white mb-4">
//                 Inventory Analytics
//               </h2>
//               <div className="space-y-4 rounded-xl bg-white/5 p-4 border border-white/10">
//                 <input
//                   type="number"
//                   placeholder="Reorder Level"
//                   value={formData.inventoryAnalytics.reorderLevel}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       inventoryAnalytics: {
//                         ...formData.inventoryAnalytics,
//                         reorderLevel: parseInt(e.target.value),
//                       },
//                     })
//                   }
//                   className="form-input"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Lead Time (Days)"
//                   value={formData.inventoryAnalytics.leadTimeDays}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       inventoryAnalytics: {
//                         ...formData.inventoryAnalytics,
//                         leadTimeDays: parseInt(e.target.value),
//                       },
//                     })
//                   }
//                   className="form-input"
//                 />
//                 <input
//                   type="email"
//                   placeholder="Supplier Email"
//                   value={formData.inventoryAnalytics.supplierEmail}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       inventoryAnalytics: {
//                         ...formData.inventoryAnalytics,
//                         supplierEmail: e.target.value,
//                       },
//                     })
//                   }
//                   className="form-input"
//                 />
//               </div>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-white mb-4">
//                 Return Policy
//               </h2>
//               <div className="space-y-4 rounded-xl bg-white/5 p-4 border border-white/10">
//                 <div className="flex justify-between">
//                   <label className="text-sm text-gray-400">
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
//                     className="h-5 w-5"
//                   />
//                 </div>
//                 {formData.returnPolicy.isReturnable && (
//                   <>
//                     <input
//                       type="number"
//                       placeholder="Return Window (Days)"
//                       value={formData.returnPolicy.returnWindowDays}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           returnPolicy: {
//                             ...formData.returnPolicy,
//                             returnWindowDays: parseInt(e.target.value),
//                           },
//                         })
//                       }
//                       className="form-input"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Restocking Fee (₹)"
//                       value={formData.returnPolicy.restockingFee}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           returnPolicy: {
//                             ...formData.returnPolicy,
//                             restockingFee: parseFloat(e.target.value),
//                           },
//                         })
//                       }
//                       className="form-input"
//                     />
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="h-px bg-white/10" />

//           {/* 8. Other Details & Tags */}
//           <div className="grid gap-6 md:grid-cols-2">
//             <input
//               type="text"
//               placeholder="Warranty Period"
//               value={formData.warrantyPeriod}
//               onChange={(e) =>
//                 setFormData({ ...formData, warrantyPeriod: e.target.value })
//               }
//               className="form-input"
//             />
//             <input
//               type="text"
//               placeholder="Manufacturer"
//               value={formData.manufacturer}
//               onChange={(e) =>
//                 setFormData({ ...formData, manufacturer: e.target.value })
//               }
//               className="form-input"
//             />
//           </div>
//           <div>
//             <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
//               <Tag className="h-4 w-4" /> Tags
//             </label>
//             <input
//               type="text"
//               value={tagInput}
//               onChange={(e) => setTagInput(e.target.value)}
//               onKeyDown={handleAddTag}
//               className="form-input"
//               placeholder="Type tag & Enter"
//             />
//             <div className="mt-3 flex flex-wrap gap-2">
//               {formData.tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-200 border border-blue-500/30"
//                 >
//                   {tag}{" "}
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

//           {/* 9. Images (Edit Mode) */}
//           <div>
//             <h2 className="mb-4 text-xl font-semibold text-white">Images</h2>
//             <div className="space-y-4">
//               {existingImages.length > 0 && (
//                 <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
//                   {existingImages.map((img, index) => (
//                     <div
//                       key={index}
//                       className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
//                     >
//                       <Image
//                         src={img.url}
//                         alt="product"
//                         fill
//                         className="object-cover"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeExistingImage(index)}
//                         className="absolute right-2 top-2 rounded-full bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 className="h-4 w-4 text-white" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-8 hover:bg-white/10">
//                 <Upload className="mb-2 h-8 w-8 text-gray-400" />
//                 <span className="text-sm font-medium text-white">
//                   Upload New Images
//                 </span>
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleNewImageChange}
//                   className="hidden"
//                 />
//               </label>
//               {newImagePreviews.length > 0 && (
//                 <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 mt-4">
//                   {newImagePreviews.map((preview, index) => (
//                     <div
//                       key={index}
//                       className="relative aspect-square overflow-hidden rounded-xl border border-green-500/30"
//                     >
//                       <Image
//                         src={preview}
//                         alt="new"
//                         fill
//                         className="object-cover opacity-80"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-bold text-white">
//                         NEW
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeNewImage(index)}
//                         className="absolute right-2 top-2 rounded-full bg-red-500 p-1"
//                       >
//                         <X className="h-4 w-4 text-white" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Submit */}
//           <div className="flex gap-4 pt-4 border-t border-white/10">
//             <Button
//               type="submit"
//               variant="primary"
//               size="lg"
//               isLoading={isSaving}
//               className="flex-1"
//             >
//               <Save className="h-4 w-4 mr-2" /> Save Changes
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

//       {/* Styles */}
//       <style jsx global>{`
//         .form-input {
//           width: 100%;
//           border-radius: 0.75rem;
//           border-width: 1px;
//           border-color: rgba(255, 255, 255, 0.1);
//           background-color: rgba(255, 255, 255, 0.05);
//           padding: 0.75rem 1rem;
//           color: white;
//           outline: none;
//           transition: all 0.2s;
//         }
//         .form-input:focus {
//           border-color: rgba(59, 130, 246, 0.5);
//           background-color: rgba(255, 255, 255, 0.1);
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Save,
  Loader2,
  Zap,
  RotateCcw,
  BarChart3,
  Truck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { ProductService } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

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
  variant?: string; // 🔥 Added
  fuelType: "Petrol" | "Diesel" | "CNG" | "EV" | "Universal"; // 🔥 Added
}

interface ProductFormData {
  name: string;
  partNumber: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  discountPrice?: number;
  // 🔥 New Pricing Fields
  gstRate: number;
  hsnCode: string;

  stock: number;
  lowStockThreshold: number;
  maxOrderQuantity: number; // 🔥 Added

  warrantyPeriod: string;
  manufacturer: string;
  originCountry: string; // 🔥 Added

  compatibleModels: CompatibleModel[];
  tags: string[];
  isActive: boolean;

  flashSale: {
    isActive: boolean;
    salePrice?: number;
    startTime?: string;
    endTime?: string;
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

// Helper: Format Date for Input
const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Images State
  const [existingImages, setExistingImages] = useState<
    { url: string; publicId: string; _id?: string }[]
  >([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [tagInput, setTagInput] = useState("");

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    partNumber: "",
    description: "",
    category: "Engine",
    subcategory: "",
    price: 0,
    discountPrice: undefined,
    gstRate: 18,
    hsnCode: "",
    stock: 0,
    lowStockThreshold: 5,
    maxOrderQuantity: 10,
    warrantyPeriod: "",
    manufacturer: "",
    originCountry: "India",
    compatibleModels: [],
    tags: [],
    isActive: true,
    flashSale: { isActive: false, salePrice: 0, startTime: "", endTime: "" },
    inventoryAnalytics: {
      reorderLevel: 10,
      leadTimeDays: 7,
      supplierEmail: "",
    },
    returnPolicy: { isReturnable: true, returnWindowDays: 7, restockingFee: 0 },
    shippingInfo: { weight: 0, length: 0, width: 0, height: 0 },
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

  // --- 1. Fetch Product Data ---
  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await ProductService.getById(id as string);
      const product =
        response.data.data?.product || response.data.product || response.data;

      // Map API Data to State
      setFormData({
        name: product.name,
        partNumber: product.partNumber,
        description: product.description,
        category: product.category as ProductCategory,
        subcategory: product.subcategory || "",
        price: product.price,
        discountPrice: product.discountPrice,
        gstRate: product.gstRate || 18,
        hsnCode: product.hsnCode || "",
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold || 5,
        maxOrderQuantity: product.maxOrderQuantity || 10,
        warrantyPeriod: product.warrantyPeriod || "",
        manufacturer: product.manufacturer || "",
        originCountry: product.originCountry || "India",
        compatibleModels: product.compatibleModels || [],
        tags: product.tags || [],
        isActive: product.isActive,
        flashSale: {
          isActive: product.flashSale?.isActive || false,
          salePrice: product.flashSale?.salePrice || 0,
          startTime: formatDateForInput(product.flashSale?.startTime),
          endTime: formatDateForInput(product.flashSale?.endTime),
        },
        inventoryAnalytics: product.inventoryAnalytics || {
          reorderLevel: 10,
          leadTimeDays: 7,
          supplierEmail: "",
        },
        returnPolicy: product.returnPolicy || {
          isReturnable: true,
          returnWindowDays: 7,
          restockingFee: 0,
        },
        shippingInfo: product.shippingInfo || {
          weight: 0,
          length: 0,
          width: 0,
          height: 0,
        },
      });

      if (product.images) setExistingImages(product.images);

      if (product.specifications) {
        const specsArray = Object.entries(product.specifications).map(
          ([key, value]) => ({ key, value: value as string }),
        );
        setSpecifications(
          specsArray.length > 0 ? specsArray : [{ key: "", value: "" }],
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load product details");
      router.push("/dashboard/products");
    } finally {
      setIsFetching(false);
    }
  };

  // --- 2. Handlers ---

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + newImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed total");
      return;
    }
    setNewImages([...newImages, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToDelete = existingImages[index];
    if (!imageToDelete?._id) return;

    toast("Are you sure?", {
      description: "This will permanently delete the image.",
      action: {
        label: "Delete",
        onClick: async () => {
          const loadingToast = toast.loading("Deleting image...");
          try {
            await ProductService.deleteImage(id as string, imageToDelete._id!);
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
            toast.dismiss(loadingToast);
            toast.success("Image deleted");
          } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error("Failed to delete image");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const addCompatibleModel = () => {
    if (!currentModel.modelName) return toast.error("Select a model");
    setFormData((p) => ({
      ...p,
      compatibleModels: [...p.compatibleModels, currentModel],
    }));
    setCurrentModel({
      modelName: "",
      yearFrom: new Date().getFullYear(),
      yearTo: undefined,
      variant: "",
      fuelType: "Universal",
    });
  };

  const removeCompatibleModel = (i: number) => {
    setFormData((p) => ({
      ...p,
      compatibleModels: p.compatibleModels.filter((_, idx) => idx !== i),
    }));
  };

  const handleSpecChange = (i: number, f: "key" | "value", v: string) => {
    const s = [...specifications];
    s[i][f] = v;
    setSpecifications(s);
  };

  const addSpecRow = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpecRow = (i: number) =>
    setSpecifications(specifications.filter((_, idx) => idx !== i));

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim()))
        setFormData((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (t: string) =>
    setFormData((p) => ({ ...p, tags: p.tags.filter((tag) => tag !== t) }));

  // --- 3. Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = new FormData();

      // Basic Fields
      data.append("name", formData.name);
      data.append("partNumber", formData.partNumber);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (formData.subcategory)
        data.append("subcategory", formData.subcategory);
      data.append("price", formData.price.toString());
      if (formData.discountPrice)
        data.append("discountPrice", formData.discountPrice.toString());

      // 🔥 New Pricing & Tax
      data.append("gstRate", formData.gstRate.toString());
      data.append("hsnCode", formData.hsnCode);

      data.append("stock", formData.stock.toString());
      data.append("lowStockThreshold", formData.lowStockThreshold.toString());
      data.append("maxOrderQuantity", formData.maxOrderQuantity.toString()); // 🔥 Added

      data.append("warrantyPeriod", formData.warrantyPeriod);
      data.append("manufacturer", formData.manufacturer);
      data.append("originCountry", formData.originCountry); // 🔥 Added
      data.append("isActive", formData.isActive.toString());

      // Complex Fields (JSON.stringify)
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

      // Specifications Map
      const specsObject = specifications.reduce(
        (acc, curr) => {
          if (curr.key.trim() && curr.value.trim())
            acc[curr.key.trim()] = curr.value.trim();
          return acc;
        },
        {} as Record<string, string>,
      );
      data.append("specifications", JSON.stringify(specsObject));

      // New Images Only
      newImages.forEach((image) => data.append("images", image));

      await ProductService.update(id as string, data);

      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

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
          <button className="rounded-xl border p-2 transition-colors bg-white border-zinc-200 hover:bg-zinc-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
            <ArrowLeft className={`h-5 w-5 ${textPrimary}`} />
          </button>
        </Link>
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Edit Product</h1>
          <p className={`mt-1 ${textSecondary}`}>
            Update product details and configuration
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
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full dark:bg-gray-700"></div>
                <span className={`ms-3 text-sm font-medium ${textPrimary}`}>
                  {formData.isActive ? "Active Listing" : "Draft"}
                </span>
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Part Number</label>
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
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Category</label>
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
                />
              </div>
              {/* 🔥 New Fields: Origin & Manufacturer */}
              <div>
                <label className={labelClass}>Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  className={inputClass}
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

          {/* 2. Pricing & Stock (With GST/HSN) */}
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${textPrimary}`}>
              Pricing & Inventory
            </h2>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <label className={labelClass}>Price (₹)</label>
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
              {/* 🔥 GST */}
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
              {/* 🔥 HSN */}
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
                <label className={labelClass}>Stock Quantity</label>
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
              {/* 🔥 Max Order Qty */}
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

          {/* 3. Flash Sale Section */}
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

          {/* 4. Logistics & Policy (Shipping, Return, Inventory) */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Shipping */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  Shipping & Dimensions
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 rounded-xl border p-4 bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
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

            {/* Return Policy & Analytics */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <h2 className={`text-xl font-semibold ${textPrimary}`}>
                  Policy & Analytics
                </h2>
              </div>
              <div className="space-y-4 rounded-xl border p-4 bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className={`text-sm ${textSecondary}`}>
                    Is Returnable?
                  </label>
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
                    className="h-5 w-5 rounded border-zinc-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {formData.returnPolicy.isReturnable && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={labelClass}>Window (Days)</label>
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
                    <div className="flex-1">
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
                <div>
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

          {/* 5. Compatible Models (Updated with Fuel Type & Variant) */}
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
              {/* 🔥 Fuel Type */}
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
              {/* 🔥 Variant */}
              <div className="md:col-span-1">
                <div className="flex flex-col h-full justify-between">
                  <label className={labelClass}>Variant</label>
                  <div className="flex gap-2">
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
                      className={`${inputClass} w-24`}
                    />
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

          {/* 6. Specifications */}
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

          {/* 7. Tags */}
          <div>
            <label
              className={`mb-2 flex items-center gap-2 text-sm font-medium ${textSecondary}`}
            >
              <Tag className="h-4 w-4" /> Tags
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

          {/* 8. Images */}
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${textPrimary}`}>
              Product Images
            </h2>
            <div className="space-y-4">
              {existingImages.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {existingImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10"
                    >
                      <Image
                        src={img.url}
                        alt="product"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors
                border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-blue-500 
                dark:border-white/20 dark:bg-white/5 dark:hover:border-blue-500/50 dark:hover:bg-white/10"
              >
                <Upload className="mb-2 h-8 w-8 text-zinc-400 dark:text-gray-400" />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  Upload New Images
                </span>
                <span className={`mt-1 text-xs ${textSecondary}`}>
                  PNG, JPG up to 5MB (Max 5 images)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImageChange}
                  className="hidden"
                />
              </label>
              {newImagePreviews.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 mt-4">
                  {newImagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-green-500/30"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-bold text-white">
                        NEW
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
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
          <div className="flex gap-4 pt-4 border-t border-zinc-200 dark:border-white/10">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" /> Save Changes
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
