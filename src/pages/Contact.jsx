import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
const Contact = () => {
  const [inputForm, setInputForm] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const FormValid =
    inputForm.fullName.trim() !== "" &&
    inputForm.email.trim() !== "" &&
    inputForm.message.trim() !== "";
  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
    }, 4000);
  };
  const phoneNumber = "+963984342644";
  const email2 = "info@cryptosavvy.com";
  const address = "Homs city, Syria";
  const mailto = `mailto:${email2}?subject=${encodeURIComponent(
    "Contact Request"
  )}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  return (
    <div className="h-full bg-[#0f121a] text-white p-6 rounded md:p-10 fade-in animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/*Contact Form */}
        <form className=" flex-1 bg-[#0f1115] p-6 rounded-xl shadow-md space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              value={inputForm.fullName}
              onChange={(event) => {
                setInputForm({ ...inputForm, fullName: event.target.value });
              }}
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={inputForm.email}
              onChange={(event) => {
                setInputForm({ ...inputForm, email: event.target.value });
              }}
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></input>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={inputForm.message}
              onChange={(event) => {
                setInputForm({ ...inputForm, message: event.target.value });
              }}
              rows="5"
              placeholder="Write your message"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            onClick={handleSend}
            disabled={!FormValid}
            className={`w-full bg-blue-600  text-white py-2 rounded-md font-medium transition ${FormValid
              ? " hover:bg-green-500"
              : " hover:bg-gray-400 cursor-not-allowed"
              }`}
          >
            Send Message
          </button>
          {sent && (
            <div className="mt-4 text-green-500 font-bold">
              Submission successful. Your request will be processed by the team
              as soon as possible.
            </div>
          )}
        </form>
        {/*Contact Information */}
        <div className="  flex-1 bg-[#0f1115] p-6 rounded-xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-white">
            Contact Information
          </h2>
          <div className="space-y-4 ">
            {/*Phone */}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-3 hover:text-blue-400 transition"
            >
              <Phone className="text-[#58a6ff]" size={24} />
              <span>{phoneNumber}</span>
            </a>
            {/*Email */}
            <a
              href={mailto}
              className="flex items-center gap-3 hover:text-indigo-400 transition"
            >
              <Mail className="text-[#58a6ff]" size={24} />
              <span>{email2}</span>
            </a>
            {/*Map */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-indigo-400 transition"
            >
              <MapPin className="text-[#58a6ff]" size={24} />
              <span>{address}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;