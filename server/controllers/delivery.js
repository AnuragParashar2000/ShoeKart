const asyncErrorHandler = require("../middleware/asyncErrorHandler");

// Sample PIN code data - In a real application, this would come from a database or external API
const PIN_CODE_DATA = {
  // Major cities - 1-2 days delivery, COD available
  "110001": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "400001": { deliveryTime: "1-2 days", codAvailable: true, city: "Mumbai" },
  "560001": { deliveryTime: "1-2 days", codAvailable: true, city: "Bangalore" },
  "600001": { deliveryTime: "1-2 days", codAvailable: true, city: "Chennai" },
  "700001": { deliveryTime: "1-2 days", codAvailable: true, city: "Kolkata" },
  "380001": { deliveryTime: "1-2 days", codAvailable: true, city: "Ahmedabad" },
  "500001": { deliveryTime: "1-2 days", codAvailable: true, city: "Hyderabad" },
  "302001": { deliveryTime: "1-2 days", codAvailable: true, city: "Jaipur" },
  "411001": { deliveryTime: "1-2 days", codAvailable: true, city: "Pune" },
  "110002": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110003": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110004": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110005": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110006": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110007": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110008": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110009": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  "110010": { deliveryTime: "1-2 days", codAvailable: true, city: "New Delhi" },
  
  // Tier 2 cities - 2-3 days delivery, COD available
  "201301": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201302": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201303": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201304": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201305": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201306": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201307": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201308": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201309": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "201310": { deliveryTime: "2-3 days", codAvailable: true, city: "Noida" },
  "122001": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122002": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122003": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122004": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122005": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122006": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122007": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122008": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122009": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  "122010": { deliveryTime: "2-3 days", codAvailable: true, city: "Gurgaon" },
  
  // Tier 3 cities - 3-5 days delivery, COD available
  "141001": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141002": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141003": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141004": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141005": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141006": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141007": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141008": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141009": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  "141010": { deliveryTime: "3-5 days", codAvailable: true, city: "Ludhiana" },
  
  // Remote areas - 5-7 days delivery, COD not available
  "744101": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744102": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744103": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744104": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744105": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744106": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744107": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744108": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744109": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
  "744110": { deliveryTime: "5-7 days", codAvailable: false, city: "Port Blair" },
};

const checkDelivery = asyncErrorHandler(async (req, res) => {
  const { pincode } = req.body;

  // Validate PIN code
  if (!pincode) {
    return res.status(400).json({
      success: false,
      message: "PIN code is required"
    });
  }

  // Check if PIN code is 6 digits
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid 6-digit PIN code"
    });
  }

  // Check if PIN code exists in our data
  const deliveryInfo = PIN_CODE_DATA[pincode];

  if (!deliveryInfo) {
    return res.status(404).json({
      success: false,
      message: "Delivery not available to this PIN code",
      data: {
        pincode,
        deliveryTime: "Not available",
        codAvailable: false,
        city: "Unknown"
      }
    });
  }

  // Return delivery information
  res.status(200).json({
    success: true,
    message: "Delivery information retrieved successfully",
    data: {
      pincode,
      deliveryTime: deliveryInfo.deliveryTime,
      codAvailable: deliveryInfo.codAvailable,
      city: deliveryInfo.city
    }
  });
});

module.exports = {
  checkDelivery
};
