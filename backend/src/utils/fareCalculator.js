const calculateFare = (distanceMiles, serviceType) => {
  const BASE_FARE = 8.00;
  const PER_MILE_RATE = 2.50;
  const MEDICAL_COURIER_FLAT = 10.00;

  let fare = BASE_FARE + (distanceMiles * PER_MILE_RATE);

  if (serviceType === 'medical_courier') {
    fare += MEDICAL_COURIER_FLAT;
  }

  return Math.round(fare * 100) / 100; // Round to 2 decimal places
};

module.exports = { calculateFare };
