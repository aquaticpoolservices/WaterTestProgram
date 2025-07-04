document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission from reloading the page
  
    // Get input values
    const volume = parseFloat(document.querySelector('#volume').value) || 0;
    const ph = parseFloat(document.getElementById('ph').value) || 0;
    const stabilizer = parseFloat(document.getElementById('stabilizer').value) || 0;
    const totalAlk = parseFloat(document.getElementById('totalAlk').value) || 0;
    const clarity = document.getElementById('clarity').value;
    const freeChlorine = parseFloat(document.getElementById('freeC').value) || 0;
    const copper = parseFloat(document.getElementById('copper').value) || 0;
  
    // Display elements
    const headings = {
      backwash: document.querySelector('.stepOneHeading'),     
      copper: document.querySelector('.stepTwoHeading'),
      ph: document.querySelector('.stepThreeHeading'),
      alkalinity: document.querySelector('.stepFourHeading'),
      chlorine: document.querySelector('.stepFiveHeading'),
      algaecide: document.querySelector('.stepSixHeading'),
      stabilizer: document.querySelector('.stepSevenHeading'),
      clarity: document.querySelector('.stepEightHeading'),
    };
  
    const explanations = {
      backwash: document.querySelector('.stepOneExplain'),     
      copper: document.querySelector('.stepTwoExplain'),
      ph: document.querySelector('.stepThreeExplain'),
      alkalinity: document.querySelector('.stepFourExplain'),
      chlorine: document.querySelector('.stepFiveExplain'),
      algaecide: document.querySelector('.stepSixExplain'),
      stabilizer: document.querySelector('.stepSevenExplain'),
      clarity: document.querySelector('.stepEightExplain'),
    };
  
    function updateStep(step, heading, explanation) {
      headings[step].innerHTML = heading || '';
      explanations[step].innerHTML = explanation || '';
    }
  
    function formatValue(amount, unit) {
      return amount >= 1000 ? (amount / 1000).toFixed(2) + ' ' + unit :  Number(amount).toFixed(0) + ' ' + (unit === 'Kg' ? 'grams' : unit === 'L' ? 'mL' : unit);
    }
  
    function formatValueStabilizer(amount, unit) {
      return amount >= 1000 ? (amount / 1000).toFixed(0) + ' ' + unit : Number(amount).toFixed(0) + ' ' + (unit === 'KL' ? 'L' : unit);
    }
  
    function calcPh() {
  const acidDemandTable = {
    10000: [63, 125, 188, 250, 313, 375, 438, 500, 563, 625, 688, 750],
    20000: [125, 250, 375, 500, 623, 750, 875, 1000, 1125, 1250, 1375, 1500],
    30000: [185, 375, 560, 750, 940, 1125, 1330, 1500, 1750, 1875, 2000, 2250],
    40000: [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000],
    50000: [310, 625, 752, 1250, 1565, 1875, 2190, 2500, 2815, 3125, 3440, 3750],
    60000: [375, 750, 1125, 1500, 1875, 2250, 2625, 3000, 3375, 3750, 4125, 4500],
    70000: [440, 875, 1315, 1750, 2190, 2625, 3066, 3500, 3940, 4375, 4810, 5250],
    80000: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000],
    90000: [562, 1125, 1660, 2250, 2750, 3375, 4000, 4500, 5000, 5660, 6250, 6750],
    100000: [630, 1250, 1900, 2500, 3130, 3750, 4380, 5000, 5630, 6250, 6880, 7500],
    110000: [693, 1375, 2070, 2750, 3445, 4125, 4815, 5500, 6190, 6875, 7565, 8250],
    120000: [750, 1500, 2250, 3000, 3750, 4500, 5250, 6000, 6750, 7500, 8250, 9000],
  };

  function getAcidDose(poolVolume, drops) {
    const volumes = Object.keys(acidDemandTable).map(Number).sort((a, b) => a - b);

    const lowerVolume = volumes.find(v => v <= poolVolume) || volumes[0];
    const higherVolume = volumes.find(v => v >= poolVolume) || volumes[volumes.length - 1];

    if (lowerVolume === higherVolume) {
      return acidDemandTable[lowerVolume][drops - 1];
    }

    const lowerDose = acidDemandTable[lowerVolume][drops - 1];
    const higherDose = acidDemandTable[higherVolume][drops - 1];
    const interpolatedDose = lowerDose + ((higherDose - lowerDose) * (poolVolume - lowerVolume)) / (higherVolume - lowerVolume);

    return interpolatedDose.toFixed(2);
  }

  const volumeLiters = volume * 1000;

  // 🔁 Automatically infer acid demand drops based on pH
  let acidDemandDrops = 0;
  if (ph > 7.6 && ph <= 7.8) {
    acidDemandDrops = 1;
  } else if (ph <= 8.0) {
    acidDemandDrops = 2;
  } else if (ph <= 8.2) {
    acidDemandDrops = 3;
  } else if (ph <= 8.4) {
    acidDemandDrops = 4;
  } else if (ph > 8.4) {
    acidDemandDrops = 5;
  }

  const sodaAshNeeded = 1.8;
  const phDifference = 7.2 - ph;

  if (ph < 7.2) {
    const calcPhIncrease = ((phDifference / 0.1) * (sodaAshNeeded / 1000) * volumeLiters);
    updateStep(
      'ph',
      'Adjust PH Levels',
      `Add ${formatValue(calcPhIncrease, 'Kg')} of Soda Ash directly into the pool water while the pump is running.`
    );
  } else if (ph > 7.6 && acidDemandDrops > 0) {
    const acidDose = getAcidDose(volumeLiters, acidDemandDrops);
    const dilutionWater = acidDose * 10;
    updateStep(
      'ph',
      'Adjust PH Levels',
      `Dilute ${formatValue(acidDose, 'L')} of pool acid in ${formatValue(dilutionWater, 'L')} of water. Pour the mixture evenly over the surface of the pool while the pump is running. Retest the pH level after 1–2 hours of circulation.`
    );
  } else {
    updateStep('ph');
  }
}
        
    function calcStabilizer() {
      const targetStabilizer = 40;
      const volumeLiters = volume * 1000;
  
      if (stabilizer > 50) {
        const waterToReplace = ((stabilizer - targetStabilizer) / stabilizer) * volumeLiters;
        updateStep('stabilizer', 'Adjust Stabilizer ', `Drain ${formatValueStabilizer(waterToReplace, 'KL')} of water and replace with fresh water.`);
      } else if (stabilizer < 30) {
        const stabilizerAmount = (targetStabilizer - stabilizer) * volume;
        updateStep('stabilizer', 'Adjust stabilizer', `Add ${formatValue(stabilizerAmount, 'Kg')} of stabilizer slowly into the skimmer basket while the pump is running.`);
      } else {
        updateStep('stabilizer');
      }
    }
  
    function calcAlkalinity() {
      const alkDifferenceLow = 100 - totalAlk;
      const alkalinityAmount = ((alkDifferenceLow * 1.6 * volume * 1000) / 1000);
      const alkDifferenceHigh = totalAlk - 120;
      const acidAmount = ((volume * 1000) * alkDifferenceHigh * 0.000032);
      
      if (totalAlk > 120 && ph >7.6) {
        updateStep('alkalinity');
      }
      else if (totalAlk > 120) {
        updateStep('alkalinity', 'Adjust Alkalinity', `Turn off the pool pump and add ${formatValue(acidAmount, 'Kg')} of dry acid directly in to the deep end of the pool. Do NOT turn the pool pump on for at least 1 hour. Retest alkalinity after 12 hours and adjust if needed.`);
      } 
      else if (totalAlk < 100) {
        updateStep('alkalinity', 'Adjust Alkalinity', `Add ${formatValue(alkalinityAmount, 'Kg')} of alkalinity increaser directly in to pool water while pool pump is running.`);
      } 
      else {
        updateStep('alkalinity');
      }
    }
  
    function calcChlorine() {
      const volumeLiters = volume * 1000; // Convert pool volume to liters
      const chlorineDifference = 3 - freeChlorine; // Target chlorine level: 3ppm
      const chlorineDose = (5 * volumeLiters) / 1000; // Regular chlorine dose in grams
      const singleShock = (12 * volumeLiters) / 1000; // Shock dose in grams
      const bagSize = 600; // Bag size in grams (600g per bag)
  
      // Helper function to calculate number of bags needed
      function calculateBags(amountGrams) {
          return Math.ceil(amountGrams / bagSize); // Round up to nearest whole number
      }
  
      // Shock multipliers based on pool clarity
      const shockMultipliers = {
          'Clear': 1,
          'Blue/White': 1,
          'Lite Green/Clear': 2,
          'Green/Cloudy': 3,
          'Dark Green/Very Cloudy': 4
      };
  
      // Determine clarity multiplier
      const shockMultiplier = shockMultipliers[clarity] || 0; // Default to 0 if clarity is not recognized
  
      if (clarity !== 'Clear' && clarity !== 'Blue/White' && shockMultiplier > 0) {
          // Case: Clarity is not Clear/Blue-White -> Perform shock treatment regardless of freeChlorine
          const totalShock = singleShock * shockMultiplier; // Total shock dose in grams
          const bagsNeeded = calculateBags(totalShock); // Calculate number of bags
  
          updateStep(
              'chlorine',
              'Shock Pool Water',
              `Pre-dissolve ${bagsNeeded} bag${bagsNeeded > 1 ? 's' : ''} of HTH Super Shock in a bucket of water and spread it over the surface of the pool while the pump is running.`
          );
      } else if (freeChlorine < 1) {
          // Case: Free chlorine is below 1ppm -> Perform shock treatment
          const totalShock = singleShock * shockMultiplier; // Total shock dose in grams
          const bagsNeeded = calculateBags(totalShock); // Calculate number of bags
  
          updateStep(
              'chlorine',
              'Shock Pool Water',
              `Pre-dissolve ${bagsNeeded} bag${bagsNeeded > 1 ? 's' : ''} of HTH Super Shock in a bucket of water and spread it over the surface of the pool while the pump is running.`
          );
      } else if (freeChlorine >= 1 && freeChlorine < 3 && clarity === 'Clear') {
          // Case: Free chlorine is between 1-3ppm and clarity is Clear -> Add granular chlorine
          const totalDose = chlorineDose * chlorineDifference; // Calculate total dose in grams
          updateStep(
              'chlorine',
              'Add Chlorine',
              `Add ${formatValue(totalDose, 'Kg')} of HTH granular chlorine directly into the water while the pump is running.`
          );
      } else if (freeChlorine >= 1 && freeChlorine < 3 && clarity === 'Blue/White') {
          // Case: Free chlorine is between 1-3ppm and clarity is Blue/White -> Add granular chlorine
          const totalDose = chlorineDose * chlorineDifference; // Calculate total dose in grams
          updateStep(
              'chlorine',
              'Add Chlorine',
              `Add ${formatValue(totalDose, 'Kg')} of HTH granular chlorine directly into the water while the pump is running.`
          );
      } else if (freeChlorine >= 3) {
          // Case: Free chlorine is above 3ppm -> No action required
          updateStep('chlorine');
      } else {
          // Default case -> No clear action
          updateStep('chlorine', 'Chlorine Levels', 'Please verify your pool conditions and try again.');
      }
  }
    function checkAlgaecide() {
      const algaeDoses = { 'Lite Green/Clear': 25, 'Green/Cloudy': 30, 'Dark Green/Very Cloudy': 35 };
      if (clarity in algaeDoses) {
        const dose = algaeDoses[clarity] * volume;
        updateStep('algaecide', 'Add algaecide', `Add ${formatValue(dose, 'L')} of DQ80 directly in to the pool water while pool pump is running.`);
      } else {
        updateStep('algaecide');
      }
    }
  
    function checkCopperLevel() {
      if (copper > 0) {
        const copperTreatment = 20 * volume;
        updateStep('copper', 'Add Metal Remover', `Add ${formatValue(copperTreatment, 'L')} of metal remover directly in to pool water while pool pump is running. Allow pump to run for 2 hours before continuing to the next step.`);
      } else {
        updateStep('copper', '', '');
      }
    }
  
    function checkClarifier() {
      if (['Blue/White','Green/Cloudy', 'Dark Green/Very Cloudy'].includes(clarity)) {
        updateStep('clarity', 'Add Clarifier', `Add 2 supper clear tabs directly into the skimmer basket or pump basket. Run pool pump for 48 hours before doing a backwash and rinse to clean the filter. If pool remains cloudy, repeat this step.`);
      }
      else {
        updateStep('clarity', '', '');
      }
    }
  
    updateStep('backwash', 'Backwash and rinse', 'Perform a backwash and rinse procedure before adding chemicals.');
    calcPh();
    calcAlkalinity();
    calcChlorine();
    checkAlgaecide();
    checkCopperLevel();
    checkClarifier();
    calcStabilizer();
    });
  
  document.getElementById('printResults').addEventListener('click', function () {
    window.print(); // This will print the full page
  });
  
  document.getElementById('newTest').addEventListener('click', function () {
    window.location.reload();
  });

  // Get the select element
const selectElement1 = document.getElementById('surface');

// Add an event listener to detect changes
selectElement1.addEventListener('change', function () {
    // Check if an option is selected
    if (selectElement1.value !== "") {
        selectElement1.style.color = "black"; // Change font color to black
    }
});

const selectElement2 = document.getElementById('clarity');


// Add an event listener to detect changes
selectElement2.addEventListener('change', function () {
    // Check if an option is selected
    if (selectElement2.value !== "") {
        selectElement2.style.color = "black"; // Change font color to black
    }
});
