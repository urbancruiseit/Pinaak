"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";

import { createWebsiteGacThunk } from "../features/Website/WebsiteSlice";
import { getCountriesThunk } from "../features/countrycode/countrycodeSlice";

export default function GacFormPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { creating } = useSelector((state: RootState) => state.websiteGac);

  const countries = useSelector((state: RootState) => state.country.countries);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country_code: "",
    city: "Delhi",
  });

  // Load all countries
  useEffect(() => {
    dispatch(getCountriesThunk());
  }, [dispatch]);

  // Set default country code
  useEffect(() => {
    if (countries.length > 0 && !formData.country_code) {
      const defaultCountry =
        countries.find((item) => item.phone_code === "+91") || countries[0];

      setFormData((prev) => ({
        ...prev,
        country_code: defaultCountry.phone_code,
      }));
    }
  }, [countries]);

  // Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(createWebsiteGacThunk(formData));

    if (createWebsiteGacThunk.fulfilled.match(resultAction)) {
      setMessageType("success");
      setMessage("Successfully Submitted");

      setFormData({
        name: "",
        phone: "",
        country_code: formData.country_code,
        city: "Delhi",
      });
    } else {
      setMessageType("error");
      setMessage((resultAction.payload as string) || "Something went wrong");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 pt-20 px-4">
      <div className="w-full max-w-3xl rounded-[22px] overflow-hidden shadow-xl border-2 border-lime-500 bg-white">
        {/* Header */}
        <div className="bg-lime-500 text-white text-center py-4">
          <h1 className="text-4xl font-extrabold uppercase tracking-wide">
            GET A QUICK CALL
          </h1>
        </div>

        <div className="p-6">
          {/* Success / Error Message */}
          {message && (
            <div
              className={`mb-5 rounded-md px-4 py-3 text-center font-semibold ${
                messageType === "success"
                  ? "bg-green-100 border border-green-500 text-green-700"
                  : "bg-red-100 border border-red-500 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center gap-5"
          >
            {/* Name */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full md:w-1/3 h-12 border border-gray-300 rounded-md px-4 text-black placeholder:text-gray-400 outline-none focus:border-lime-500"
            />

            {/* Country Code + Phone */}
            <div className="flex w-full md:w-1/3 border border-gray-300 rounded-md overflow-hidden h-12">
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                className="w-28 border-r bg-white text-black outline-none px-2"
              >
                {countries.map((country) => (
                  <option key={country.id} value={country.phone_code}>
                    {country.phone_code}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="flex-1 px-4 text-black placeholder:text-gray-400 outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={creating}
              className="w-full md:w-44 h-12 rounded-md bg-amber-500 text-white font-bold text-lg shadow-md hover:bg-amber-600 transition disabled:opacity-50"
            >
              {creating ? "Submitting..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
