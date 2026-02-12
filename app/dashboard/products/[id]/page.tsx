'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For ID and Navigation
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Car,
  Tag,
  Layers,
  Calendar,
  Copy,
  Scale,
  Ruler
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProductService } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ViewProductPage() {
  const { id } = useParams(); // URL నుండి ID తీసుకోవడానికి
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ProductService.getById(id as string);
      const data = response.data.data.product || response.data;
      
      setProduct(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product details');
      router.push('/dashboard/products'); // Error వస్తే వెనక్కి పంపించు
    } finally {
      setIsLoading(false);
    }
  };

  const copyPartNumber = () => {
    if (product?.partNumber) {
      navigator.clipboard.writeText(product.partNumber);
      toast.success('Part number copied!');
    }
  };

  // --- Loading Skeleton ---
  if (isLoading || !product) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  // --- Helpers ---
  const stockColor = 
    product.stock > (product.lowStockThreshold || 5) ? 'text-green-400 bg-green-500/10 border-green-500/20' :
    product.stock > 0 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
    'text-red-400 bg-red-500/10 border-red-500/20';

  const StockIcon = 
    product.stock > (product.lowStockThreshold || 5) ? CheckCircle2 :
    product.stock > 0 ? AlertTriangle : XCircle;

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Header Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <button className="rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10">
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-medium text-gray-400">Product Details</h1>
            <p className="text-xl font-bold text-white">{product.name}</p>
          </div>
        </div>

        <Link href={`/dashboard/products/edit/${product._id}`}>
          <Button variant="primary" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit Product
          </Button>
        </Link>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* 2. Left Column: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 space-y-4"
        >
          {/* Main Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                <Package className="h-16 w-16 mb-2 opacity-50" />
                <span>No Image Available</span>
              </div>
            )}
            
            {/* Status Badge on Image */}
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${stockColor}`}>
              <StockIcon className="h-3.5 w-3.5" />
              {product.stockStatus || (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                    selectedImageIndex === idx 
                      ? "border-blue-500 ring-2 ring-blue-500/20" 
                      : "border-white/10 hover:border-white/30 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img.url} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* 3. Right Column: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Key Details Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div 
                  className="group flex cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-mono text-cyan-400 transition-colors hover:bg-white/10"
                  onClick={copyPartNumber}
                  title="Click to copy"
                >
                  <span>{product.partNumber}</span>
                  <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </div>
                <h2 className="mt-3 text-3xl font-bold text-white">{product.name}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Layers className="h-4 w-4" /> {product.category}
                  </span>
                  {product.subcategory && (
                    <>
                      <span>•</span>
                      <span>{product.subcategory}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(product.finalPrice || product.price)}
                </p>
                {product.discountPrice && product.discountPrice < product.price && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Excl. taxes</p>
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-white/10" />

            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Stock Available</p>
                <p className="mt-1 text-lg font-semibold text-white">{product.stock} units</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Manufacturer</p>
                <p className="mt-1 text-lg font-semibold text-white">{product.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Warranty</p>
                <p className="mt-1 text-lg font-semibold text-white">{product.warrantyPeriod || 'No'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Sales</p>
                <p className="mt-1 text-lg font-semibold text-white">{product.totalSales || 0}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-white">Description</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Compatible Models */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Car className="h-5 w-5 text-blue-400" /> Compatible Models
            </h3>
            
            {product.compatibleModels && product.compatibleModels.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {product.compatibleModels.map((model, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{model.modelName}</p>
                      <p className="text-xs text-gray-400">{model.variant || 'All Variants'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded bg-black/30 px-2 py-1 text-xs text-gray-300">
                      <Calendar className="h-3 w-3" />
                      {model.yearFrom} - {model.yearTo || 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific models listed.</p>
            )}
          </div>

          {/* Specifications & Dimensions */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Specifications Map */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold text-white">Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-gray-400">{key}</span>
                      <span className="text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical Details */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm h-fit">
              <h3 className="mb-4 text-lg font-semibold text-white">Physical Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Weight</p>
                    <p className="text-sm font-medium text-white">
                      {product.weight ? `${product.weight} kg` : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
                    <Ruler className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Dimensions (L x W x H)</p>
                    <p className="text-sm font-medium text-white">
                      {product.dimensions && (product.dimensions.length || product.dimensions.width) 
                        ? `${product.dimensions.length || '-'} x ${product.dimensions.width || '-'} x ${product.dimensions.height || '-'} ${product.dimensions.unit || 'cm'}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}