import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Github, Linkedin } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import XIcon from "../components/XIcon";
import { useTheme } from "../contexts/useTheme";

// Type declaration for hCaptcha window object
declare global {
  interface Window {
    hcaptcha?: {
      render: (
        element: string | HTMLElement,
        options: Record<string, unknown>,
      ) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
  honeypot: z.string().max(0, "Spam detected").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { theme } = useTheme();
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined;
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [hcaptchaReady, setHcaptchaReady] = React.useState(false);
  const widgetIdRef = React.useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Validate captcha
      if (!captchaToken) {
        toast.error("Please complete the CAPTCHA verification");
        return;
      }

      // Call backend endpoint instead of direct Supabase insert
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000/api"
        }/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            captchaToken: captchaToken,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          toast.error("Too many requests. Please try again later.");
        } else if (response.status === 400) {
          toast.error(errorData.detail || "Invalid input provided");
        } else {
          toast.error("Failed to send message. Please try again later.");
        }
        return;
      }

      toast.success("Message sent successfully! I'll get back to you soon.");
      reset();
      setCaptchaToken(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again later.");
    }
  };

  // Load hCaptcha script lazily and mark when ready
  React.useEffect(() => {
    const scriptSrc = "https://js.hcaptcha.com/1/api.js?render=explicit";
    const existingScript = document.querySelector(
      `script[src="${scriptSrc}"]`,
    ) as HTMLScriptElement | null;

    if (existingScript && window.hcaptcha) {
      setHcaptchaReady(true);
      return;
    }

    const script = existingScript ?? document.createElement("script");
    if (!existingScript) {
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => setHcaptchaReady(true);
    script.addEventListener("load", handleLoad);

    return () => {
      script.removeEventListener("load", handleLoad);
    };
  }, []);

  // Render hCaptcha widget after script loads
  React.useEffect(() => {
    if (!hcaptchaReady) return;
    if (!siteKey) return;
    if (!window.hcaptcha) return;

    if (widgetIdRef.current !== null) {
      window.hcaptcha.reset(widgetIdRef.current);
      return;
    }

    widgetIdRef.current = window.hcaptcha.render("h-captcha", {
      sitekey: siteKey,
      callback: (token: string) => {
        setCaptchaToken(token);
      },
      "error-callback": () => {
        setCaptchaToken(null);
      },
      "expired-callback": () => {
        setCaptchaToken(null);
      },
    }) as unknown as string;

    return () => {
      if (widgetIdRef.current && window.hcaptcha) {
        window.hcaptcha.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [hcaptchaReady, siteKey]);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "devhavertz@gmail.com",
      href: "mailto:devhavertz@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+254 (741) 699-435",
      href: "tel:+254741699435",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Nairobi, Kenya",
      href: null,
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/willy-havertz",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/wiltord-ichingwa",
    },
    {
      icon: XIcon,
      label: "X (Twitter)",
      href: "https://twitter.com",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="py-12 pt-32 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Get In{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Ready to discuss your cybersecurity needs? Let's connect and
              explore how we can strengthen your security posture together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`rounded-2xl border p-8 ${
                theme === "dark"
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-2xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Send a Message
                </span>
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    {...register("subject")}
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Tell me about your project or security needs..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Honeypot field - hidden from users */}
                <input
                  {...register("honeypot")}
                  type="text"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* hCaptcha Widget */}
                <div className="mb-6">
                  <div id="h-captcha" />
                  {!hcaptchaReady && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Loading CAPTCHA...
                    </p>
                  )}
                  {hcaptchaReady && !siteKey && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      CAPTCHA misconfigured: site key is missing.
                    </p>
                  )}
                  {hcaptchaReady && siteKey && !captchaToken && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      Please complete the CAPTCHA verification above
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting || !captchaToken || !hcaptchaReady || !siteKey
                  }
                  className="w-full flex items-center justify-center px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium rounded-lg hover:bg-black dark:hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div className="space-y-8">
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`rounded-2xl border p-8 ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Contact Information
                  </span>
                </h2>

                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="group relative flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all cursor-pointer"
                          aria-label={item.label}
                        >
                          <item.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          {/* Pulsing ring animation for clickable items */}
                          <span
                            className="absolute inset-0 rounded-lg animate-ping bg-green-400/30 opacity-0 group-hover:opacity-100"
                            style={{ animationDuration: "1.5s" }}
                          />
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        </a>
                      ) : (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg flex items-center justify-center">
                          <item.icon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-lg text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors underline-offset-2 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-lg text-slate-900 dark:text-white">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className={`rounded-2xl border p-8 ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Follow Me
                  </span>
                </h2>

                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white transition-all"
                      aria-label={social.label}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 p-8"
              >
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  Response Time
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  I typically respond to all inquiries within 24 hours during
                  business days. For urgent security matters, please call
                  directly.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
