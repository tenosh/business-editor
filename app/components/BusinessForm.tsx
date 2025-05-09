import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface BusinessFormProps {
  business?: {
    id: string;
    name: string;
    description: string;
    type: string;
    phone: string;
    email: string;
    website: string;
    latitude: number;
    longitude: number;
    operating_hours: any;
    has_delivery: boolean;
    has_free_wifi: boolean;
    image: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BusinessForm({
  business,
  onSuccess,
  onCancel,
}: BusinessFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    business?.image || null
  );
  const [formData, setFormData] = useState({
    name: business?.name || "",
    description: business?.description || "",
    type: business?.type || "",
    phone: business?.phone || "",
    email: business?.email || "",
    website: business?.website || "",
    latitude: business?.latitude || "",
    longitude: business?.longitude || "",
    operating_hours: business?.operating_hours || {},
    has_delivery: business?.has_delivery || false,
    has_free_wifi: business?.has_free_wifi || false,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = business?.image;

      // First create/update the business to get an ID
      const businessData = {
        ...formData,
        image: imageUrl,
      };

      let businessId;
      if (business?.id) {
        // Update existing business
        const { error } = await supabase
          .from("business")
          .update(businessData)
          .eq("id", business.id);
        if (error) throw error;
        businessId = business.id;
      } else {
        // Create new business
        const { data, error } = await supabase
          .from("business")
          .insert([businessData])
          .select()
          .single();
        if (error) throw error;
        businessId = data.id;
      }

      // Then handle image upload if there's a new image
      if (imagePreview && imagePreview !== business?.image) {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageData: imagePreview,
            businessId: businessId,
          }),
        });

        if (!response.ok) throw new Error("Failed to upload image");
        const data = await response.json();

        // Update the business with the new image URL
        const { error: updateError } = await supabase
          .from("business")
          .update({ image: data.url })
          .eq("id", businessId);
        if (updateError) throw updateError;
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving business:", error);
      alert("Error saving business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow text-black"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a type</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  latitude: parseFloat(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  longitude: parseFloat(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_delivery}
              onChange={(e) =>
                setFormData({ ...formData, has_delivery: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Has Delivery
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_free_wifi}
              onChange={(e) =>
                setFormData({ ...formData, has_free_wifi: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Has Free WiFi
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
          {imagePreview && (
            <div className="mt-2 relative w-full h-48">
              <Image
                src={imagePreview}
                alt="Business preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : business
            ? "Update Business"
            : "Create Business"}
        </button>
      </div>
    </form>
  );
}
