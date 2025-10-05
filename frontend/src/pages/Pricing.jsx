import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const Pricing=()=> {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with course planning",
      features: [
        "Basic course search & filtering",
        "View course details",
        "See campus, year, and friends in course",
        "Manual schedule building",
        "Rate Courses and view public ratings", 
        "Disscusion threads for each course "
      ],
      color: "blue",
      buttonText: "Get Started",
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "per month",
      description: "Advanced tools for serious students",
      features: [
        "Everything in Free",
        "AI-powered schedule optimization",
        "Course recommendations & trending classes",
        "Professor ratings & reviews",
        "Course popularity & workload metrics",
        "Smart prerequisite planning",
        "Priority support & ad-free experience",
      ],
      color: "green",
      buttonText: "Upgrade to Pro",
      popular: true,
    },
  ];

  const getColorClasses = (color, type) => {
    const colors = {
      blue: {
        bg: "bg-blue-500",
        hover: "hover:bg-blue-600",
        text: "text-blue-600",
        light: "bg-blue-50",
      },
      green: {
        bg: "bg-green-500",
        hover: "hover:bg-green-600",
        text: "text-green-600",
        light: "bg-green-50",
      },
    };
    return colors[color][type];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-4 text-gray-900"
        >
          Choose Your Plan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-gray-600"
        >
          Tailored for students to plan courses efficiently.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-white rounded-3xl shadow-xl p-8 ${
              tier.popular ? "ring-4 ring-green-400 scale-105" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3
                className={`text-2xl font-bold mb-2 ${getColorClasses(
                  tier.color,
                  "text"
                )}`}
              >
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {tier.price}
                </span>
                <span className="text-gray-500">/{tier.period}</span>
              </div>
              <p className="text-gray-600 text-sm">{tier.description}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-xl font-semibold text-white mb-6 transition-colors ${getColorClasses(
                tier.color,
                "bg"
              )} ${getColorClasses(tier.color, "hover")}`}
            >
              {tier.buttonText}
            </motion.button>

            <div className="space-y-3">
              {tier.features.map((feature, featureIdx) => (
                <motion.div
                  key={featureIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + featureIdx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 ${getColorClasses(
                      tier.color,
                      "light"
                    )} p-1 rounded-full`}
                  >
                    <Check
                      className={`w-4 h-4 ${getColorClasses(
                        tier.color,
                        "text"
                      )}`}
                    />
                  </div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16"
      >
        <p className="text-gray-600 mb-4">
          All plans include access to core course search and planning tools.
        </p>
        <p className="text-sm text-gray-500">
          Upgrade anytime. Cancel anytime. 
        </p>
      </motion.div>
    </div>
  );
}
