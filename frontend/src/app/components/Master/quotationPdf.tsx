  'use client';

  import React, { useState } from 'react';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { User, Mail, Phone, FileText, MapPin, Users, Calendar, PhoneCall, Car, Upload } from 'lucide-react';



  export default function QuotationPdf() {
    


  return (
    <div className="max-w-5xl mx-auto my-10 bg-white border shadow">

      {/* HEADER */}
      <div className="flex justify-between p-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-red-600">urban cruise</h1>
          <p className="text-xs font-semibold text-gray-600">
            Most Preferred Bus Rental Service in INDIA
          </p>

          <div className="flex gap-2 mt-2 text-xs">
            <span className="px-2 py-1 bg-green-100 rounded">Google ★★★★★</span>
            <span className="px-2 py-1 bg-blue-100 rounded">Facebook</span>
            <span className="px-2 py-1 bg-red-100 rounded">YouTube</span>
          </div>
        </div>

        <div className="text-xs text-right">
          <p className="font-bold">27-Dec-25</p>
          <p>B-14, Gali No. 10</p>
          <p>Shashi Garden, Delhi</p>
          <p>110091, INDIA</p>
        </div>
      </div>

      {/* RATE QUOTATION */}
      <div className="py-1 font-bold text-center text-white bg-green-600">
        RATE QUOTATION
      </div>

      {/* GREETING */}
      <div className="p-4 text-sm">
        <p><strong>Dear Mr. Arjun</strong></p>
        <p className="italic font-semibold text-red-600">
          Greetings from Urban Cruise™
        </p>
        <p>
          With reference to your enquiry, please find the trip details,
          vehicle options & pricing.
        </p>
      </div>

      {/* TRAVEL REQUIREMENT */}
      <div className="mx-4 border">
        <div className="px-3 py-1 font-bold text-white bg-green-600">
          YOUR TRAVEL REQUIREMENT
        </div>

        <div className="grid grid-cols-4 text-xs">
          <div className="p-2 border">
            <strong>Travel Detail</strong>
            <p>3-Jan 10:00 AM</p>
            <p>Gurgaon Sec 25</p>
          </div>

          <div className="col-span-2 p-2 font-bold text-center border">
            Bharatpur, Rajasthan
          </div>

          <div className="p-2 text-right border">
            <p>5-Jan 10:00 PM</p>
            <p>Gurgaon Sec 25</p>
          </div>

          <div className="p-2 border">
            <strong>Travel Date</strong>
            <p>3–5 Jan 2026</p>
            <p>(3 Days)</p>
          </div>

          <div className="p-2 border">
            <strong>Trip Type</strong>
            <p>Round Trip</p>
          </div>

          <div className="p-2 border">
            <strong>PAX</strong>
            <p>14</p>
          </div>

          <div className="p-2 border">
            <strong>Remarks</strong>
            <p>—</p>
          </div>
        </div>
      </div>

      {/* VEHICLE OPTIONS */}
      <div className="mx-4 mt-4 border">
        <div className="px-3 py-1 font-bold text-white bg-green-600">
          VEHICLE OPTIONS & PRICING
        </div>

        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Vehicle Type</th>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Discounted Price</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-2 text-center border">1</td>
              <td className="p-2 border">27 Seater Tata / Leyland</td>
              <td className="p-2 text-center border">1</td>
              <td className="p-2 border">
                <b>PREMIUM</b><br />
                AC, Reclining Seats, Charging Point
              </td>
              <td className="p-2 font-bold text-green-600 border">
                ₹42,000
              </td>
            </tr>

            <tr>
              <td className="p-2 text-center border">2</td>
              <td className="p-2 border">27 Seater Tata / Leyland</td>
              <td className="p-2 text-center border">1</td>
              <td className="p-2 border">
                <b>ROYAL</b><br />
                Pushback Seats, Music System
              </td>
              <td className="p-2 font-bold text-green-600 border">
                ₹44,500
              </td>
            </tr>

            <tr>
              <td className="p-2 text-center border">3</td>
              <td className="p-2 border">21 Seater Bharat Benz</td>
              <td className="p-2 text-center border">1</td>
              <td className="p-2 border">
                <b>ROYAL+</b><br />
                Luxury Interior, Premium Seats
              </td>
              <td className="p-2 font-bold text-green-600 border">
                ₹49,000
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* OTHER CHARGES */}
      <div className="p-3 mx-4 mt-4 text-xs border">
        <h3 className="mb-1 font-bold">OTHER CHARGES (if applicable)</h3>
        <ul className="pl-5 space-y-1 list-disc">
          <li>Toll Charges – Included</li>
          <li>Parking & Police Entry – Not Included</li>
          <li>Extra KM above 500km – ₹41/km</li>
          <li>Driver Night Charge – ₹500/night</li>
        </ul>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between p-4 text-xs border-t">
        <div>
          <p className="font-bold text-green-700">
            RASHMI – +91 86557 15975
          </p>
          <p>delhi@urbancruise.in</p>
          <p>www.urbancruise.in/delhi</p>
        </div>

        <div className="px-4 py-2 font-bold text-red-700 bg-red-100 rounded-full">
          Pay 20% to Book
        </div>
      </div>

    </div>
  );
}
