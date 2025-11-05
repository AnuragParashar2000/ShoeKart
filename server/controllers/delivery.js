const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const axios = require("axios");

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

  try {
    // Use India Post API to get pincode details
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (response.data && response.data[0] && response.data[0].Status === "Success") {
      const postOffice = response.data[0].PostOffice[0];
      const city = postOffice.District || postOffice.Block || postOffice.Name;
      const state = postOffice.State;
      
      // Determine delivery time based on state/region
      let deliveryTime = "3-5 days";
      let codAvailable = true;
      
      // Major metro cities - faster delivery
      const metroCities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];
      if (metroCities.some(metro => city.toLowerCase().includes(metro.toLowerCase()))) {
        deliveryTime = "1-2 days";
        codAvailable = true;
      }
      // Tier 2 cities
      else if (["Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ludhiana"].some(city2 => city.toLowerCase().includes(city2.toLowerCase()))) {
        deliveryTime = "2-3 days";
        codAvailable = true;
      }
      // Remote areas (Islands, North-East, J&K, Ladakh)
      else if (["Andaman", "Nicobar", "Lakshadweep", "Arunachal", "Mizoram", "Nagaland", "Manipur", "Tripura", "Meghalaya", "Sikkim", "Jammu", "Kashmir", "Ladakh"].some(remote => state.toLowerCase().includes(remote.toLowerCase()))) {
        deliveryTime = "5-7 days";
        codAvailable = false;
      }
      
      return res.status(200).json({
        success: true,
        message: "Delivery information retrieved successfully",
        data: {
          pincode,
          deliveryTime,
          codAvailable,
          city: `${city}, ${state}`
        }
      });
    } else {
      // Pincode not found in India Post database
      return res.status(404).json({
        success: false,
        message: "Invalid PIN code or delivery not available to this location"
      });
    }
  } catch (error) {
    console.error("Error fetching pincode data:", error);
    // Fallback to default delivery info
    return res.status(200).json({
      success: true,
      message: "Delivery information retrieved successfully",
      data: {
        pincode,
        deliveryTime: "3-5 days",
        codAvailable: true,
        city: "Your Location"
      }
    });
  }
});

module.exports = {
  checkDelivery
};
