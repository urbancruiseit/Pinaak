"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Users,
  Calendar,
  PhoneCall,
  Car,
  Upload,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import urbancruiselogo from "../../../../../../src/app/assets/urbanlogo.png";

export default function QuotationPage() {
  return (
    <div className="max-w-5xl mx-auto my-8 bg-white border shadow-md rounded-lg overflow-hidden print:shadow-none print:my-0">
      {/* HEADER with Logo and Social Images */}
      <div className="flex justify-between items-center p-5 border-b gap-6">
        {/* LEFT SECTION - LOGO */}
        <div className="flex items-center flex-shrink-0">
          <Image
            src={urbancruiselogo}
            alt="Urban Cruise Logo"
            width={100}
            priority
            className="rounded-xl object-contain"
          />
        </div>

        {/* MIDDLE SECTION */}
        <div className="flex flex-col items-center flex-1">
          {/* Top Text Section */}
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              Your Heading Text
            </h2>
            <p className="text-sm text-gray-600">Add your description here</p>
          </div>

          {/* Bottom Social Media Section */}
          <div className="flex gap-3 items-center">
            {/* Google */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-full border border-gray-200">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                alt="Google"
                className="h-5 w-auto object-contain"
              />
              <span className="text-xs font-medium text-gray-700">★★★★★</span>
            </div>

            {/* Facebook */}
            <div className="bg-gray-50 px-2 py-1.5 rounded-full border border-gray-200">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="Facebook"
                className="h-5 w-auto object-contain"
              />
            </div>

            {/* YouTube */}
            <div className="bg-gray-50 px-2 py-1.5 rounded-full border border-gray-200">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
                alt="YouTube"
                className="h-5 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - DATE & ADDRESS */}
        <div className="text-xs text-right text-gray-600 flex-shrink-0">
          <p className="font-bold">27-Dec-25</p>
          <p>B-14, Gali No. 10</p>
          <p>Shashi Garden, Delhi</p>
          <p>110091, INDIA</p>
        </div>
      </div>
      {/* RATE QUOTATION Banner */}
      <div className="py-1.5 font-bold text-center text-white bg-green-600">
        RATE QUOTATION
      </div>

      {/* GREETING Section */}
      <div className="p-5 text-sm space-y-1">
        <p>
          <strong>Dear Mr. Vijay</strong>
        </p>
        <p className="italic font-semibold text-red-600">
          Greetings from Urban Cruise™
        </p>
        <p>
          With reference to your enquiry, please find the trip details, vehicle
          options &amp; pricing.
        </p>
      </div>

      {/* YOUR TRAVEL REQUIREMENT - Based on image data */}
      <div className="mx-5 border-2 border-green-500  text-black overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-center py-1 font-bold text-[16px] uppercase tracking-wide text-white">
          YOUR TRAVEL REQUIREMENT
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-[80px_120px_1fr_120px] border-t border-green-500">
          {/* Travel Detail Label */}
          <div className="border-r border-green-500 p-2 flex items-center justify-between font-bold text-[14px] leading-5">
            <span>Travel Detail</span>
            <span className="text-orange-500">▶</span>
          </div>

          {/* Left Timing */}
          <div className="border-r border-green-500 p-2 text-center">
            <p className="text-cyan-400 text-[14px] font-bold">9-Nov 6.30am</p>
            <p className="text-cyan-400 text-[12px] mt-2">Mumbai Airport</p>
          </div>

          {/* Route Details */}
          <div className="border-r border-green-500 p-2 text-[13px] leading-5 font-semibold">
            27- Trimbakeshwar | 28- Nashik SS | 29- Nashik to Shirdi, Shirdi SS
            | 1 Mar- Shirdi to ShaniSignapur to Aurangabad | 2- Aurangabad SS |
            3- Aurangabad to Mumbai A0050
          </div>

          {/* Right Timing */}
          <div className="p-2 text-center">
            <p className="text-red-400 text-[14px] font-bold">9-Nov 8.30pm</p>
            <p className="text-red-400 text-[12px] mt-2">Mumbai Airport</p>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-[80px_180px_100px_60px_1fr] border-t border-green-500">
          {/* Travel Date Label */}
          <div className="border-r border-green-500 p-2 flex items-center justify-between font-bold text-[14px]">
            <span>Travel Date</span>
            <span className="text-orange-500">▶</span>
          </div>

          {/* Travel Date */}
          <div className="border-r border-green-500 p-2 text-center">
            <p className="font-bold text-[14px]">9-Nov to 9-Nov 2024</p>
            <p className="text-green-400 font-bold text-[13px]">(7 days)</p>
          </div>

          {/* Trip Type */}
          <div className="border-r border-green-500 p-2 text-center">
            <p className="font-bold text-[14px] uppercase">TRIP TYPE</p>
            <p className=" inline-block px-2 rounded text-[13px] font-bold text-orange-200">
              One Way Drop
            </p>
          </div>

          {/* Pax */}
          <div className="border-r border-green-500 p-2 text-center">
            <p className="font-bold text-[14px] uppercase">PAX</p>
            <p className="text-cyan-400 font-bold text-[24px] leading-none">
              17
            </p>
          </div>

          {/* Remarks */}
          <div className="p-2  text-[12px]">
            <span className="text-red-400 font-bold">Remarks-</span>
          </div>
        </div>
      </div>

      {/* VEHICLE OPTIONS & PRICING - Exact details from image */}
      <div className="mx-5 mt-5 border border-gray-200 rounded-md overflow-hidden">
        <div className="px-3 py-1.5 font-bold text-white bg-green-600">
          VEHICLE OPTIONS &amp; PRICING
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border border-gray-200 text-left">#</th>
                <th className="p-2 border border-gray-200 text-left">
                  Vehicle Type
                </th>
                <th className="p-2 border border-gray-200 text-center">
                  No. of Veh.
                </th>
                <th className="p-2 border border-gray-200 text-left">
                  Description
                </th>
                <th className="p-2 border border-gray-200 text-right">
                  Discounted Price
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-gray-200">1</td>
                <td className="p-2 border border-gray-200 font-medium">
                  13 Seat | Force Traveller
                </td>
                <td className="p-2 border border-gray-200 text-center">1</td>
                <td className="p-2 border border-gray-200">
                  ECONOMY - Basic AC, Non-Recline Seat, Basic
                </td>
                <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                  ₹15,800
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">2</td>
                <td className="p-2 border border-gray-200 font-medium">
                  13 Seat | Force Traveller
                </td>
                <td className="p-2 border border-gray-200 text-center">1</td>
                <td className="p-2 border border-gray-200">
                  PREMIUM - 2018-20 Model, AC, Recline Seat, Charging Point,
                  Multi System + Speaker
                </td>
                <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                  ₹16,400
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">3</td>
                <td className="p-2 border border-gray-200 font-medium">
                  13 Seat | Force Traveller
                </td>
                <td className="p-2 border border-gray-200 text-center">1</td>
                <td className="p-2 border border-gray-200">
                  ROYAL - 2021-23 Model, Modified Velv, Good AC, Recline Seat,
                  Charging Point, 8V Multi + Speaker, Sofa/Deck
                </td>
                <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                  ₹17,000
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">4</td>
                <td className="p-2 border border-gray-200 font-medium">
                  12 Seat | Force Traveller
                </td>
                <td className="p-2 border border-gray-200 text-center">1</td>
                <td className="p-2 border border-gray-200">
                  ROYAL™ - AC, 1x2 VIP Maharaja Seat, More Lounge, Custom
                  Designed Velv, Charging Points, Personal AC Vent, BT Touch
                  Multi + Good Speakers, HD TV
                </td>
                <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                  ₹21,200
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">5</td>
                <td className="p-2 border border-gray-200 font-medium">
                  15 Seat | Force Urbania
                </td>
                <td className="p-2 border border-gray-200 text-center">1</td>
                <td className="p-2 border border-gray-200">
                  ROYAL™ - AC, 2x1 Recline Seat (15), Comfortable &amp; Silent
                  Cabin, Panoramic Windows, Charging Points, Personal AC Vents,
                  BT Multi + Speaker, Comfortable Cabin
                </td>
                <td className="p-2 border border-gray-200 text-right font-bold text-green-700">
                  ₹30,000
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing notes */}
        <div className="px-3 py-2 text-[11px] text-gray-600 bg-gray-50 border-t border-gray-200">
          <p>
            ✓ Above pricing include Vehicle Cost, Fuel, Driver, Tax. | A/C will
            be switched OFF intermittently on Hills.
          </p>
          <p>
            ✓ KM will be counted from Pickup Point to Pickup Point | Visit to
            Local Delhi Places is not included in cost.
          </p>
          <p>
            ✓ There are some places in Hills where Veh. may not go due to
            Restrictions by Local Govt.
          </p>
        </div>
      </div>

      {/* DIWALI OFFER Banner */}
      <div className="mx-5 mt-4 p-2.5 bg-yellow-50 border border-yellow-200 rounded-md flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-700">✨ DIWALI OFFER ✨</span>
          <span className="text-sm font-semibold text-green-700">
            Discount of Rs. 2000/- already applied in above price.
          </span>
        </div>
        <div className="text-xs text-gray-500">
          This Price Offer is valid till 9-Nov
        </div>
      </div>

      {/* SCAN & PAY + Bank Details */}
      <div className="mx-5 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 text-center">
          <p className="text-sm font-bold flex items-center justify-center gap-1">
            <CreditCard size="16" /> SCAN &amp; PAY
          </p>
          <div className="bg-white inline-block p-2 rounded-md mt-1 shadow-sm">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <rect width="100" height="100" rx="12" fill="#111" />
              <rect x="10" y="10" width="80" height="80" rx="6" fill="white" />
              <path
                d="M30 50 L70 50 M50 30 L50 70"
                stroke="#111"
                strokeWidth="3"
              />
              <circle
                cx="50"
                cy="50"
                r="12"
                stroke="#111"
                strokeWidth="3"
                fill="white"
              />
              <path d="M35 35 L65 65" stroke="#111" strokeWidth="3" />
              <path d="M65 35 L35 65" stroke="#111" strokeWidth="3" />
            </svg>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">UPI / QR Code</p>
        </div>

        <div className="border border-gray-200 rounded-md p-3 text-xs space-y-1">
          <p className="font-bold">Bank Transfer Details:</p>
          <p>
            A/c Name: <span className="font-mono">Urban Cabs | AX05 Bank</span>
          </p>
          <p>
            A/c No.: <span className="font-mono">922020012721497</span>
          </p>
          <p>
            IFSC Code: <span className="font-mono">UTIB00000572</span>
          </p>
          <p className="pt-1 text-green-700">📞 89289 46056</p>
          <p className="text-gray-500">SWARA: +91 773838 0684</p>
        </div>
      </div>

      {/* OTHER CHARGES (if applicable) - Complete from image */}
      <div className="mx-5 mt-5 border border-gray-200 rounded-md overflow-hidden">
        <div className="px-3 py-1.5 font-bold text-white bg-green-600">
          OTHER CHARGES (if applicable)
        </div>
        <div className="p-3 text-xs space-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            <p>
              <span className="font-semibold">✔ Toll Charges:</span> Already
              included in the Cost.
            </p>
            <p>
              <span className="font-semibold">✘ State Entry Tax - N/A:</span>{" "}
              NOT Included. Client will Pay to Driver.
            </p>
            <p>
              <span className="font-semibold">
                ✘ Parking &amp; Police Entry:
              </span>{" "}
              NOT Included. Client will Pay to Driver.
            </p>
            <p>
              <span className="font-semibold">
                ➕ Extra Charge above 1800 km:
              </span>{" "}
              ₹20/km (1-3) | ₹26/km (4) | ₹40/km (5)
            </p>
            <p>
              <span className="font-semibold">🔄 Extra Charge (Local):</span>{" "}
              Above N/A | ₹20/km | ₹150/hr
            </p>
            <p>
              <span className="font-semibold">🌙 Driver Night charge:</span> NOT
              Included. Client will Pay to Driver.
            </p>
          </div>
          <div className="mt-2 pt-1 text-[10px] text-gray-400 border-t border-gray-100">
            *A/C will be switched OFF intermittently on Hills. *KM counted from
            Pickup Point to Pickup Point
          </div>
        </div>
      </div>

      {/* Footer with Contact & Booking Note */}
      <div className="flex flex-wrap justify-between items-center p-4 mt-4 border-t border-gray-200 bg-gray-50 text-xs">
        <div>
          <p className="font-bold text-green-700">
            📞 RASHMI – +91 86557 15975
          </p>
          <p>✉️ delhi@urbancruise.in</p>
          <p>🌐 www.urbancruise.in/delhi</p>
          <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
            <span>MUMBAI | PUNE | DELHI | NOIDA</span>
            <span>GURUGRAM | CHANDIGARH | JAIPUR</span>
          </div>
        </div>
        <div className="mt-3 md:mt-0">
          <div className="px-4 py-2 font-bold text-white bg-red-600 rounded-full shadow-sm text-sm text-center">
            Pay 20% to Book
          </div>
          <p className="text-[10px] text-gray-500 mt-1 text-center">
            Advance booking required
          </p>
        </div>
      </div>

      {/* Print Disclaimer small */}
      <div className="text-[9px] text-center text-gray-400 py-2 border-t print:hidden">
        This is a computer generated quotation • Valid till offer expiry
      </div>
    </div>
  );
}
