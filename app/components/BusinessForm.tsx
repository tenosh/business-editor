import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface BusinessFormProps {
  business?: {
    id: string;
    name: string;
    description: string;
    type: string[];
    phone: string;
    latitude: number;
    longitude: number;
    hours: any;
    has_delivery: boolean;
    has_free_wifi: boolean;
    image: string;
    instagram: string;
    facebook: string;
    menu: any;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultHours = {
  monday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  tuesday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  wednesday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  thursday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  friday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  saturday: { open: true, hours: [{ open: "09:00", close: "17:00" }] },
  sunday: { open: false, hours: [] },
};

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
    type: business?.type || [],
    phone: business?.phone || "",
    latitude: business?.latitude || "",
    longitude: business?.longitude || "",
    hours: business?.hours || defaultHours,
    has_delivery: business?.has_delivery || false,
    has_free_wifi: business?.has_free_wifi || false,
    instagram: business?.instagram || "",
    facebook: business?.facebook || "",
    menu: business?.menu || { items: [] },
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

  const handleHoursChange = (day: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleTimeSlotChange = (
    day: string,
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          hours: prev.hours[day].hours.map((slot: any, i: number) =>
            i === index ? { ...slot, [field]: value } : slot
          ),
        },
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          hours: [...prev.hours[day].hours, { open: "09:00", close: "17:00" }],
        },
      },
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          hours: prev.hours[day].hours.filter(
            (_: any, i: number) => i !== index
          ),
        },
      },
    }));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value
      .split("\n")
      .map((item) => ({
        name: item.trim(),
      }))
      .filter((item) => item.name);

    setFormData((prev) => ({
      ...prev,
      menu: { items },
    }));
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "\n" + value.substring(end);

      // Update the textarea value
      textarea.value = newValue;

      // Set cursor position after the new line
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      // Trigger the change event
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);
    }
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { value: "restaurant", label: "Restaurant" },
              { value: "cafe", label: "Café" },
              { value: "hostel", label: "Hostel" },
              { value: "hotel", label: "Hotel" },
              { value: "private_rooms", label: "Private Rooms" },
              { value: "other", label: "Other" },
              { value: "camping", label: "Camping" },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`type-${value}`}
                  checked={formData.type.includes(value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...formData.type, value]
                      : formData.type.filter((t: string) => t !== value);
                    setFormData({ ...formData, type: newTypes });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`type-${value}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) =>
                setFormData({ ...formData, instagram: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <input
              type="text"
              value={formData.facebook}
              onChange={(e) =>
                setFormData({ ...formData, facebook: e.target.value })
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operating Hours
          </label>
          <div className="space-y-4">
            {Object.entries(formData.hours).map(
              ([day, data]: [string, any]) => (
                <div key={day} className="border p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.open}
                        onChange={(e) =>
                          handleHoursChange(day, "open", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </div>
                  </div>
                  {data.open && (
                    <div className="space-y-2">
                      {data.hours.map((slot: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                day,
                                index,
                                "open",
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                day,
                                index,
                                "close",
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Time Slot
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Menu Items (one per line)
          </label>
          <textarea
            value={formData.menu.items.map((item: any) => item.name).join("\n")}
            onChange={handleMenuChange}
            onKeyDown={handleMenuKeyDown}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={5}
            placeholder="Enter menu items, one per line"
          />
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
