"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
  Check,
  Palette,
  ExternalLink,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

// --- TYPES ---
interface CarouselSlide {
  _id?: string;
  title: string;
  subtitle: string;
  discount: string;
  description: string;
  buttonText: string;
  link: string;
  image?: string;
  bgClass: string;
  textClass: string;
  buttonClass: string;
  isActive: boolean;
  order: number;
}

// --- 🎨 THEME PRESETS ---
const THEME_PRESETS = [
  {
    name: "Ocean Blue",
    bg: "bg-gradient-to-br from-blue-600 to-cyan-400",
    text: "text-white",
    btn: "bg-white text-blue-600",
    preview: "from-blue-600 to-cyan-400",
  },
  {
    name: "Midnight Purple",
    bg: "bg-gradient-to-br from-purple-900 to-indigo-800",
    text: "text-purple-100",
    btn: "bg-purple-500 text-white",
    preview: "from-purple-900 to-indigo-800",
  },
  {
    name: "Sunset",
    bg: "bg-gradient-to-br from-orange-500 to-red-500",
    text: "text-white",
    btn: "bg-white text-orange-600",
    preview: "from-orange-500 to-red-500",
  },
  {
    name: "Emerald City",
    bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
    text: "text-white",
    btn: "bg-white text-teal-600",
    preview: "from-emerald-500 to-teal-500",
  },
  {
    name: "Charcoal",
    bg: "bg-gradient-to-br from-gray-900 to-black",
    text: "text-gray-100",
    btn: "bg-white text-black",
    preview: "from-gray-900 to-black",
  },
];

const initialSlide: CarouselSlide = {
  title: "",
  subtitle: "",
  discount: "",
  description: "",
  buttonText: "Shop Now",
  link: "/products",
  image: "",
  bgClass: THEME_PRESETS[0].bg,
  textClass: THEME_PRESETS[0].text,
  buttonClass: THEME_PRESETS[0].btn,
  isActive: true,
  order: 0,
};

// --- STYLES ---
const pageBackground =
  "fixed inset-0 bg-white dark:bg-[#0a0a0a] -z-20 transition-colors duration-300";
const ambientGlow =
  "fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(76,29,149,0.05),_rgba(0,0,0,0))] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(76,29,149,0.15),_rgba(0,0,0,0))] -z-10 pointer-events-none";

const glassCard =
  "backdrop-blur-xl border shadow-xl rounded-2xl overflow-hidden transition-all duration-300 group relative " +
  "bg-white border-zinc-200 hover:border-zinc-300 " + // Light Mode
  "dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20"; // Dark Mode

const glassModal =
  "backdrop-blur-2xl border shadow-2xl rounded-2xl " +
  "bg-white border-zinc-200 " + // Light Mode
  "dark:bg-[#121212]/95 dark:border-white/10"; // Dark Mode

const glassInput =
  "w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border " +
  "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 " + // Light Mode
  "dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500/50 dark:focus:bg-white/10"; // Dark Mode

const glassButton =
  "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all active:scale-95 shadow-lg hover:shadow-xl";

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<CarouselSlide>(initialSlide);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/carousel/admin/all");
      if (res.data.success) setSlides(res.data.data);
    } catch (error) {
      toast.error("Failed to load slides");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentSlide({ ...currentSlide, image: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(currentSlide).forEach((key) => {
        const value = currentSlide[key as keyof CarouselSlide];
        if (key !== "image" && key !== "_id") {
          formData.append(key, String(value));
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing && currentSlide._id) {
        await api.put(`/carousel/${currentSlide._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Updated successfully!");
      } else {
        await api.post("/carousel", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Created successfully!");
      }
      closeModal();
      fetchSlides();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/carousel/${id}`);
      toast.success("Deleted!");
      fetchSlides();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const toggleStatus = async (slide: CarouselSlide) => {
    try {
      await api.put(`/carousel/${slide._id}`, {
        ...slide,
        isActive: !slide.isActive,
      });
      fetchSlides();
      toast.success(slide.isActive ? "Slide hidden" : "Slide activated");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleThemeSelect = (theme: (typeof THEME_PRESETS)[0]) => {
    setCurrentSlide({
      ...currentSlide,
      bgClass: theme.bg,
      textClass: theme.text,
      buttonClass: theme.btn,
    });
  };

  const openModal = (slide?: CarouselSlide) => {
    if (slide) {
      setCurrentSlide(slide);
      setImagePreview(slide.image || null);
      setIsEditing(true);
    } else {
      setCurrentSlide(initialSlide);
      setImagePreview(null);
      setIsEditing(false);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSlide(initialSlide);
    setImageFile(null);
    setImagePreview(null);
  };

  // Common Text Styles
  const textPrimary = "text-zinc-900 dark:text-white";
  const textSecondary = "text-zinc-500 dark:text-gray-400";

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans relative overflow-hidden text-zinc-900 dark:text-gray-100 transition-colors duration-300">
      {/* Background Effects */}
      <div className={pageBackground}></div>
      <div className={ambientGlow}></div>
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 p-6 rounded-3xl backdrop-blur-xl border shadow-lg
          bg-white/80 border-zinc-200 
          dark:bg-white/5 dark:border-white/10 dark:shadow-2xl"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Carousel Manager
            </h1>
            <p
              className={`mt-2 text-sm flex items-center gap-2 ${textSecondary}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Manage your homepage banners live
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className={`${glassButton} bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/20 shadow-blue-500/20`}
          >
            <Plus size={20} />
            <span>Add New Slide</span>
          </button>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 h-10 w-10" />
          </div>
        ) : (
          /* SLIDES GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {slides.map((slide) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={slide._id}
                  className={glassCard}
                >
                  {/* Visual Preview */}
                  <div
                    className={`h-48 w-full relative overflow-hidden flex flex-col justify-center px-8 
                    ${!slide.image ? slide.bgClass : "bg-gray-100 dark:bg-gray-900"}`}
                  >
                    {/* IMAGE BACKGROUND */}
                    {slide.image && (
                      <>
                        <img
                          src={slide.image}
                          alt="Slide Bg"
                          className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent dark:from-black/80"></div>
                      </>
                    )}

                    {/* Fallback Texture */}
                    {!slide.image && (
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                    )}

                    <div className="relative z-10 space-y-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border inline-block shadow-sm backdrop-blur-md
                        bg-white/90 text-zinc-900 border-white/20
                        dark:bg-black/30 dark:text-white dark:border-white/10"
                      >
                        {slide.discount}
                      </span>
                      <h3
                        className={`text-2xl font-bold leading-tight line-clamp-1 drop-shadow-sm 
                        ${slide.image ? "text-white" : slide.textClass}`}
                      >
                        {slide.title}
                      </h3>
                      <p
                        className={`text-xs font-medium line-clamp-1 
                        ${slide.image ? "text-gray-100" : slide.textClass} opacity-90`}
                      >
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-4 right-4 z-20">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold rounded-full border backdrop-blur-xl shadow-lg flex items-center gap-1.5 ${
                          slide.isActive
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-white dark:border-green-500/30"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${slide.isActive ? "bg-green-500 dark:bg-green-400 animate-pulse" : "bg-red-500 dark:bg-red-400"}`}
                        ></span>
                        {slide.isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="p-5 flex flex-col gap-4 border-t
                    bg-zinc-50 border-zinc-100 
                    dark:bg-[#121212]/40 dark:border-white/5"
                  >
                    <div
                      className={`flex justify-between items-center text-xs font-medium ${textSecondary}`}
                    >
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border
                        bg-white border-zinc-200 
                        dark:bg-white/5 dark:border-white/5"
                      >
                        <LayoutGrid size={14} />
                        <span>Order: {slide.order}</span>
                      </div>
                      {slide.link && (
                        <a
                          href={slide.link}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          Link <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => toggleStatus(slide)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          slide.isActive
                            ? "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
                            : "text-zinc-500 hover:text-zinc-700 dark:text-gray-500 dark:hover:text-gray-300"
                        }`}
                        title={slide.isActive ? "Hide Slide" : "Show Slide"}
                      >
                        {slide.isActive ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(slide)}
                          className="p-2.5 rounded-xl transition-all duration-300 shadow-sm
                          text-blue-600 hover:text-white hover:bg-blue-600 bg-white border border-zinc-200
                          dark:text-blue-400 dark:bg-transparent dark:border-transparent dark:hover:bg-blue-600 dark:hover:text-white"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(slide._id!)}
                          className="p-2.5 rounded-xl transition-all duration-300 shadow-sm
                          text-red-600 hover:text-white hover:bg-red-600 bg-white border border-zinc-200
                          dark:text-red-400 dark:bg-transparent dark:border-transparent dark:hover:bg-red-600 dark:hover:text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- MODAL (Overlay) --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dark:bg-black/80"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl ${glassModal} flex flex-col max-h-[90vh] overflow-hidden`}
            >
              {/* Header */}
              <div
                className="p-6 border-b flex justify-between items-center
                bg-zinc-50 border-zinc-200 
                dark:bg-white/5 dark:border-white/10"
              >
                <div>
                  <h2
                    className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}
                  >
                    {isEditing ? (
                      <Edit2
                        size={20}
                        className="text-blue-500 dark:text-blue-400"
                      />
                    ) : (
                      <Plus
                        size={20}
                        className="text-green-500 dark:text-green-400"
                      />
                    )}
                    {isEditing ? "Edit Slide" : "Create New Slide"}
                  </h2>
                  <p className={`text-xs mt-1 ml-7 ${textSecondary}`}>
                    Customize your slide appearance
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full transition
                  text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 
                  dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white dark:bg-transparent">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* IMAGE UPLOAD SECTION */}
                  <div className="space-y-4">
                    <h3
                      className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${textSecondary} border-zinc-200 dark:border-white/10`}
                    >
                      Slide Visuals
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Upload Box */}
                      <div className="col-span-1">
                        <label
                          className={`text-xs mb-2 block ${textSecondary}`}
                        >
                          Background Image (Optional)
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all group
                          border-zinc-300 hover:border-blue-500 hover:bg-blue-50 
                          dark:border-white/10 dark:hover:border-blue-500/50 dark:hover:bg-white/5"
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                          />
                          <div
                            className="p-3 rounded-full mb-2 transition-transform group-hover:scale-110
                            bg-blue-50 text-blue-500 
                            dark:bg-white/5 dark:text-blue-400"
                          >
                            <UploadCloud size={24} />
                          </div>
                          <span
                            className={`text-xs group-hover:text-blue-600 dark:group-hover:text-white ${textSecondary}`}
                          >
                            Click to upload image
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-gray-600 mt-1">
                            JPG, PNG, WEBP
                          </span>
                        </div>
                      </div>

                      {/* Preview Box */}
                      <div className="col-span-2">
                        <label
                          className={`text-xs mb-2 block ${textSecondary}`}
                        >
                          Preview
                        </label>
                        <div
                          className={`h-40 rounded-xl overflow-hidden relative border flex items-center justify-center
                          border-zinc-200 dark:border-white/10 
                          ${!imagePreview ? currentSlide.bgClass : ""}`}
                        >
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors"
                                title="Remove Image"
                              >
                                <X size={14} />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-xs text-white truncate">
                                  {imageFile ? imageFile.name : "Current Image"}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              <ImageIcon
                                className="mx-auto text-white/40 mb-2"
                                size={32}
                              />
                              <p className="text-xs text-white/60">
                                No image selected.
                                <br />
                                Using gradient theme.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TEXT CONTENT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3
                        className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${textSecondary} border-zinc-200 dark:border-white/10`}
                      >
                        Main Info
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className={`text-xs ml-1 ${textSecondary}`}>
                            Main Title
                          </label>
                          <input
                            required
                            type="text"
                            value={currentSlide.title}
                            onChange={(e) =>
                              setCurrentSlide({
                                ...currentSlide,
                                title: e.target.value,
                              })
                            }
                            className={glassInput}
                            placeholder="e.g. Summer Sale"
                          />
                        </div>
                        <div>
                          <label className={`text-xs ml-1 ${textSecondary}`}>
                            Subtitle
                          </label>
                          <input
                            required
                            type="text"
                            value={currentSlide.subtitle}
                            onChange={(e) =>
                              setCurrentSlide({
                                ...currentSlide,
                                subtitle: e.target.value,
                              })
                            }
                            className={glassInput}
                            placeholder="e.g. Up to 50% Off"
                          />
                        </div>
                        <div>
                          <label className={`text-xs ml-1 ${textSecondary}`}>
                            Description
                          </label>
                          <input
                            required
                            type="text"
                            value={currentSlide.description}
                            onChange={(e) =>
                              setCurrentSlide({
                                ...currentSlide,
                                description: e.target.value,
                              })
                            }
                            className={glassInput}
                            placeholder="Brief description..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3
                        className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${textSecondary} border-zinc-200 dark:border-white/10`}
                      >
                        Action Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className={`text-xs ml-1 ${textSecondary}`}>
                            Discount Tag
                          </label>
                          <input
                            required
                            type="text"
                            value={currentSlide.discount}
                            onChange={(e) =>
                              setCurrentSlide({
                                ...currentSlide,
                                discount: e.target.value,
                              })
                            }
                            className={glassInput}
                            placeholder="e.g. FLAT 20% OFF"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`text-xs ml-1 ${textSecondary}`}>
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={currentSlide.buttonText}
                              onChange={(e) =>
                                setCurrentSlide({
                                  ...currentSlide,
                                  buttonText: e.target.value,
                                })
                              }
                              className={glassInput}
                              placeholder="Shop Now"
                            />
                          </div>
                          <div>
                            <label className={`text-xs ml-1 ${textSecondary}`}>
                              Sort Order
                            </label>
                            <input
                              type="number"
                              value={currentSlide.order}
                              onChange={(e) =>
                                setCurrentSlide({
                                  ...currentSlide,
                                  order: parseInt(e.target.value),
                                })
                              }
                              className={glassInput}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`text-xs ml-1 ${textSecondary}`}>
                            Link URL
                          </label>
                          <input
                            required
                            type="text"
                            value={currentSlide.link}
                            onChange={(e) =>
                              setCurrentSlide({
                                ...currentSlide,
                                link: e.target.value,
                              })
                            }
                            className={glassInput}
                            placeholder="/products?category=..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SETTINGS ROW */}
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border
                    bg-zinc-50 border-zinc-200 
                    dark:bg-white/5 dark:border-white/5"
                  >
                    <label className="flex items-center gap-3 cursor-pointer group w-full">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={currentSlide.isActive}
                          onChange={(e) =>
                            setCurrentSlide({
                              ...currentSlide,
                              isActive: e.target.checked,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div
                          className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                          bg-zinc-300 peer-checked:bg-blue-600 
                          dark:bg-gray-700"
                        ></div>
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium transition-colors ${textPrimary} group-hover:text-blue-500`}
                        >
                          Set Slide as Active
                        </span>
                        <span className={`text-xs ${textSecondary}`}>
                          Enable this to show the slide on the homepage
                          immediately.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* THEME SELECTOR */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSecondary}`}
                      >
                        <Palette size={14} className="text-blue-500" /> Color
                        Theme (Fallback)
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-1 rounded border ${textSecondary} bg-zinc-50 border-zinc-200 dark:bg-white/5 dark:border-white/5`}
                      >
                        {THEME_PRESETS.length} Styles
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-52 overflow-y-auto custom-scrollbar p-1">
                      {THEME_PRESETS.map((theme, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleThemeSelect(theme)}
                          className={`cursor-pointer rounded-xl p-1 border-2 transition-all relative group ${
                            currentSlide.bgClass === theme.bg
                              ? "border-blue-500 bg-blue-50 dark:bg-white/10 shadow-md scale-[1.02]"
                              : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-white/20 dark:hover:bg-white/5"
                          }`}
                        >
                          <div
                            className={`h-12 rounded-lg bg-gradient-to-br ${theme.preview} flex items-center justify-center shadow-inner relative overflow-hidden`}
                          >
                            {currentSlide.bgClass === theme.bg && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-white rounded-full p-1 shadow-lg">
                                  <Check
                                    size={12}
                                    className="text-blue-600 stroke-[3]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <p
                            className={`text-[10px] text-center mt-2 font-medium truncate px-1 
                            ${currentSlide.bgClass === theme.bg ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 group-hover:text-zinc-900 dark:text-gray-400 dark:group-hover:text-white"}`}
                          >
                            {theme.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div
                className="p-6 border-t flex justify-end gap-4 rounded-b-2xl
                bg-zinc-50 border-zinc-200 
                dark:bg-white/5 dark:border-white/10"
              >
                <button
                  onClick={closeModal}
                  className={`px-6 py-2.5 rounded-xl transition font-medium hover:bg-zinc-200 dark:hover:bg-white/10 ${textSecondary} hover:${textPrimary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`${glassButton} bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{isEditing ? "Save Changes" : "Create Slide"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
